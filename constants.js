/**
 * @module http-client-constants
 * @description HTTP Client constants
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

const constants = {};

constants.HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
constants.BODY_ENCODINGS = [
	"utf8",
	"utf-8",
	"utf16le",
	"utf-16le",
	"ucs2",
	"ucs-2",
	"latin1",
	"ascii",
	"base64",
	"base64url",
	"hex"
];

Object.freeze(constants);

module.exports = constants;
