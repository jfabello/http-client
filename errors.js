/**
 * @module http-client-errors
 * @description HTTP Client error classes
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

class ERROR_HTTP_REQUEST_URL_TYPE_INVALID extends TypeError {
	constructor() {
		super("The URL type is not valid, it should be a string or a URL object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_URL_STRING_INVALID extends TypeError {
	constructor() {
		super("The URL string is not a valid URL.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID extends RangeError {
	constructor(protocol) {
		super(`The HTTP request URL protocol "${protocol}" is not valid.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request method type is not valid, it should be a string.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_METHOD_INVALID extends RangeError {
	constructor(method) {
		super(`The HTTP request method "${method}" is not valid.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request headers type is not valid, it should be an object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request timeout type is not valid, it should be an integer.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS extends RangeError {
	constructor() {
		super("The HTTP request timeout is out of bounds, it should be between 1 ms and infinity.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_BODY_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request body type is not valid, it should be a string or a Buffer object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP request body encoding type is not valid, it should be a string.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID extends RangeError {
	constructor(bodyEncoding) {
		super(`The HTTP request method "${bodyEncoding}" is not valid.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE extends Error {
	constructor() {
		super(`The HTTP client is not in a state that allows making HTTP requests.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_TIMED_OUT extends Error {
	constructor(origin, timeout) {
		super(`The HTTP request to ${origin} has timed out after ${timeout} miliseconds.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_CANCELLED extends Error {
	constructor(origin) {
		super(`The HTTP request to ${origin} has been cancelled.`);
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE extends Error {
	constructor() {
		super(`The HTTP client is not in a state that allows requesting the HTTP request cancellation.`);
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
	ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID,
	ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID,
	ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE,
	ERROR_HTTP_REQUEST_TIMED_OUT,
	ERROR_HTTP_REQUEST_CANCELLED,
	ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE
};

Object.freeze(errors);

module.exports = errors;
