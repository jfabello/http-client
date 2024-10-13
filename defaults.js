/**
 * @module http-client-defaults
 * @description HTTP Client defaults
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

const defaults = {};

defaults.DEFAULT_SOCKET_TIMEOUT = 60 * 1000; // 60 seconds
defaults.DEFAULT_HTTP_RESPONSE_STATUS_CODE = 200;
defaults.DEFAULT_HTTP_RESPONSE_STATUS_MESSAGE = "OK";

Object.freeze(defaults);

module.exports = defaults;
