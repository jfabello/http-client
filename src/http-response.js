/**
 * HTTP response class.
 * @module jfabello/http-response
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Errors
const errors = require("./http-client-errors.js");

/**
 * HTTP response class.
 * @class HTTPResponse
 * @property {object} headers A key-value pairs object that specifies the HTTP response headers.
 * @property {number} statusCode A positive integer that specifies the HTTP response status code.
 * @property {string} statusMessage A string that specifies the HTTP response status message.
 * @property {Buffer} [body] An optional object parsed from JSON or a Buffer object that specifies the HTTP response body.
 */
class HTTPResponse {
	/**
	 * Read-only property that contains the HTTP response error classes as properties.
	 * @static
	 * @readonly
	 * @type {object}
	 */
	static get errors() {
		return errors;
	}

	/**
	 * Creates a new instance of the HTTP response class.
	 * @constructor
	 * @param {object} headers A key-value pairs object that specifies the HTTP response headers. If HTTP response headers are not available, an empty object should be passed.
	 * @param {number} statusCode A positive integer that specifies the HTTP response status code.
	 * @param {string} statusMessage A string that specifies the HTTP response status message.
	 * @param {object|Buffer} [body] An optional object parsed from JSON or a Buffer object that specifies the HTTP response body.
	 * @throws {ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID} If the HTTP response headers type is not an object.
	 * @throws {ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID} If the HTTP response status code type is not an integer.
	 * @throws {ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS} If the HTTP response status code is not between 100 and 599.
	 * @throws {ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID} If the HTTP response status message type is not a string."
	 * @throws {ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID} If the HTTP response body type is not an object.
	 */
	constructor(headers, statusCode, statusMessage, body) {
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
