/**
 * @module httpclient-tests
 * @description Promise-based HTTP and HTTPS client tests.
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Module imports
const simpleTimer = require("@jfabello/simpletimer");
const httpClient = require("./httpclient.js");

// Constants
const HTTP_TEST_SERVER_BASE_URL = new URL("http://127.0.0.1:8080");
const SILENT_REJECTION_URL = new URL("/silentrejection", HTTP_TEST_SERVER_BASE_URL);
const SILENT_TIMEOUT_URL = new URL("/silenttimeout", HTTP_TEST_SERVER_BASE_URL);
const NOISY_REJECTION_URL = new URL("/noisyrejection", HTTP_TEST_SERVER_BASE_URL);
const NOISY_TIMEOUT_URL = new URL("/noisytimeout", HTTP_TEST_SERVER_BASE_URL);
const CHECK_PATTERN_URL  = new URL("/checkpattern", HTTP_TEST_SERVER_BASE_URL);

const PATTERN_STRING = "This is a pattern!";
const PATTERN_ENCODING = "utf8";
const PATTERN_SIZE = 2 * 1000 * 1000; // 2 MB

describe("HTTP client tests", () => {
	test("Should return an ERROR_URL_TYPE_INVALID error when the URL argument is undefined", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest();
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_URL_TYPE_INVALID error when the URL argument type is a number", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(1234);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});
	test("Should return an ERROR_URL_TYPE_INVALID error when the URL argument type is an array", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(["http://www.example.com/", "http://www.test.com/"]);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_URL_TYPE_INVALID error when the URL argument is not an instance of URL", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(new Date());
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_URL_STRING_INVALID error when the URL argument is a string with an invalid URL", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.an example.com/");
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_URL_STRING_INVALID);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID error when the HTTP request method argument type is not a string", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", 1234);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_METHOD_INVALID error when the HTTP request method argument is not a valid HTTP request method", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GOT");
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_METHOD_INVALID);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID error when the HTTP request options argument type is not an object or undefined", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", 1234);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_OPTIONS_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID error when the HTTP request headers type in the options argument is not an object", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", { headers: 1234 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_REQUEST_TIMEOUT_TYPE_INVALID error when the HTTP request timeout in the options argument is not a number", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", { timeout: "1234" });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_REQUEST_TIMEOUT_TYPE_INVALID error when the HTTP request timeout in the options argument is not an integer", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", { timeout: 1.25 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS error when the HTTP request timeout in the options argument is not a positive integer", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", { timeout: -10 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_BODY_TYPE_INVALID error when the HTTP request body in the options argument is not a string or an object", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", { body: 1234 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_BODY_TYPE_INVALID error when the HTTP request body in the options argument is not a Buffer object", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest("http://www.example.com/", "GET", { body: new Date() });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
	});

	test("Should return an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, has not returned a response, and has its connection severed", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(SILENT_REJECTION_URL, "GET");
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
	});

	test("Should return an ERROR_BROKEN_PIPE error when the HTTP request has a request body, has not returned a response, and has its connection severed", async () => {
		expect.assertions(1);
		try {
			let httpRequestOptions = {
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(SILENT_REJECTION_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_BROKEN_PIPE);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, has not returned a response, and has the connection time out from the client side", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(SILENT_TIMEOUT_URL, "GET", { timeout: 200 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, has not returned a response, and has the connection time out from the client side", async () => {
		expect.assertions(1);
		try {
			let httpRequestOptions = {
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(SILENT_TIMEOUT_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
	});

	test("Should return an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, has not returned a response, and has the connection time out from the server side", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(SILENT_TIMEOUT_URL, "GET");
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
	});

	test("Should return an ERROR_BROKEN_PIPE error when the HTTP request has a request body, has not returned a response, and has the connection time out from the server side", async () => {
		expect.assertions(1);
		try {
			let httpRequestOptions = {
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(SILENT_TIMEOUT_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_BROKEN_PIPE);
		}
	});

	test("Should return an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, has returned a partial response, and has its connection severed", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(NOISY_REJECTION_URL, "GET");
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
	});

	test("Should return an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has a request body, has returned a partial response, and has its connection is severed", async () => {
		expect.assertions(1);
		try {
			let httpRequestOptions = {
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(NOISY_REJECTION_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, has returned a partial response, and has its connection time out from the client side", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(NOISY_TIMEOUT_URL, "GET", { timeout: 200 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, has returned a partial response, and has its connection time out from the client side", async () => {
		expect.assertions(1);
		try {
			let httpRequestOptions = {
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(NOISY_TIMEOUT_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, has returned a partial response, and has its connection time out from the server side", async () => {
		expect.assertions(1);
		try {
			let httpClientRequest = httpClient.makeHttpRequest(NOISY_TIMEOUT_URL, "GET", { timeout: 200 });
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, has returned a partial response, and has its connection time out from the server side", async () => {
		expect.assertions(1);
		try {
			let httpRequestOptions = {
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(NOISY_TIMEOUT_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
	});

	test("Should return an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has no request body, has not returned a response, and it is cancelled", async () => {
		expect.assertions(2);
		let httpClientRequest = null;
		let httpClientRequestCancelResponse = null;
		try {
			httpClientRequest = httpClient.makeHttpRequest(SILENT_TIMEOUT_URL, "GET");
			await simpleTimer.startTimer(200).promise;
			httpClientRequestCancelResponse = httpClientRequest.cancel();
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		expect(await httpClientRequestCancelResponse).toBe("CANCELLED");
	});

	test("Should return an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has no request body, has returned a partial response, and it is cancelled", async () => {
		expect.assertions(2);
		let httpClientRequest = null;
		let httpClientRequestCancelResponse = null;
		try {
			httpClientRequest = httpClient.makeHttpRequest(NOISY_TIMEOUT_URL, "GET");
			await simpleTimer.startTimer(200).promise;
			httpClientRequestCancelResponse = httpClientRequest.cancel();
			let httpClientResponse = await httpClientRequest.promise;
		} catch (error) {
			expect(error).toBeInstanceOf(httpClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		expect(await httpClientRequestCancelResponse).toBe("CANCELLED");
	});

	test(`Should return a 200 status code, an "OK" status message, an "application/octet-stream" content-type header, a "${PATTERN_SIZE}" content-length header, and a matching pattern when the correct pattern is sent as the request body.`, async () => {
		expect.assertions(9);
		try {
			let httpRequestOptions = {
				headers: { "Content-Type": "application/octet-stream", "Content-Length": PATTERN_SIZE },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientRequest = httpClient.makeHttpRequest(CHECK_PATTERN_URL, "POST", httpRequestOptions);
			let httpClientResponse = await httpClientRequest.promise;
			expect(httpClientResponse.statusCode).toBe(200);
			expect(httpClientResponse.statusMessage.toUpperCase()).toBe("OK");
			expect("content-type" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-type"].toLowerCase()).toBe("application/octet-stream");
			expect("content-length" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-length"]).toBe(`${PATTERN_SIZE}`);
			expect("body" in httpClientResponse).toBe(true);
			expect(httpClientResponse.body.length).toBe(PATTERN_SIZE);
			expect(Buffer.compare(httpRequestOptions.body, httpClientResponse.body)).toBe(0);
		} catch (error) {
			throw error;
		}
	});
});
