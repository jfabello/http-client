/**
 * Promise-based HTTP and HTTPS client for Node.js errors.
 * @module http-client-errors
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

/**
 * Thrown when the URL type is not valid.
 * @class ERROR_HTTP_REQUEST_URL_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_URL_TYPE_INVALID extends TypeError {
	constructor() {
		super("The URL type is not valid, it must be a string or a URL object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the URL string is not a valid URL.
 * @class ERROR_HTTP_REQUEST_URL_STRING_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_URL_STRING_INVALID extends TypeError {
	constructor() {
		super("The URL string is not a valid URL.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request URL protocol is not valid.
 * @class ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID
 * @extends RangeError
 * @param {string} protocol - The invalid protocol.
 */
class ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID extends RangeError {
	constructor(protocol) {
		super(`The HTTP request URL protocol "${protocol}" is not valid.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request method type is not valid.
 * @class ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request method type is not valid, it must be a string.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request method is not valid.
 * @class ERROR_HTTP_REQUEST_METHOD_INVALID
 * @extends RangeError
 * @param {string} method - The invalid HTTP method.
 */
class ERROR_HTTP_REQUEST_METHOD_INVALID extends RangeError {
	constructor(method) {
		super(`The HTTP request method "${method}" is not valid.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request headers type is not valid.
 * @class ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request headers type is not valid, it must be an object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request timeout type is not valid.
 * @class ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request timeout type is not valid, it must be an integer.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request timeout is out of bounds.
 * @class ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS
 * @extends RangeError
 */
class ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS extends RangeError {
	constructor() {
		super("The HTTP request timeout is out of bounds, it must be between 1 ms and infinity.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request body type is not valid.
 * @class ERROR_HTTP_REQUEST_BODY_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_BODY_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request body type is not valid, it must be a string or an object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request body object is not serializable.
 * @class ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE
 * @extends Error
 */
class ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE extends Error {
	constructor() {
		super("The HTTP request body object is not serializable.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request body encoding type is not valid.
 * @class ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request body encoding type is not valid, it must be a string.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request body encoding is not valid.
 * @class ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID
 * @extends RangeError
 * @param {string} bodyEncoding - The invalid body encoding.
 */
class ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID extends RangeError {
	constructor(bodyEncoding) {
		super(`The HTTP request method "${bodyEncoding}" is not valid.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the automatic JSON HTTP response parse option type is not valid.
 * @class ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID
 * @extends TypeError
 */
class ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID extends TypeError {
	constructor() {
		super("The automatic JSON HTTP response parse option type is not valid, it must be a boolean.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP client is not in a state that allows making HTTP requests.
 * @class ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE
 * @extends Error
 */
class ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE extends Error {
	constructor() {
		super(`The HTTP client is not in a state that allows making HTTP requests.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request has timed out.
 * @class ERROR_HTTP_REQUEST_TIMED_OUT
 * @extends Error
 * @param {string} origin - The origin of the request.
 * @param {number} timeout - The timeout duration in milliseconds.
 */
class ERROR_HTTP_REQUEST_TIMED_OUT extends Error {
	constructor(origin, timeout) {
		super(`The HTTP request to ${origin} has timed out after ${timeout} miliseconds.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request timed out while waiting for a response.
 * @class ERROR_HTTP_RESPONSE_TIMED_OUT
 * @extends Error
 * @param {string} origin - The origin of the request.
 * @param {number} timeout - The timeout duration in milliseconds.
 */
class ERROR_HTTP_RESPONSE_TIMED_OUT extends Error {
	constructor(origin, timeout) {
		super(`The HTTP request timed out while waiting for a response from ${origin} after ${timeout} miliseconds.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP request has been cancelled.
 * @class ERROR_HTTP_REQUEST_CANCELLED
 * @extends Error
 * @param {string} origin - The origin of the request.
 */
class ERROR_HTTP_REQUEST_CANCELLED extends Error {
	constructor(origin) {
		super(`The HTTP request to ${origin} has been cancelled.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP client is not in a state that allows requesting the HTTP request cancellation.
 * @class ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE
 * @extends Error
 */
class ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE extends Error {
	constructor() {
		super(`The HTTP client is not in a state that allows requesting the HTTP request cancellation.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

/**
 * Thrown when the HTTP response body is not parseable as JSON.
 * @class ERROR_HTTP_RESPONSE_BODY_NOT_PARSEABLE_AS_JSON
 * @extends Error
 * @param {string} origin - The origin of the response.
 */
class ERROR_HTTP_RESPONSE_BODY_NOT_PARSEABLE_AS_JSON extends Error {
	constructor(origin) {
		super(`The HTTP response body from ${origin} is not parseable as JSON.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

const errors = {
	ERROR_HTTP_REQUEST_URL_TYPE_INVALID,
	ERROR_HTTP_REQUEST_URL_STRING_INVALID,
	ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID,
	ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID,
	ERROR_HTTP_REQUEST_METHOD_INVALID,
	ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID,
	ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID,
	ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS,
	ERROR_HTTP_REQUEST_BODY_TYPE_INVALID,
	ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE,
	ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID,
	ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID,
	ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID,
	ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE,
	ERROR_HTTP_REQUEST_TIMED_OUT,
	ERROR_HTTP_RESPONSE_TIMED_OUT,
	ERROR_HTTP_REQUEST_CANCELLED,
	ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE,
	ERROR_HTTP_RESPONSE_BODY_NOT_PARSEABLE_AS_JSON
};

Object.freeze(errors);

module.exports = errors;
