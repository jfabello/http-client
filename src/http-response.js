/**
 * @module jfabello/http-response
 * @description HTTP response class.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Errors
const errors = require("./http-response-errors.js");

/**
 * @description HTTP response class.
 * @property {object} headers A key-value pairs object that specifies the HTTP response headers.
 * @property {number} statusCode A positive integer that specifies the HTTP response status code.
 * @property {string} statusMessage A string that specifies the HTTP response status message.
 * @property {Buffer} [body] An optional object parsed from JSON or a Buffer object that specifies the HTTP response body.
 */
class HTTPResponse {
	/**
	 * @static
	 * @type {object}
	 * @description Read-only property that contains the HTTP response error classes as properties.
	 */
	static get errors() {
		return errors;
	}

	/**
	 * @description Creates a new instance of the HTTP response class.
	 * @param {object} options The HTTP response options object.
	 * @param {object} options.headers A key-value pairs object that specifies the HTTP response headers.
	 * @param {number} options.statusCode A positive integer that specifies the HTTP response status code.
	 * @param {string} options.statusMessage A string that specifies the HTTP response status message.
	 * @param {object|Buffer} [options.body] An optional object parsed from JSON or a Buffer object that specifies the HTTP response body.
	 * @throws {ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID} If the HTTP response headers type is not an object.
	 * @throws {ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID} If the HTTP response status code type is not an integer.
	 * @throws {ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS} If the HTTP response status code is not between 100 and 599.
	 * @throws {ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID} If the HTTP response status message type is not a string."
	 * @throws {ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID} If the HTTP response body type is not an object.
	 */
	constructor({ headers = {}, statusCode, statusMessage, body } = {}) {
		// Checks the passed HTTP response headers
		if (typeof headers !== "object") {
			throw new errors.ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID();
		}
		this.headers = headers;

		// Checks the passed HTTP response status code
		if (typeof statusCode !== "number" || Number.isInteger(statusCode) === false) {
			throw new errors.ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID();
		}
		if (statusCode < 100 || statusCode > 599) {
			throw new errors.ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS();
		}
		this.statusCode = statusCode;

		// Checks the passed HTTP response status message
		if (typeof statusMessage !== "string") {
			throw new errors.ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID();
		}
		this.statusMessage = statusMessage;

		// Checks the passed HTTP response body
		if (typeof body !== "undefined") {
			if (typeof body !== "object") {
				throw new errors.ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID();
			}
			this.body = body;
		}
	}
}

module.exports = HTTPResponse;
