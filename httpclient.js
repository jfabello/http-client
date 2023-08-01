/**
 * @module jfabello/httpclient
 * @description Promise-based HTTP and HTTPS client.
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

/**
 * @typedef {object} httpRequestOptions
 * @property {object} [headers] - An object containing the HTTP request headers.
 * @property {number} [timeout] - A number specifying the HTTP request socket timeout in milliseconds. The default is DEFAULT_SOCKET_TIMEOUT miliseconds.
 * @property {string | Buffer} [body] - A string or a Buffer object with the request body.
 * @property {string} [bodyEncoding] - A string like "utf8", "utf16le" or "latin1" specifying the request body encoding if the body is passed as a string. The default is "utf8".
 */

/**
 * @typedef {object} httpResponse
 * @property {object} headers - An object containing the HTTP response headers.
 * @property {number} statusCode - The 3-digit HTTP response status code.
 * @property {string} statusMessage - The HTTP response status mesage.
 * @property {Buffer} [body] - A Buffer object with the response body.
 */

/**
 * @typedef {object} httpClientRequest
 * @property {Promise} promise - A promise that fulfills to an httpResponse object.
 * @property {function} cancel - Cancels the HTTP request. Returns a promise that fulfills to the string "CANCELLED" if the HTTP request was successfully cancelled, rejects if the HTTP request could not be cancelled after a number of miliseconds.
 */

// Module imports
const http = require("node:http");
const https = require("node:https");
const { EventEmitter } = require("node:events");
const lodash = require("lodash");

// Defaults
const defaults = require("./defaults.js");
const DEFAULT_SOCKET_TIMEOUT = defaults.DEFAULT_SOCKET_TIMEOUT;
exports.defaults = defaults;

// Constants
const constants = require("./constants.js");
const HTTP_METHODS = constants.HTTP_METHODS;
exports.constants = constants;

// Errors
const commonErrors = require("@jfabello/commonerrors");
const ERROR_UNKNOWN = commonErrors.ERROR_UNKNOWN;
const systemErrors = require("@jfabello/systemerrors");
const ERROR_NO_ACCESS = systemErrors.ERROR_NO_ACCESS;
const ERROR_ADDRESS_IN_USE = systemErrors.ERROR_ADDRESS_IN_USE;
const ERROR_ADDRESS_NOT_AVAILABLE = systemErrors.ERROR_ADDRESS_NOT_AVAILABLE;
const ERROR_ADDRESS_FAMILY_NOT_SUPPORTED = systemErrors.ERROR_ADDRESS_FAMILY_NOT_SUPPORTED;
const ERROR_SOCKET_CONNECTION_IN_PROGRESS = systemErrors.ERROR_SOCKET_CONNECTION_IN_PROGRESS;
const ERROR_INVALID_DATA_MESSAGE = systemErrors.ERROR_INVALID_DATA_MESSAGE;
const ERROR_DEVICE_OR_RESOURCE_BUSY = systemErrors.ERROR_DEVICE_OR_RESOURCE_BUSY;
const ERROR_OPERATION_CANCELLED = systemErrors.ERROR_OPERATION_CANCELLED;
const ERROR_NETWORK_CONNECTION_ABORTED = systemErrors.ERROR_NETWORK_CONNECTION_ABORTED;
const ERROR_NETWORK_CONNECTION_REFUSED = systemErrors.ERROR_NETWORK_CONNECTION_REFUSED;
const ERROR_NETWORK_CONNECTION_RESET = systemErrors.ERROR_NETWORK_CONNECTION_RESET;
const ERROR_DESTINATION_ADDRESS_REQUIRED = systemErrors.ERROR_DESTINATION_ADDRESS_REQUIRED;
const ERROR_HOST_UNREACHABLE = systemErrors.ERROR_HOST_UNREACHABLE;
const ERROR_ILLEGAL_BYTE_SEQUENCE = systemErrors.ERROR_ILLEGAL_BYTE_SEQUENCE;
const ERROR_OPERATION_ALREADY_IN_PROGRESS = systemErrors.ERROR_OPERATION_ALREADY_IN_PROGRESS;
const ERROR_UNSPECIFIED_IO_ERROR = systemErrors.ERROR_UNSPECIFIED_IO_ERROR;
const ERROR_SOCKET_CONNECTED = systemErrors.ERROR_SOCKET_CONNECTED;
const ERROR_MESSAGE_TOO_LONG = systemErrors.ERROR_MESSAGE_TOO_LONG;
const ERROR_MULTIHOP_ATTEMPTED = systemErrors.ERROR_MULTIHOP_ATTEMPTED;
const ERROR_NETWORK_IS_DOWN = systemErrors.ERROR_NETWORK_IS_DOWN;
const ERROR_CONNECTION_ABORTED_BY_NETWORK = systemErrors.ERROR_CONNECTION_ABORTED_BY_NETWORK;
const ERROR_NETWORK_UNREACHABLE = systemErrors.ERROR_NETWORK_UNREACHABLE;
const ERROR_NO_BUFFER_SPACE_AVAILABLE = systemErrors.ERROR_NO_BUFFER_SPACE_AVAILABLE;
const ERROR_NO_SUCH_DEVICE = systemErrors.ERROR_NO_SUCH_DEVICE;
const ERROR_LINK_SEVERED = systemErrors.ERROR_LINK_SEVERED;
const ERROR_NOT_ENOUGH_SPACE = systemErrors.ERROR_NOT_ENOUGH_SPACE;
const ERROR_PROTOCOL_NOT_AVAILABLE = systemErrors.ERROR_PROTOCOL_NOT_AVAILABLE;
const ERROR_NO_STREAM_RESOURCES_AVAILABLE = systemErrors.ERROR_NO_STREAM_RESOURCES_AVAILABLE;
const ERROR_FUNCTION_NOT_IMPLEMENTED = systemErrors.ERROR_FUNCTION_NOT_IMPLEMENTED;
const ERROR_SOCKET_NOT_CONNECTED = systemErrors.ERROR_SOCKET_NOT_CONNECTED;
const ERROR_HOSTNAME_NOT_FOUND = systemErrors.ERROR_HOSTNAME_NOT_FOUND;
const ERROR_NOT_A_SOCKET = systemErrors.ERROR_NOT_A_SOCKET;
const ERROR_OPERATION_NOT_SUPPORTED = systemErrors.ERROR_OPERATION_NOT_SUPPORTED;
const ERROR_INAPPROPRIATE_IO_CONTROL_OPERATION = systemErrors.ERROR_INAPPROPRIATE_IO_CONTROL_OPERATION;
const ERROR_NO_SUCH_DEVICE_OR_ADDRESS = systemErrors.ERROR_NO_SUCH_DEVICE_OR_ADDRESS;
const ERROR_OPERATION_NOT_SUPPORTED_ON_SOCKET = systemErrors.ERROR_OPERATION_NOT_SUPPORTED_ON_SOCKET;
const ERROR_OPERATION_NOT_PERMITTED = systemErrors.ERROR_OPERATION_NOT_PERMITTED;
const ERROR_BROKEN_PIPE = systemErrors.ERROR_BROKEN_PIPE;
const ERROR_PROTOCOL_ERROR = systemErrors.ERROR_PROTOCOL_ERROR;
const ERROR_PROTOCOL_NOT_SUPPORTED = systemErrors.ERROR_PROTOCOL_NOT_SUPPORTED;
const ERROR_WRONG_PROTOCOL_TYPE_FOR_SOCKET = systemErrors.ERROR_WRONG_PROTOCOL_TYPE_FOR_SOCKET;
const ERROR_CONNECTION_TIMEOUT = systemErrors.ERROR_CONNECTION_TIMEOUT;
const httpClientErrors = require("./errors.js");
const ERROR_HTTP_REQUEST_URL_TYPE_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID;
const ERROR_HTTP_REQUEST_URL_STRING_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_URL_STRING_INVALID;
const ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID;
const ERROR_HTTP_REQUEST_METHOD_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_METHOD_INVALID;
const ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID;
const ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID;
const ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID;
const ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS = httpClientErrors.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS;
const ERROR_HTTP_REQUEST_BODY_TYPE_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID;
const ERROR_HTTP_REQUEST_OPTIONS_PROPERTY_INVALID = httpClientErrors.ERROR_HTTP_REQUEST_OPTIONS_PROPERTY_INVALID;
const ERROR_HTTP_REQUEST_TIMED_OUT = httpClientErrors.ERROR_HTTP_REQUEST_TIMED_OUT;
const ERROR_HTTP_REQUEST_CANCELLED = httpClientErrors.ERROR_HTTP_REQUEST_CANCELLED;
exports.errors = lodash.merge(httpClientErrors, systemErrors, commonErrors);
delete exports.errors.createErrorFromSystemErrorCode;

// Prepares logToConsole
const { getLogToConsoleInstance } = require("@jfabello/logtoconsole");
const logToConsole = getLogToConsoleInstance();
logToConsole.setLogLevel(logToConsole.DEBUG);

/**
 * @function makeHttpRequest
 * @description - Makes an HTTP request
 * @param {string | URL} url - The URL.
 * @param {string} [method=GET] - A optional string specifying the HTTP request method. Can be GET, POST, PUT, DELETE or PATCH. The default is GET.
 * @param {httpRequestOptions} [options] - An optional HTTP request options object.
 * @returns {httpClientRequest}
 */

exports.makeHttpRequest = function (url, method = "GET", options = {}) {
	// Clones the options object parameter
	options = lodash.clone(options);

	// Checks the passed URL
	if (typeof url !== "string" && typeof url !== "object") {
		throw new ERROR_HTTP_REQUEST_URL_TYPE_INVALID();
	}

	if (typeof url === "object" && url instanceof URL === false) {
		throw new ERROR_HTTP_REQUEST_URL_TYPE_INVALID();
	}

	if (typeof url === "string") {
		try {
			url = new URL(url);
		} catch (error) {
			throw new ERROR_HTTP_REQUEST_URL_STRING_INVALID();
		}
	}

	// Checks the passed HTTP request method
	if (typeof method !== "string") {
		throw new ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID();
	}

	method = method.toUpperCase();

	if (lodash.includes(HTTP_METHODS, method) === false) {
		throw new ERROR_HTTP_REQUEST_METHOD_INVALID(method);
	}

	// Checks the passed HTTP request options object
	if (typeof options !== "object" && typeof options !== "undefined") {
		throw new ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID();
	}

	for (const property of Object.keys(options)) {
		switch (property) {
			case "headers":
				if (typeof options[property] !== "object") {
					throw new ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID();
				}
				break;
			case "timeout":
				if (Number.isInteger(options[property]) !== true) {
					throw new ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID();
				}
				if (options[property] < 1) {
					throw new ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS();
				}
				break;
			case "body":
				if (typeof options[property] !== "string" && typeof options[property] !== "object") {
					throw new ERROR_HTTP_REQUEST_BODY_TYPE_INVALID();
				}
				if (options[property] instanceof Buffer === false) {
					throw new ERROR_HTTP_REQUEST_BODY_TYPE_INVALID();
				}
				break;
			default:
				throw new ERROR_HTTP_REQUEST_OPTIONS_PROPERTY_INVALID(property);
		}
	}

	// Builds the final HTTP request options object
	const defaultOptions = {
		timeout: DEFAULT_SOCKET_TIMEOUT,
		method: method,
		bodyEncoding: "utf8"
	};

	options = lodash.defaults(options, defaultOptions);

	// Selects the HTTP or HTTPS API, depending on the URL protocol
	const httpApi = url.protocol === "https:" ? https : http;

	// Prepares the HTTP request event emitter and promise
	const httpRequestEmitter = new EventEmitter();
	const httpRequestPromise = new Promise(httpRequestPromiseFunction);

	return {
		promise: httpRequestPromise,
		cancel: cancelHttpRequest
	};

	function httpRequestPromiseFunction(resolve, reject) {
		// HTTP request state variables
		let httpRequestLastError = null;
		let httpResponse = null;
		let hasHttpResponse = false;

		// "error" event handling function
		let handleErrorEvent = function (error) {
			if (
				error instanceof ERROR_HTTP_REQUEST_TIMED_OUT ||
				error instanceof ERROR_HTTP_REQUEST_CANCELLED ||
				error instanceof ERROR_HTTP_REQUEST_BODY_TYPE_INVALID
			) {
				httpRequestLastError = error;
				return;
			}

			if ("code" in error) {
				httpRequestLastError = systemErrors.createErrorFromSystemErrorCode(error.code);
				return;
			}

			httpRequestLastError = new ERROR_UNKNOWN();
		};

		// "close" event handling function
		let handleCloseEvent = function () {
			if (httpRequestLastError !== null) {
				// Emits the "httprequestcancelled" event if the HTTP request was cancelled
				if (httpRequestLastError instanceof ERROR_HTTP_REQUEST_CANCELLED) {
					httpRequestEmitter.emit("httprequestcancelled");
				}
				reject(httpRequestLastError);
				return;
			}

			// This should not happen, but let's handle it just in case it does
			if (httpResponse === null) {
				reject(new ERROR_UNKNOWN());
				return;
			}

			resolve(httpResponse);
		};

		// Initiates he HTTP request
		const request = httpApi.request(url, options);

		// Processes HTTP request "error" event if there is no response yet
		request.on("error", (error) => {
			// logToConsole.debug(`Request "error" event fired.`);

			if (hasHttpResponse === false) {
				handleErrorEvent(error);
			}
		});

		// Processes the HTTP request "timeout" event
		request.on("timeout", () => {
			// logToConsole.debug(`Request "timeout" event fired.`);

			if (hasHttpResponse === false) {
				request.destroy(new ERROR_HTTP_REQUEST_TIMED_OUT(url.origin, options.timeout));
			}
		});

		// Processes the HTTP request emitter "httprequestcancel" event
		httpRequestEmitter.on("cancelhttprequest", () => {
			if (hasHttpResponse === false) {
				request.destroy(new ERROR_HTTP_REQUEST_CANCELLED(url.origin));
			}
		});

		// Processes the HTTP request "socket" event
		request.on("socket", () => {
			// logToConsole.debug(`Request "socket" event fired.`);

			// Writes the request body
			if ("body" in options) {
				let requestBodyBuffer = null;
				let requestBodyStream = null; // For a future feature that allows streaming the HTTP request body

				if (typeof options.body === "string") {
					requestBodyBuffer = new Buffer.from(options.body, options.bodyEncoding);
					options.body = requestBodyBuffer; // Reduces memory usage
				}
				if (typeof options.body === "object" && options.body instanceof Buffer === true) {
					requestBodyBuffer = options.body;
				}
				if (requestBodyBuffer === null && requestBodyStream === null) {
					request.destroy(new ERROR_HTTP_REQUEST_BODY_TYPE_INVALID()); // Thrown if the HTTP request body type is not supported
				}

				if (requestBodyBuffer !== null) {
					let requestBodyBufferPointer = 0;
					let requestBodyBufferSize = requestBodyBuffer.length;
					let maxRequestChunkSize = request.writableHighWaterMark;

					// Sets the "Content-Length" header
					request.setHeader("Content-Length", requestBodyBufferSize);

					let writeRequestBody = () => {
						while (requestBodyBufferPointer < requestBodyBufferSize) {
							let writeRequestBodyResult = null;
							let requestBodyChunkSize = null;
							let requestBodyChunk = null;

							// Returns immediately if an HTTP request error occurred
							if (httpRequestLastError !== null) {
								return;
							}

							// Calculates the HTTP request body chunk size
							if (requestBodyBufferSize - requestBodyBufferPointer < maxRequestChunkSize) {
								requestBodyChunkSize = requestBodyBufferSize - requestBodyBufferPointer;
							} else {
								requestBodyChunkSize = maxRequestChunkSize;
							}

							// Gets a chunk of the HTTP request body buffer
							requestBodyChunk = requestBodyBuffer.subarray(
								requestBodyBufferPointer,
								requestBodyBufferPointer + requestBodyChunkSize
							);

							// Writes a chunk of the HTTP request body buffer
							writeRequestBodyResult = request.write(requestBodyChunk);
							requestBodyBufferPointer = requestBodyBufferPointer + requestBodyChunkSize;
							if (writeRequestBodyResult === false) {
								request.once("drain", writeRequestBody);
								return;
							}
						}
						// Finishes writing the request body
						request.end();
					};
					writeRequestBody();
				}
			} else {
				// No HTTP request body
				request.end();
			}
		});

		// Processes the HTTP request "response" event
		request.on("response", (response) => {
			// logToConsole.debug(`Request "response" event fired.`);

			hasHttpResponse = true;

			// HTTP response state variables
			let responseBodyBuffer = null;
			let responseBodyStream = null; // For a future feature that allows streaming the HTTP response body
			let responseBodyBufferSize = 0;
			let responseBodyArrayOfBuffers = [];

			hasHttpRequestResponse = true;

			// Processes the HTTP response "error" event
			response.on("error", (error) => {
				// logToConsole.debug(`Response "error" event fired.`);

				handleErrorEvent(error);
			});

			// Processes the HTTP response "timeout" event
			response.on("timeout", () => {
				// logToConsole.debug(`Response "timeout" event fired`);

				response.destroy(new ERROR_HTTP_REQUEST_TIMED_OUT(url.origin, options.timeout));
			});

			// Processes the HTTP request emitter "httprequestcancel" event
			httpRequestEmitter.on("cancelhttprequest", () => {
				response.destroy(new ERROR_HTTP_REQUEST_CANCELLED(url.origin));
			});

			// Processes the HTTP response "data" event
			response.on("data", (chunk) => {
				// logToConsole.debug(`Response "data" event fired.`);

				responseBodyArrayOfBuffers.push(chunk);
				responseBodyBufferSize = responseBodyBufferSize + chunk.length;
			});

			// Processes the HTTP response "end" event
			response.on("end", () => {
				// logToConsole.debug(`Response "end" event fired.`);

				// Creates the HTTP response object
				httpResponse = {
					headers: response.headers,
					statusCode: response.statusCode,
					statusMessage: response.statusMessage
				};

				// Processes the HTTP response body chunks and adds the body to the HTTP response object
				if (responseBodyBufferSize > 0) {
					responseBodyBuffer = Buffer.concat(responseBodyArrayOfBuffers);
					responseBodyArrayOfBuffers = null; // Reduces memory usage
					httpResponse.body = responseBodyBuffer;
				}
			});

			// Processes the HTTP response "close" event
			response.on("close", () => {
				// logToConsole.debug(`Response "close" event fired.`);

				handleCloseEvent();
			});
		});

		// Processes the HTTP request close event
		request.on("close", () => {
			// logToConsole.debug(`Request "close" event fired.`);

			if (hasHttpResponse === false) {
				handleCloseEvent();
			}
		});
	}

	function cancelHttpRequest() {
		// TO DO: Add a timeout for the cancellation
		const httpRequestCancelPromise = new Promise(httpRequestCancelPromiseFunction);
		httpRequestEmitter.emit("cancelhttprequest");

		return httpRequestCancelPromise;

		function httpRequestCancelPromiseFunction(resolve, reject) {
			httpRequestEmitter.once("httprequestcancelled", () => {
				resolve("CANCELLED");
			});
		}
	}
};
