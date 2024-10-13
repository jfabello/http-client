/**
 * @module http-client-tests
 * @description HTTP Client tests.
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const { describe, expect, test } = require("@jest/globals");
const SimpleTimer = require("@jfabello/simple-timer");
const { HTTPClient, HTTPResponse } = require("./http-client.js");

// Constants
const HTTP_TEST_SERVER_BASE_URL = new URL("http://127.0.0.1:8080");
const SILENT_REJECTION_URL = new URL("/silentrejection", HTTP_TEST_SERVER_BASE_URL);
const SILENT_TIMEOUT_URL = new URL("/silenttimeout", HTTP_TEST_SERVER_BASE_URL);
const NOISY_REJECTION_URL = new URL("/noisyrejection", HTTP_TEST_SERVER_BASE_URL);
const NOISY_TIMEOUT_URL = new URL("/noisytimeout", HTTP_TEST_SERVER_BASE_URL);
const CHECK_PATTERN_URL = new URL("/checkpattern", HTTP_TEST_SERVER_BASE_URL);
const CHECK_STRING_URL = new URL("/checkstring", HTTP_TEST_SERVER_BASE_URL);
const SILENT_RESPONSE_URL = new URL("/silentresponse", HTTP_TEST_SERVER_BASE_URL);
const PATTERN_STRING = "This is a pattern!";
const PATTERN_ENCODING = "utf8";
const PATTERN_SIZE = 2 * 1000 * 1000; // 2 MB
const PATTERN_STRING_REPEAT = 100000;

describe("HTTP client tests", () => {
	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_URL_TYPE_INVALID error when the URL option is undefined", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_URL_TYPE_INVALID error when the URL option is not a string or an instance of URL", () => {
		expect.assertions(3);
		try {
			let httpClientInstance = new HTTPClient(1234);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient(["http://www.example.com/", "http://www.test.com/"]);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient(new Date());
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_URL_STRING_INVALID error when the URL option is a string with an invalid URL", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.an example.com/");
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_STRING_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID error when the URL option has an invalid protocol", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("ftp://www.example.com/");
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID error when the HTTP request method argument type is not a string", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { method: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { method: ["GET"] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_METHOD_INVALID error when the HTTP request method argument is not a valid HTTP request method", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { method: "GOT" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_METHOD_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID error when the HTTP request headers type in the options argument is not an object", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { headers: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { headers: "This is not a header" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_REQUEST_TIMEOUT_TYPE_INVALID error when the HTTP request timeout in the options argument is not a number", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: "1234" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: [1234] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_REQUEST_TIMEOUT_TYPE_INVALID error when the HTTP request timeout in the options argument is not an integer", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: 1.25 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS error when the HTTP request timeout in the options argument is not a positive integer", () => {
		expect.assertions(3);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: 0 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: -10 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: -1000000 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_BODY_TYPE_INVALID error when the HTTP request body in the options argument is not a string or an object", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: ["1234"] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_BODY_TYPE_INVALID error when the HTTP request body in the options argument is not a Buffer object", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: new Date() });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID error when the HTTP request body encoding in the options argument is not a string", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: "This is a body", bodyEncoding: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should throw an ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID error when the HTTP request body encoding in the options argument is not a valid encoding", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: "This is a body", bodyEncoding: "utf32" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance should return an HTTPClient instance when valid options are passed", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/");
			expect(httpClientInstance).toBeInstanceOf(HTTPClient);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", {
				method: "POST",
				headers: { clientId: "abcd" },
				timeout: 60 * 1000,
				body: "This is abody",
				bodyEncoding: "ascii"
			});
			expect(httpClientInstance).toBeInstanceOf(HTTPClient);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test("An HTTP Client instance should be in the CREATED state after its constructor is called", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/");
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", {
				method: "POST",
				headers: { clientId: "abcd" },
				timeout: 60 * 1000,
				body: "This is abody",
				bodyEncoding: "ascii"
			});
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test("An HTTP Client instance should return a Promise object when its makeRequest(...) method is called and it is in the CREATED state", async () => {
		expect.assertions(2);
		let httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
		expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		let httpClientInstancePromise = httpClientInstance.makeRequest();
		expect(httpClientInstancePromise).toBeInstanceOf(Promise);
		await httpClientInstancePromise;
	});

	test("An HTTP Client instance should be in the REQUESTING state after its makeRequest(...) method is called", async () => {
		expect.assertions(1);
		let httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
		let httpClientInstancePromise = httpClientInstance.makeRequest();
		expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
		await httpClientInstancePromise;
	});

	test("An HTTP Client instance in the REQUESTING state should return the same Promise object that was returned on the first call to its makeRequest(...) method after its makeRequest(...) method is called again", async () => {
		expect.assertions(2);
		let httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
		let httpClientInstancePromise = httpClientInstance.makeRequest();
		expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
		expect(httpClientInstance.makeRequest()).toBe(httpClientInstancePromise);
		await httpClientInstancePromise;
	});

	test("An HTTP Client instance should throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, the server has not returned a response, and has its connection severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(SILENT_REJECTION_URL);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_BROKEN_PIPE error when the HTTP request has a request body, the server has not returned a response, and has its connection severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(SILENT_REJECTION_URL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_BROKEN_PIPE);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, the server has not returned a response, and has the connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(SILENT_TIMEOUT_URL, { timeout: 200 });
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, the server has not returned a response, and has the connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(SILENT_TIMEOUT_URL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, the server has not returned a response, and has the connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(SILENT_TIMEOUT_URL);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_BROKEN_PIPE error when the HTTP request has a request body, the server has not returned a response, and has the connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(SILENT_TIMEOUT_URL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_BROKEN_PIPE);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, the server has returned a partial response, and has its connection severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(NOISY_REJECTION_URL);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has a request body, the server has returned a partial response, and has its connection is severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(NOISY_REJECTION_URL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, the server has returned a partial response, and has its connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL, { timeout: 200 });
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, the server has returned a partial response, and has its connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, the server has returned a partial response, and has its connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL, { timeout: 200 });
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, the server has returned a partial response, and has its connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has no request body, the server has not returned a response, and it is cancelled", async () => {
		expect.assertions(3);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			httpClientInstance = new HTTPClient(SILENT_TIMEOUT_URL);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has no request body, the server has returned a partial response, and it is cancelled", async () => {
		expect.assertions(3);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has a request body, the server has not returned a response, and it is cancelled", async () => {
		expect.assertions(3);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(SILENT_TIMEOUT_URL, httpRequestOptions);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has a request body, the server has returned a partial response, and it is cancelled", async () => {
		expect.assertions(3);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL, httpRequestOptions);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
	});

	test(`An HTTP Client instance should return a 200 status code, an "OK" status message, an "application/octet-stream" content-type header, a "${PATTERN_SIZE}" content-length header, and a matching pattern when the correct pattern is sent as the request body.`, async () => {
		expect.assertions(10);
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream", "Content-Length": PATTERN_SIZE },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientInstance = new HTTPClient(CHECK_PATTERN_URL, httpRequestOptions);
			let httpClientResponse = await httpClientInstance.makeRequest();
			expect(httpClientResponse.statusCode).toBe(200);
			expect(httpClientResponse.statusMessage.toUpperCase()).toBe("OK");
			expect("content-type" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-type"].toLowerCase()).toBe("application/octet-stream");
			expect("content-length" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-length"]).toBe(`${PATTERN_SIZE}`);
			expect("body" in httpClientResponse).toBe(true);
			expect(httpClientResponse.body.length).toBe(PATTERN_SIZE);
			expect(Buffer.compare(httpRequestOptions.body, httpClientResponse.body)).toBe(0);
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test(`An HTTP Client instance should return a 200 status code, an "OK" status message, a "text/plain" content-type header, an appropriate content-length header, and a matching string when the correct string is sent as the request body.`, async () => {
		expect.assertions(10);
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "text/plain" },
				body: PATTERN_STRING.repeat(PATTERN_STRING_REPEAT),
				bodyEncoding: PATTERN_ENCODING
			};
			let httpClientInstance = new HTTPClient(CHECK_STRING_URL, httpRequestOptions);
			let httpClientResponse = await httpClientInstance.makeRequest();
			let httpClientBodyBuffer = Buffer.from(PATTERN_STRING.repeat(PATTERN_STRING_REPEAT), PATTERN_ENCODING);
			expect(httpClientResponse.statusCode).toBe(200);
			expect(httpClientResponse.statusMessage.toUpperCase()).toBe("OK");
			expect("content-type" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-type"].toLowerCase()).toBe("text/plain");
			expect("content-length" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-length"]).toBe(`${httpClientBodyBuffer.length}`);
			expect("body" in httpClientResponse).toBe(true);
			expect(httpClientResponse.body.length).toBe(httpClientBodyBuffer.length);
			expect(Buffer.compare(httpClientBodyBuffer, httpClientResponse.body)).toBe(0);
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test(`An HTTP Client instance should return a 204 status code and a "No response" status message.`, async () => {
		expect.assertions(3);
		try {
			let httpClientInstance = new HTTPClient(SILENT_RESPONSE_URL);
			let httpClientResponse = await httpClientInstance.makeRequest();
			expect(httpClientResponse.statusCode).toBe(204);
			expect(httpClientResponse.statusMessage.toUpperCase()).toBe("NO CONTENT");
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE error when the HTTP client is not is not in a state that allows making HTTP requests", async () => {
		expect.assertions(19);
		try {
			let httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			let httpClientInstancePromise = httpClientInstance.makeRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
			await httpClientInstancePromise;
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
			httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
		}
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;
			let httpClientInstanceCancelPromise = null;
			try {
				httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
				httpClientInstance.makeRequest();
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
			}
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;
			let httpClientInstanceCancelPromise = null;

			try {
				httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
				await httpClientInstancePromise;
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
			}
			await httpClientInstanceCancelPromise;
			httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
		}
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;

			try {
				httpClientInstance = new HTTPClient(NOISY_TIMEOUT_URL, { timeout: 200 });
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				await httpClientInstancePromise;
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
			}
			expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
			httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
		}
	});

	test("An HTTP Client instance in the CANCELLING state should return the same Promise object that was returned on the first call to its cancelRequest(...) method after its cancelRequest(...) method is called again", async () => {
		expect.assertions(6);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			expect(httpClientInstance.cancelRequest()).toBe(httpClientInstanceCancelPromise);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		expect(await httpClientInstanceCancelPromise).toBe(true);
	});

	test("An HTTP Client instance should throw an ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE error when the HTTP client is not is not in a state that allows requesting the HTTP request cancellation", async () => {
		expect.assertions(11);
		try {
			let httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			httpClientInstance.cancelRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE);
		}
		try {
			let httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			let httpClientInstancePromise = httpClientInstance.makeRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
			await httpClientInstancePromise;
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
			httpClientInstance.cancelRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE);
		}
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;
			let httpClientInstanceCancelPromise = null;
			try {
				httpClientInstance = new HTTPClient(HTTP_TEST_SERVER_BASE_URL);
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
				await httpClientInstancePromise;
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
			}
			httpClientInstance.cancelRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE);
		}
	});
});
