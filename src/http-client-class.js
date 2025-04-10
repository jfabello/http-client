/**
 * Promise-based HTTP and HTTPS client for Node.js class.
 * @module jfabello/http-client-class
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// TODO Remove the dependency on the "content-type" module.

// Sets strict mode
"use strict";

// Module imports
const http = require("node:http");
const https = require("node:https");
const { EventEmitter } = require("node:events");
const contentType = require("content-type");
const { createErrorFromSystemErrorCode, errors: systemErrors } = require("@jfabello/system-errors");
const HTTPResponse = require("./http-response.js");

// Constants
const constants = require("./http-client-constants.js");

// Defaults
const defaults = require("./http-client-defaults.js");

// Errors
const errors = require("./http-client-errors.js");

/**
 * HTTP client class.
 * @class HTTPClient
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
	/** @type {symbol} */ #clientState = null;
	/** @type {EventEmitter} */ #clientEmitter = null;
	/** @type {http.ClientRequest} */ #clientRequest = null;
	/** @type {http.IncomingMessage} */ #clientResponse = null;
	/** @type {number} */ #clientTimeout = null;
	/** @type {URL} */ #requestURL = null;
	/** @type {object} */ #requestOptions = {};
	/** @type {string|object|Buffer} */ #requestBody = null;
	/** @type {string} */ #requestBodyEncoding = null;
	/** @type {Promise<HTTPResponse>} */ #requestPromise = null;
	/** @type {Function} */ #requestPromiseResolve = null;
	/** @type {Function} */ #requestPromiseReject = null;
	/** @type {Promise<boolean>} */ #cancelPromise = null;
	/** @type {object} */ #httpApi = null;
	/** @type {HTTPResponse} */ #httpResponse = null;
	/** @type {Error[]} */ #systemErrors = [];
	/** @type {boolean} */ #teardownInitiated = false;
	/** @type {NodeJS.Timeout} */ #requestTimer = null;
	/** @type {NodeJS.Timeout} */ #responseTimer = null;
	/** @type {boolean} */ #autoJSONResponseParse = false;

	/**
	 * Read-only property representing the CREATED state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get CREATED() {
		return HTTPClient.#CREATED;
	}

	/**
	 * Read-only property representing the REQUESTING state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get REQUESTING() {
		return HTTPClient.#REQUESTING;
	}

	/**
	 * Read-only property representing the CANCELLING state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get CANCELLING() {
		return HTTPClient.#CANCELLING;
	}

	/**
	 * Read-only property representing the FULFILLED state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get FULFILLED() {
		return HTTPClient.#FULFILLED;
	}

	/**
	 * Read-only property representing the CANCELLED state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get CANCELLED() {
		return HTTPClient.#CANCELLED;
	}

	/**
	 * Read-only property representing the FAILED state.
	 * @static
	 * @readonly
	 * @type {symbol}
	 */
	static get FAILED() {
		return HTTPClient.#FAILED;
	}

	/**
	 * Read-only property that contains the HTTP client error classes as properties.
	 * @static
	 * @readonly
	 * @type {object}
	 */
	static get errors() {
		return errors;
	}

	/**
	 * Read-only property that returns the state of the HTTP client instance.
	 * @readonly
	 * @type {symbol}
	 */
	get state() {
		return this.#clientState;
	}

	/**
	 * Creates a new instance of the HTTP client.
	 * @constructor
	 * @param {string|URL} url The HTTP request URL
	 * @param {object} [options] The HTTP client options object.
	 * @param {string} [options.method="GET"] An optional string that specifies the HTTP request method. Can be GET, POST, PUT, DELETE or PATCH. The default is GET.
	 * @param {object} [options.headers={}] An optional key-value pairs object that specifies the HTTP request headers.
	 * @param {number} [options.timeout=defaults.DEFAULT_SOCKET_TIMEOUT] An optional positive integer that specifies the HTTP request timeout in milliseconds. The default is 60 seconds.
	 * @param {string|object|Buffer} [options.body] An optional string, serializable object or Buffer object that specifies the HTTP request body.
	 * @param {string} [options.bodyEncoding=defaults.DEFAULT_BODY_ENCODING] An optional string that specifies the HTTP request body encoding. The default is utf8.
	 * @param {boolean} [options.autoJSONResponseParse=defaults.DEFAULT_AUTO_JSON_RESPONSE_PARSE] An optional boolean that specifies if the HTTP response body should be automatically parsed as JSON. The default is true.
	 * @throws {ERROR_HTTP_REQUEST_URL_TYPE_INVALID} If the URL argument is not a string or URL object.
	 * @throws {ERROR_HTTP_REQUEST_URL_STRING_INVALID} If the URL argument string is not a valid URL
	 * @throws {ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID} If the URL protocol specified in the URL argument is not a HTTP or HTTPS.
	 * @throws {ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID} If the HTTP request method option is not a string.
	 * @throws {ERROR_HTTP_REQUEST_METHOD_INVALID} If the HTTP request method option is not a valid HTTP method.
	 * @throws {ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID} If the HTTP request headers option is not an object.
	 * @throws {ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID} If the HTTP request timeout option  is not an integer.
	 * @throws {ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS} If the HTTP request timeout option is less than 1 millisecond.
	 * @throws {ERROR_HTTP_REQUEST_BODY_TYPE_INVALID} If the HTTP request body option is not a string or Buffer object.
	 * @throws {ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID} If the HTTP request body encoding option is not a string.
	 * @throws {ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID} If the HTTP body encoding option is not a valid encoding.
	 * @throws {ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID} If the autoJSONResponseParse option is not a boolean.
	 */
	constructor(url, { method = "GET", headers = {}, timeout = defaults.DEFAULT_SOCKET_TIMEOUT, body, bodyEncoding = defaults.DEFAULT_BODY_ENCODING, autoJSONResponseParse = defaults.DEFAULT_AUTO_JSON_RESPONSE_PARSE } = {}) {
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

			this.#requestBody = body;

			if (typeof bodyEncoding !== "string") {
				throw new errors.ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID();
			}

			this.#requestBodyEncoding = bodyEncoding.toLowerCase();

			if (constants.BODY_ENCODINGS.includes(this.#requestBodyEncoding) === false) {
				throw new errors.ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID(this.#requestBodyEncoding);
			}
		}

		// Checks the passed automatic HTTP response JSON parsing option
		if (typeof autoJSONResponseParse !== "boolean") {
			throw new errors.ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID();
		}

		this.#autoJSONResponseParse = autoJSONResponseParse;

		// Selects the HTTP or HTTPS API, depending on the URL protocol
		this.#httpApi = this.#requestURL.protocol === "https:" ? https : http;

		// Sets the state of the HTTP client instance to CREATED
		this.#clientState = HTTPClient.#CREATED;
	}

	/**
	 * Executes the HTTP request. If the request is in the REQUESTING state, it returns the existing promise.
	 * @returns {Promise<HTTPResponse>} A promise that fulfills to an HTTP Response object if the HTTP request is performed succesfully, or rejects to an error if the HTTP request fails.
	 * @throws {ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE} If the HTTP client is not in a state that allows making HTTP requests.
	 * @throws {ERROR_HTTP_REQUEST_TIMED_OUT} If the HTTP request times out while making the request.
	 * @throws {ERROR_HTTP_REQUEST_BODY_TYPE_INVALID} If the HTTP request body type is not supported.
	 * @throws {ERROR_HTTP_RESPONSE_TIMED_OUT} If the HTTP request times out while waiting for a response.
	 * @throws {ERROR_HTTP_REQUEST_CANCELLED} If the HTTP request is cancelled.
	 * @throws {ERROR_HTTP_RESPONSE_BODY_NOT_PARSEABLE_AS_JSON} If the HTTP response body cannot be parsed as JSON.
	 * @throws {ERROR_UNKNOWN} If an unknown error occurs.
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
			this.#clientRequest.once("socket", () => {
				this.#sendRequestBody();
			});

			// Processes the HTTP request "finish" event
			this.#clientRequest.once("finish", () => {
				// Clears the request timer
				if (this.#requestTimer !== null) {
					clearTimeout(this.#requestTimer);
					this.#requestTimer = null;
				}

				// Starts the response timer
				this.#responseTimer = setTimeout(() => {
					this.#teardown(new errors.ERROR_HTTP_RESPONSE_TIMED_OUT(this.#requestURL.origin, this.#clientTimeout));
				}, this.#clientTimeout);
			});

			// Processes the HTTP request "error" event
			this.#clientRequest.on("error", (error) => {
				this.#systemErrors.push(error);
				this.#teardown(this.#convertSystemErrorToStandardError(error));
			});

			// Processes the HTTP client emitter "cancelhttprequest" event
			this.#clientEmitter.once("cancelhttprequest", () => {
				this.#teardown(new errors.ERROR_HTTP_REQUEST_CANCELLED(this.#requestURL.origin));
			});

			// Processes the HTTP request "response" event
			this.#clientRequest.once("response", (response) => {
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
				this.#clientResponse.once("end", () => {
					// Clear the response timer
					if (this.#responseTimer !== null) {
						clearTimeout(this.#responseTimer);
						this.#responseTimer = null;
					}

					// Sets the HTTP response property and tears down the client if the response body is empty
					if (responseBodyBufferSize === 0) {
						this.#httpResponse = new HTTPResponse(response.headers, response.statusCode, response.statusMessage);
						this.#teardown();
						return;
					}

					// Processes the HTTP response body chunks
					responseBodyBuffer = Buffer.concat(responseBodyArrayOfBuffers);
					responseBodyArrayOfBuffers = null; // Reduces memory usage

					// Gets the HTTP response content type and content type charset
					const responseContentType = this.#getResponseContentType();
					const responseContentTypeCharset = this.#getResponseContentTypeCharset() !== null ? this.#getResponseContentTypeCharset().toLowerCase() : "utf8";

					// Sets the HTTP response property and tears down the client if the automatic parsing of a JSON HTTP response is disabled, the response's content type is not application/json
					if (this.#autoJSONResponseParse === false || responseContentType !== "application/json" || constants.BODY_ENCODINGS.includes(responseContentTypeCharset) === false) {
						this.#httpResponse = new HTTPResponse(response.headers, response.statusCode, response.statusMessage, responseBodyBuffer);
						this.#teardown();
						return;
					}

					// Parses the HTTP response body as JSON
					let responseBodyJSON = null;
					try {
						// @ts-expect-error
						responseBodyJSON = JSON.parse(responseBodyBuffer.toString(responseContentTypeCharset));
					} catch (error) {
						this.#teardown(new errors.ERROR_HTTP_RESPONSE_BODY_NOT_PARSEABLE_AS_JSON());
						return;
					}

					// Sets the HTTP response property and tears down the client
					this.#httpResponse = new HTTPResponse(response.headers, response.statusCode, response.statusMessage, responseBodyJSON);
					this.#teardown();
					return;
				});
			});
		});

		return this.#requestPromise;
	}

	/**
	 * Requests the cancellation of the the HTTP request. If the request is in the CANCELLING state, it returns the existing promise.
	 * @returns {Promise<boolean>} A promise that fulfills to true when the HTTP request is successfully cancelled.
	 * @throws {ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE} If the HTTP client is not in a state that allows requesting the HTTP request cancellation.
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
	 * Sends the request body.
	 */
	#sendRequestBody() {
		// State variables
		let errorOccurred = false;

		// Starts the request timer
		this.#requestTimer = setTimeout(() => {
			this.#teardown(new errors.ERROR_HTTP_REQUEST_TIMED_OUT(this.#requestURL.origin, this.#clientTimeout));
		}, this.#clientTimeout);

		// Processes the HTTP request "error" event
		this.#clientRequest.once("error", (error) => {
			errorOccurred = true;
		});

		// Writes the request body
		if (this.#requestBody !== null) {
			let requestBodyBuffer = null;
			let requestBodyStream = null; // For a future feature that allows streaming the HTTP request body

			// Converts the HTTP request body string to a Buffer object, if needed
			try {
				requestBodyBuffer = this.#convertRequestBodyToBuffer();
			} catch (error) {
				this.#teardown(error);
				return;
			}

			// Throws an error if the HTTP request body type is not supported
			if (requestBodyBuffer === null && requestBodyStream === null) {
				this.#teardown(new errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID());
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

						if (errorOccurred === true) return;

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

				// Allows the event loop to process other events before writing the request body
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
	 * Converts the HTTP request body to a Buffer, if needed.
	 * @returns {Buffer} The HTTP request body as a Buffer object.
	 * @throws {ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE} If the HTTP request body object is not serializable.
	 */
	#convertRequestBodyToBuffer() {
		// Converts the HTTP request body string to a Buffer object
		if (typeof this.#requestBody === "string") {
			// @ts-expect-error
			return Buffer.from(this.#requestBody, this.#requestBodyEncoding);
		}

		// Converts the HTTP request body object to a Buffer object
		if (typeof this.#requestBody === "object" && this.#requestBody instanceof Buffer === false) {
			let serializedRequestBody = null;
			try {
				serializedRequestBody = JSON.stringify(this.#requestBody);
			} catch {
				throw new errors.ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE();
			}
			return Buffer.from(serializedRequestBody, "utf8");
		}

		// Uses the HTTP request body buffer directly
		if (typeof this.#requestBody === "object" && this.#requestBody instanceof Buffer === true) {
			return this.#requestBody;
		}

		throw new errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID();
	}

	/**
	 * Converts a system error to a standard error
	 * @param {Error} error A system error.
	 * @returns {Error} A standarized error, or ERROR_UNKNOWN if a passed error is not a system error.
	 */
	#convertSystemErrorToStandardError(error) {
		if ("code" in error) {
			// @ts-expect-error
			return createErrorFromSystemErrorCode(error.code);
		} else {
			return new errors.ERROR_UNKNOWN(error.message, error);
		}
	}

	/**
	 * Tears down the HTTP client
	 * @param {Error} [error=null] An optional standard error or a system error.
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

		// Allows the event loop to process other events before resolving or rejecting the HTTP request promise
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

	/**
	 * Returns the HTTP response content type
	 * @returns {string} The HTTP response content type, or null if the content type is not available.
	 */
	#getResponseContentType() {
		if (this.#clientResponse === null) {
			return null;
		}

		if ("headers" in this.#clientResponse === false) {
			return null;
		}

		if ("content-type" in this.#clientResponse.headers === false) {
			return null;
		}

		let contentTypeObject = null;

		try {
			contentTypeObject = contentType.parse(this.#clientResponse.headers["content-type"]);
		} catch {
			return null;
		}

		if ("type" in contentTypeObject === false) {
			return null;
		}

		return contentTypeObject.type;
	}

	/**
	 * Returns the HTTP response content type charset
	 * @returns {string} The HTTP response content type charset, or null if the content type charset is not available.
	 */
	#getResponseContentTypeCharset() {
		if (this.#clientResponse === null) {
			return null;
		}

		if ("headers" in this.#clientResponse === false) {
			return null;
		}

		if ("content-type" in this.#clientResponse.headers === false) {
			return null;
		}

		let contentTypeObject = null;

		try {
			contentTypeObject = contentType.parse(this.#clientResponse.headers["content-type"]);
		} catch {
			return null;
		}

		if ("parameters" in contentTypeObject === false) {
			return null;
		}

		if ("charset" in contentTypeObject.parameters === false) {
			return null;
		}

		return contentTypeObject.parameters["charset"];
	}
}

module.exports = { HTTPClient, HTTPResponse };
