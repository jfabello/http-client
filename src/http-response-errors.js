/**
 * @module http-client-errors
 * @description Promise-based HTTP and HTTPS client for Node.js classes.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

class ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP response headers type is not valid, it must be an object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP response status code type is not valid, it must be an integer.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS extends RangeError {
	constructor() {
		super("The HTTP response status code is out of bounds, it must be between 100 and 599.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP response status message type is not valid, it must be a string.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

class ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID extends TypeError {
	constructor() {
		super("The HTTP response body type is not valid, it must be an object.");
		this.name = Object.getPrototypeOf(this).constructor.name;
	}
}

const errors = {
	ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID,
	ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID,
	ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS,
	ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID,
	ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID
};

Object.freeze(errors);

module.exports = errors;
