/**
 * @module errors
 * @description HTTP Client error classes
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

exports.ERROR_HTTP_REQUEST_URL_TYPE_INVALID = class extends TypeError {
	constructor() {
		super("The URL type is not valid, it should be a string or a URL object.");
		this.name = "ERROR_URL_TYPE_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_URL_STRING_INVALID = class extends TypeError {
	constructor() {
		super("The URL string is not a valid URL.");
		this.name = "ERROR_URL_STRING_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID = class extends TypeError {
	constructor() {
		super("The HTTP request method type is not valid, it should be a string.");
		this.name = "ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_METHOD_INVALID = class extends RangeError {
	constructor(method) {
		super(`The HTTP request method "${method}" is not valid.`);
		this.name = "ERROR_HTTP_REQUEST_METHOD_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID = class extends TypeError {
	constructor() {
		super("The HTTP request options type is not valid, it should be an object or undefined.");
		this.name = "ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID = class extends TypeError {
	constructor() {
		super("The HTTP request headers type is not valid, it should be an object.");
		this.name = "ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID = class extends TypeError {
	constructor() {
		super("The HTTP request timeout type is not valid, it should be an integer.");
		this.name = "ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS = class extends RangeError {
	constructor() {
		super("The HTTP request timeout is out of bounds, it should be between 1 ms and infinity.");
		this.name = "ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS";
	}
};

exports.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID = class extends TypeError {
	constructor() {
		super("The HTTP request body type is not valid, it should be a string or a Buffer object.");
		this.name = "ERROR_HTTP_REQUEST_BODY_TYPE_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_OPTIONS_PROPERTY_INVALID = class extends ReferenceError {
	constructor(property) {
		super(`The "${property}" property is not a valid HTTP request options object property.`);
		this.name = "ERROR_HTTP_REQUEST_OPTIONS_PROPERTY_INVALID";
	}
};

exports.ERROR_HTTP_REQUEST_TIMED_OUT = class extends Error {
	constructor(origin, timeout) {
		super(`The HTTP request to ${origin} has timed out after ${timeout} miliseconds.`);
		this.name = "ERROR_HTTP_REQUEST_TIMED_OUT";
	}
};

exports.ERROR_HTTP_REQUEST_CANCELLED = class extends Error {
	constructor(origin) {
		super(`The HTTP request to ${origin} has been cancelled.`);
		this.name = "ERROR_HTTP_REQUEST_CANCELLED";
	}
};
