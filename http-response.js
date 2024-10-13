/**
 * @module jfabello/http-response
 * @description HTTP response class
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

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
 * @description HTTP response class.
 */
class HTTPResponse {
	// Private instance variables
	#headers = null;
	#statusCode = null;
	#statusMessage = null;
	#body = null;

	/**
	 * @description The headers of an HTTP response instance.
	 */
	get headers() {
		return this.#headers;
	}

	/**
	 * @description The status code of an HTTP response instance.
	 */
	get statusCode() {
		return this.#statusCode;
	}

	/**
	 * @description The status message of an HTTP response instance.
	 */
	get statusMessage() {
		return this.#statusMessage;
	}

	/**
	 * @description The body of an HTTP response instance.
	 */
	get body() {
		return this.#body;
	}

	/**
	 * @description Creates a new instance of the HTTP response class.
	 * @param {object} options The HTTP response options object.
	 * @param {object} options.headers An optional key-value pairs object that specifies the HTTP response headers.
	 * @param {number} options.statusCode An optional positive integer that specifies the HTTP response status code. The default is 200.
	 * @param {string} options.statusMessage An optional string that specifies the HTTP response status message. The default is OK.
	 * @param {Buffer} options.body An optional Buffer object that specifies the HTTP response body.
	 */
	constructor({
		headers = {},
		statusCode = defaults.DEFAULT_HTTP_RESPONSE_STATUS_CODE,
		statusMessage = defaults.DEFAULT_HTTP_RESPONSE_STATUS_MESSAGE,
		body = null
	} = {}) {
		this.#headers = headers;
		this.#statusCode = statusCode;
		this.#statusMessage = statusMessage;
		this.#body = body;
	}
}

module.exports = HTTPResponse;
