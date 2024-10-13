/**
 * @module jfabello/http-client
 * @description Promise-based HTTP and HTTPS client.
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// TODO LIST
// TODO Document the errors that can be thrown and the events that can be fired

// Sets strict mode
"use strict";

// Module imports
const http = require("node:http");
const https = require("node:https");
const { EventEmitter } = require("node:events");
const HTTPResponse = require("./http-response.js");

// Constants
const constants = require("./constants.js");

// Defaults
const defaults = require("./defaults.js");

// Errors
const commonErrors = require("@jfabello/common-errors");
const systemErrors = require("@jfabello/system-errors");
const httpClientErrors = require("./errors.js");
const errors = Object.assign({}, httpClientErrors, systemErrors, commonErrors);
delete errors.createErrorFromSystemErrorCode;
Object.freeze(errors);

/**
 * @description HTTP client class.
 */
class HTTPClient {
	// Private class constants
	static #CREATED = Symbol("CREATED");
	static #REQUESTING = Symbol("REQUESTING");
	static #CANCELLING = Symbol("CANCELLING");
	static #FULFILLED = Symbol("FULFILLED");
	static #CANCELLED = Symbol("CANCELLED");
	static #FAILED = Symbol("FAILED");

	// Private instance variables
	#clientState = null;
	#clientEmitter = null;
	#clientRequest = null;
	#clientResponse = null;
	#clientTimeout = null;
	#requestURL = null;
	#requestOptions = {};
	#requestBody = null;
	#requestBodyEncoding = null;
	#requestPromise = null;
	#requestPromiseResolve = null;
	#requestPromiseReject = null;
	#cancelPromise = null;
	#httpApi = null;
	#httpResponse = null;
	#systemErrors = [];
	#teardownInitiated = false;
	#requestTimer = null;
	#responseTimer = null;

	/**
	 * @description Read-only constant representing the CREATED state.
	 */
	static get CREATED() {
		return HTTPClient.#CREATED;
	}

	/**
	 * @description Read-only constant representing the REQUESTING state.
	 */
	static get REQUESTING() {
		return HTTPClient.#REQUESTING;
	}

	/**
	 * @description Read-only constant representing the CANCELLING state.
	 */
	static get CANCELLING() {
		return HTTPClient.#CANCELLING;
	}

	/**
	 * @description Read-only constant representing the FULFILLED state.
	 */
	static get FULFILLED() {
		return HTTPClient.#FULFILLED;
	}

	/**
	 * @description Read-only constant representing the CANCELLED state.
	 */
	static get CANCELLED() {
		return HTTPClient.#CANCELLED;
	}

	/**
	 * @description Read-only constant representing the FAILED state.
	 */
	static get FAILED() {
		return HTTPClient.#FAILED;
	}

	/**
	 * @description Read-only object that contains the HTTP client error classes as properties.
	 */
	static get errors() {
		return errors;
	}

	/**
	 * @description The state of an HTTP client instance.
	 */
	get state() {
		return this.#clientState;
	}

	/**
	 * @description Creates a new instance of the HTTP client.
	 * @param {string | URL} url The request URL
	 * @param {object} options The HTTP client options object.
	 * @param {string} options.method An optional string that specifies the HTTP request method. Can be GET, POST, PUT, DELETE or PATCH. The default is GET.
	 * @param {object} options.headers An optional key-value pairs object that specifies the HTTP request headers.
	 * @param {number} options.timeout An optional positive integer that specifies the HTTP request timeout. The default is 60 seconds.
	 * @param {string | object | Buffer} options.body An optional string, object or Buffer that specifies the HTTP request body.
	 * @param {string} options.bodyEncoding An optional string that specifies the HTTP request body encoding. The default is utf8.
	 */
	constructor(url, { method = "GET", headers = {}, timeout = defaults.DEFAULT_SOCKET_TIMEOUT, body, bodyEncoding = "utf8" } = {}) {
		// Checks the passed HTTP request URL
		if (typeof url !== "string" && typeof url !== "object") {
			throw new errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID();
		}

		if (typeof url === "object" && url instanceof URL === false) {
			throw new errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID();
		}

		if (typeof url === "string") {
			try {
				this.#requestURL = new URL(url);
			} catch (error) {
				throw new errors.ERROR_HTTP_REQUEST_URL_STRING_INVALID();
			}
		} else {
			this.#requestURL = url;
		}

		if (this.#requestURL.protocol !== "http:" && this.#requestURL.protocol !== "https:") {
			throw new errors.ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID(this.#requestURL.protocol);
		}

		// Checks the passed HTTP request method
		if (typeof method !== "string") {
			throw new errors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID();
		}

		this.#requestOptions.method = method.toUpperCase();

		if (constants.HTTP_METHODS.includes(this.#requestOptions.method) === false) {
			throw new errors.ERROR_HTTP_REQUEST_METHOD_INVALID(this.#requestOptions.method);
		}

		// Checks the passed HTTP request headers
		if (typeof headers !== "undefined") {
			if (typeof headers !== "object") {
				throw new errors.ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID();
			}

			this.#requestOptions.headers = headers;
		}

		// Checks the passed HTTP request timeout
		if (Number.isInteger(timeout) === false) {
			throw new errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID();
		}
		if (timeout < 1) {
			throw new errors.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS();
		}

		this.#clientTimeout = timeout;

		// Checks the passed HTTP request body
		if (typeof body !== "undefined") {
			if (typeof body !== "string" && typeof body !== "object") {
				throw new errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID();
			}
			if (typeof body === "object" && body instanceof Buffer === false) {
				throw new errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID();
			}

			this.#requestBody = body;

			if (typeof bodyEncoding !== "string") {
				throw new errors.ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID();
			}

			this.#requestBodyEncoding = bodyEncoding.toLowerCase();

			if (constants.BODY_ENCODINGS.includes(this.#requestBodyEncoding) === false) {
				throw new errors.ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID(this.#requestBodyEncoding);
			}
		}

		// Selects the HTTP or HTTPS API, depending on the URL protocol
		this.#httpApi = this.#requestURL.protocol === "https:" ? https : http;

		// Sets the state of the HTTP client instance to CREATED
		this.#clientState = HTTPClient.#CREATED;
	}

	/**
	 * @description Executes the HTTP request.
	 * @returns {Promise} A promise that fulfills to an HTTP response object if the HTTP request is performed succesfully, or rejects to an error if the HTTP request fails.
	 */
	makeRequest() {
		// Returns the HTTP request promise object if the HTTP client state is already REQUESTING
		if (this.#clientState === HTTPClient.#REQUESTING) {
			return this.#requestPromise;
		}

		// Throws an error if the HTTP client is not in a state that allows making HTTP requests
		if (this.#clientState !== HTTPClient.#CREATED) {
			throw new errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE();
		}

		// Sets the HTTP client state to REQUESTING
		this.#clientState = HTTPClient.#REQUESTING;

		// Prepares the HTTP client event emitter
		this.#clientEmitter = new EventEmitter();

		// Prepares the HTTP client request promise
		this.#requestPromise = new Promise((resolve, reject) => {
			this.#requestPromiseResolve = resolve;
			this.#requestPromiseReject = reject;

			// Initiates the HTTP request
			this.#clientRequest = this.#httpApi.request(this.#requestURL, this.#requestOptions);

			// Processes the HTTP request "socket" event
			this.#clientRequest.on("socket", () => {
				this.#sendRequestBody();
			});

			// Processes the HTTP request "finish" event
			this.#clientRequest.on("finish", () => {
				// Clears the request timer
				if (this.#requestTimer !== null) {
					clearTimeout(this.#requestTimer);
					this.#requestTimer = null;
				}

				// Starts the response timer
				this.#responseTimer = setTimeout(() => {
					// TODO Replace the error from an ERROR_HTTP_REQUEST_TIMED_OUT to an ERROR_HTTP_RESPONSE_TIMED_OUT
					this.#teardown(new errors.ERROR_HTTP_REQUEST_TIMED_OUT(this.#requestURL.origin, this.#clientTimeout));
				}, this.#clientTimeout);
			});

			// Processes the HTTP request "error" event
			this.#clientRequest.on("error", (error) => {
				this.#systemErrors.push(error);
				this.#teardown(this.#convertSystemErrorToStandardError(error));
			});

			// Processes the HTTP client emitter "cancelhttprequest" event
			this.#clientEmitter.on("cancelhttprequest", () => {
				this.#teardown(new errors.ERROR_HTTP_REQUEST_CANCELLED(this.#requestURL.origin));
			});

			// Processes the HTTP request "response" event
			this.#clientRequest.on("response", (response) => {
				// HTTP response state variables
				let responseBodyBuffer = null;
				let responseBodyStream = null; // For a future feature that allows streaming the HTTP response body
				let responseBodyBufferSize = 0;
				let responseBodyArrayOfBuffers = [];

				this.#clientResponse = response;

				// Processes the HTTP response "error" event
				this.#clientResponse.on("error", (error) => {
					this.#systemErrors.push(error);
					this.#teardown(this.#convertSystemErrorToStandardError(error));
				});

				// Processes the HTTP response "data" event
				this.#clientResponse.on("data", (chunk) => {
					if (this.#responseTimer !== null) {
						this.#responseTimer.refresh();
					}
					responseBodyArrayOfBuffers.push(chunk);
					responseBodyBufferSize = responseBodyBufferSize + chunk.length;
				});

				// Processes the HTTP response "end" event
				this.#clientResponse.on("end", () => {
					// Clear the response timer
					if (this.#responseTimer !== null) {
						clearTimeout(this.#responseTimer);
						this.#responseTimer = null;
					}

					// Processes the HTTP response body chunks and adds the body to the HTTP response object
					if (responseBodyBufferSize > 0) {
						responseBodyBuffer = Buffer.concat(responseBodyArrayOfBuffers);
						responseBodyArrayOfBuffers = null; // Reduces memory usage
						this.#httpResponse = new HTTPResponse({
							headers: response.headers,
							statusCode: response.statusCode,
							statusMessage: response.statusMessage,
							body: responseBodyBuffer
						});
					} else {
						this.#httpResponse = new HTTPResponse({
							headers: response.headers,
							statusCode: response.statusCode,
							statusMessage: response.statusMessage
						});
					}

					this.#teardown();
				});
			});
		});

		return this.#requestPromise;
	}

	/**
	 * @description Requests the cancellation of the the HTTP request.
	 * @returns {Promise} A promise that fulfills to true when the HTTP request is successfully cancelled.
	 */
	cancelRequest() {
		// Returns the HTTP cancel request promise object if the HTTP client state is already CANCELLING
		if (this.#clientState === HTTPClient.#CANCELLING) {
			return this.#cancelPromise;
		}

		// Throws an error if the HTTP client is not in a state that allows requesting the HTTP request cancellation
		if (this.#clientState !== HTTPClient.#REQUESTING) {
			throw new errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE();
		}

		this.#clientState = HTTPClient.#CANCELLING;

		this.#cancelPromise = new Promise((resolve, reject) => {
			this.#clientEmitter.once("httprequestcancelled", () => {
				resolve(true);
			});
		});

		this.#clientEmitter.emit("cancelhttprequest");

		return this.#cancelPromise;
	}

	/**
	 * @description Sends the request body.
	 * @param { http.ClientRequest } request The HTTP client request object.
	 * @private
	 */
	#sendRequestBody() {
		// State variables
		let errorOcurred = false;

		// Starts the request timer
		this.#requestTimer = setTimeout(() => {
			this.#teardown(new errors.ERROR_HTTP_REQUEST_TIMED_OUT(this.#requestURL.origin, this.#clientTimeout));
		}, this.#clientTimeout);

		// Processes the HTTP response "error" event
		this.#clientRequest.on("error", (error) => {
			errorOcurred = true;
		});

		// Writes the request body
		if (this.#requestBody !== null) {
			let requestBodyBuffer = null;
			let requestBodyStream = null; // For a future feature that allows streaming of the HTTP request body

			if (typeof this.#requestBody === "string") {
				requestBodyBuffer = new Buffer.from(this.#requestBody, this.#requestBodyEncoding);
				this.#requestBody = requestBodyBuffer; // Reduces memory usage
			}
			if (typeof this.#requestBody === "object" && this.#requestBody instanceof Buffer === true) {
				requestBodyBuffer = this.#requestBody;
			}
			if (requestBodyBuffer === null && requestBodyStream === null) {
				this.#teardown(new errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID()); // Thrown if the HTTP request body type is not supported
				return;
			}

			if (requestBodyBuffer !== null) {
				let requestBodyBufferPointer = 0;
				let requestBodyBufferSize = requestBodyBuffer.length;
				let maxRequestChunkSize = this.#clientRequest.writableHighWaterMark;

				// Sets the "Content-Length" header
				this.#clientRequest.setHeader("Content-Length", requestBodyBufferSize);

				let writeRequestBody = () => {
					while (requestBodyBufferPointer < requestBodyBufferSize) {
						let writeRequestBodyResult = null;
						let requestBodyChunkSize = null;
						let requestBodyChunk = null;

						if (errorOcurred === true) return;

						// Calculates the HTTP request body chunk size
						if (requestBodyBufferSize - requestBodyBufferPointer < maxRequestChunkSize) {
							requestBodyChunkSize = requestBodyBufferSize - requestBodyBufferPointer;
						} else {
							requestBodyChunkSize = maxRequestChunkSize;
						}

						// Gets a chunk of the HTTP request body buffer
						requestBodyChunk = requestBodyBuffer.subarray(requestBodyBufferPointer, requestBodyBufferPointer + requestBodyChunkSize);

						// Writes a chunk of the HTTP request body buffer
						writeRequestBodyResult = this.#clientRequest.write(requestBodyChunk);
						requestBodyBufferPointer = requestBodyBufferPointer + requestBodyChunkSize;
						if (this.#requestTimer !== null) {
							this.#requestTimer.refresh();
						}
						if (writeRequestBodyResult === false) {
							this.#clientRequest.once("drain", writeRequestBody);
							return;
						}
					}
					// Finishes writing the request body
					this.#clientRequest.end();
				};
				setImmediate(() => {
					writeRequestBody();
				});
			}
		} else {
			// No HTTP request body
			this.#clientRequest.end();
		}
	}

	/**
	 * @description Converts a system error to a standard error
	 * @param {Error} error A system error.
	 * @returns {Error} A standarized error, or ERROR_UNKNOWN if a passed error is not a system error.
	 */
	#convertSystemErrorToStandardError(error) {
		if ("code" in error) {
			return systemErrors.createErrorFromSystemErrorCode(error.code);
		} else {
			return new errors.ERROR_UNKNOWN();
		}
	}

	/**
	 * @description Tears down the HTTP client
	 * @param {Error} error An optional standard error or a system error.
	 */
	#teardown(error = null) {
		if (this.#teardownInitiated === true) return;

		this.#teardownInitiated = true;

		if (this.#requestTimer !== null) {
			clearTimeout(this.#requestTimer);
			this.#requestTimer = null;
		}

		if (this.#responseTimer !== null) {
			clearTimeout(this.#responseTimer);
			this.#responseTimer = null;
		}

		if (error !== null) {
			if (this.#clientResponse !== null) {
				this.#clientResponse.destroy();
			}

			if (this.#clientRequest !== null) {
				this.#clientRequest.destroy();
			}
		}

		setImmediate(() => {
			if (error !== null) {
				// Emits the "httprequestcancelled" event if the HTTP request was cancelled
				if (error instanceof errors.ERROR_HTTP_REQUEST_CANCELLED) {
					this.#clientEmitter.emit("httprequestcancelled");
					this.#clientState = HTTPClient.#CANCELLED;
				} else {
					this.#clientState = HTTPClient.#FAILED;
				}
				this.#requestPromiseReject(error);
			} else {
				if (this.#httpResponse !== null) {
					this.#clientState = HTTPClient.#FULFILLED;
					this.#requestPromiseResolve(this.#httpResponse);
				} else {
					this.#clientState = HTTPClient.#FAILED;
					this.#requestPromiseReject(new errors.ERROR_UNKNOWN());
				}
			}
		});
	}
}

module.exports = { HTTPClient, HTTPResponse };
