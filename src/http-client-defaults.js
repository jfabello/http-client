/**
 * Promise-based HTTP and HTTPS client for Node.js defaults.
 * @module http-client-defaults
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

const defaults = {};

defaults.DEFAULT_SOCKET_TIMEOUT = 60 * 1000; // 60 seconds
defaults.DEFAULT_BODY_ENCODING = "utf8";
defaults.DEFAULT_AUTO_JSON_RESPONSE_PARSE = true;

Object.freeze(defaults);

module.exports = defaults;
