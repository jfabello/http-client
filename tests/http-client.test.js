/**
 * Promise-based HTTP and HTTPS client for Node.js tests.
 * @module http-client-tests
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
const path = require("node:path");
const { Worker } = require("node:worker_threads");
const { beforeAll, describe, expect, test } = require("@jest/globals");
const SimpleTimer = require("@jfabello/simple-timer");
const { HTTPClient, HTTPResponse } = require("../src/http-client-class.js");

// Constants
const PATTERN_STRING = "This is a pattern!";
const PATTERN_ENCODING = "utf8";
const PATTERN_SIZE = 2 * 1000 * 1000; // 2 MB
const PATTERN_STRING_REPEAT = 100000;
const JSON_OBJECT = {
	isActive: true,
	firstName: "John",
	lastName: "Doe",

	address: {
		street: "Somewhere",
		city: "Anytown",
		state: "CA",
		zip: 12345
	},
	age: 25
};

// Global variables
let httpTestServerWorker = null;
let httpTestServerWorkerExitPromise = null;
let httpTestServerBaseURL = null;
let silentRejectionURL = null;
let silentTimeoutURL = null;
let noisyRejectionURL = null;
let noisyTimeoutURL = null;
let checkPatternURL = null;
let checkStringURL = null;
let silentResponseURL = null;
let checkJSONURL = null;

// Starts the HTTP Test Server before running the tests
beforeAll(async () => {
	// Creates a new HTTP Test Server worker
	httpTestServerWorker = new Worker(path.join(__dirname, "../utils/http-test-server-worker.js"));

	// Creates the HTTP Test Server worker exit promise
	httpTestServerWorkerExitPromise = new Promise((resolve, reject) => {
		httpTestServerWorker.once("exit", () => {
			resolve();
		});
	});

	// Waits for the HTTP Test Server worker to start the server
	await new Promise((resolve, reject) => {
		// Creates a "server-start" message event listener
		const serverStartMessageEventListener = (message) => {
			if (message.action !== "server-start") {
				return;
			}

			// Removes the "server-start" message event listener
			httpTestServerWorker.off("message", serverStartMessageEventListener);

			if (message.result === "SUCCESS") {
				// Set up the HTTP Test Server URLs
				httpTestServerBaseURL = new URL(`http://127.0.0.1:${message.serverPort}/`);
				silentRejectionURL = new URL("/silentrejection", httpTestServerBaseURL);
				silentTimeoutURL = new URL("/silenttimeout", httpTestServerBaseURL);
				noisyRejectionURL = new URL("/noisyrejection", httpTestServerBaseURL);
				noisyTimeoutURL = new URL("/noisytimeout", httpTestServerBaseURL);
				checkPatternURL = new URL("/checkpattern", httpTestServerBaseURL);
				checkStringURL = new URL("/checkstring", httpTestServerBaseURL);
				silentResponseURL = new URL("/silentresponse", httpTestServerBaseURL);
				checkJSONURL = new URL("/checkjson", httpTestServerBaseURL);
				resolve();
			} else {
				reject(message.error);
			}
		};

		httpTestServerWorker.on("message", serverStartMessageEventListener);
	});
});

describe("HTTP response tests", () => {
	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID error when no arguments are passed to its constructor", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID error when the HTTP response headers argument type is not an object", () => {
		expect.assertions(2);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse(1234);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse("This is not a header");
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_HEADERS_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID when no HTTP response status code argument is passed", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({});
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID error when the HTTP response status code argument type is not a number", () => {
		expect.assertions(2);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, "200");
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, ["200"]);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID error when the HTTP response status code argument type is not an integer", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, 200.25);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS error when the HTTP response status code argument is not between 100 and 599", () => {
		expect.assertions(3);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({},  99 );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS);
		}
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, 600 );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS);
		}
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, 1000 );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_CODE_OUT_OF_BOUNDS);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID error when no HTTP response status message argument is passed", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, 200 );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID error when the HTTP response status message argument type is not a string", () => {
		expect.assertions(2);
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, 200,  200 );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpResponseInstance = new HTTPResponse({}, 200, ["OK"] );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_STATUS_MESSAGE_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must throw an ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID error when the HTTP response body argument type is not an object", () => {
		expect.assertions(2);
		try {
			let httpResponseInstance = new HTTPResponse({}, 200, "OK", 1234 );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID);
		}
		try {
			let httpResponseInstance = new HTTPResponse({}, 200, "OK", "This is not a body" );
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPResponse.errors.ERROR_HTTP_RESPONSE_BODY_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Response instance must return an HTTPResponse instance when valid options are passed", () => {
		expect.assertions(2);
		try {
			let httpResponseInstance = new HTTPResponse({ "Content-Type": "application/octet-stream" },  200,  "OK" );
			expect(httpResponseInstance).toBeInstanceOf(HTTPResponse);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpResponseInstance = new HTTPResponse( { "Content-Type": "application/octet-stream" },  200,  "OK", Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING) );
			expect(httpResponseInstance).toBeInstanceOf(HTTPResponse);
		} catch (error) {
			throw error; // No error should be catched
		}
	});
});

describe("HTTP client tests", () => {
	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_URL_TYPE_INVALID error when the URL option is undefined", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_URL_TYPE_INVALID error when the URL option is not a string or an instance of URL", () => {
		expect.assertions(3);
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient(1234);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient(["http://www.example.com/", "http://www.test.com/"]);
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient(new Date());
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_URL_STRING_INVALID error when the URL option is a string with an invalid URL", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.an example.com/");
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_STRING_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID error when the URL option has an invalid protocol", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("ftp://www.example.com/");
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_URL_PROTOCOL_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID error when the HTTP request method argument type is not a string", () => {
		expect.assertions(2);
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { method: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { method: ["GET"] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_METHOD_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_METHOD_INVALID error when the HTTP request method argument is not a valid HTTP request method", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { method: "GOT" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_METHOD_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_HEADERS_TYPE_INVALID error when the HTTP request headers type in the options argument is not an object", () => {
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

	test("An attempt to create an HTTP Client instance must throw an ERROR_REQUEST_TIMEOUT_TYPE_INVALID error when the HTTP request timeout in the options argument is not a number", () => {
		expect.assertions(2);
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: "1234" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: [1234] });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_REQUEST_TIMEOUT_TYPE_INVALID error when the HTTP request timeout in the options argument is not an integer", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { timeout: 1.25 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMEOUT_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_TIMEOUT_OUT_OF_BOUNDS error when the HTTP request timeout in the options argument is not a positive integer", () => {
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

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_BODY_TYPE_INVALID error when the HTTP request body in the options argument is not a string or an object", () => {
		expect.assertions(2);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: true });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID error when the HTTP request body encoding in the options argument is not a string", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: "This is a body", bodyEncoding: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_ENCODING_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID error when the HTTP request body encoding in the options argument is not a valid encoding", () => {
		expect.assertions(1);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", { body: "This is a body", bodyEncoding: "utf32" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_ENCODING_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must throw an ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID error when the automatic JSON HTTP response parse option in the options argument is not a boolean", () => {
		expect.assertions(2);
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { autoJSONResponseParse: 1234 });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID);
		}
		try {
			// @ts-ignore
			let httpClientInstance = new HTTPClient("http://www.example.com/", { autoJSONResponseParse: "true" });
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_AUTO_JSON_RESPONSE_PARSE_OPTION_TYPE_INVALID);
		}
	});

	test("An attempt to create an HTTP Client instance must return an HTTPClient instance when valid options are passed", () => {
		expect.assertions(3);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/");
			expect(httpClientInstance).toBeInstanceOf(HTTPClient);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", {
				method: "POST",
				timeout: 60 * 1000,
				body: "This is a body",
				bodyEncoding: "utf8"
			});
			expect(httpClientInstance).toBeInstanceOf(HTTPClient);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/api/v1/createuser", {
				method: "POST",
				headers: {
					"API-Key": "cHakuK4TrOs3NLxlsltR",
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				timeout: 60 * 1000,
				body: JSON_OBJECT
			});
			expect(httpClientInstance).toBeInstanceOf(HTTPClient);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test("An HTTP Client instance must be in the CREATED state after its constructor is called", () => {
		expect.assertions(3);
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/");
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/", {
				method: "POST",
				timeout: 60 * 1000,
				body: "This is a body",
				bodyEncoding: "utf8"
			});
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		} catch (error) {
			throw error; // No error should be catched
		}
		try {
			let httpClientInstance = new HTTPClient("http://www.example.com/api/v1/createuser", {
				method: "POST",
				headers: {
					"API-Key": "cHakuK4TrOs3NLxlsltR",
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				timeout: 60 * 1000,
				body: JSON_OBJECT
			});
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test("An HTTP Client instance must return a Promise object when its makeRequest(...) method is called and it is in the CREATED state", async () => {
		expect.assertions(2);
		let httpClientInstance = new HTTPClient(httpTestServerBaseURL);
		expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
		let httpClientInstancePromise = httpClientInstance.makeRequest();
		expect(httpClientInstancePromise).toBeInstanceOf(Promise);
		await httpClientInstancePromise;
	});

	test("An HTTP Client instance must be in the REQUESTING state after its makeRequest(...) method is called", async () => {
		expect.assertions(1);
		let httpClientInstance = new HTTPClient(httpTestServerBaseURL);
		let httpClientInstancePromise = httpClientInstance.makeRequest();
		expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
		await httpClientInstancePromise;
	});

	test("An HTTP Client instance in the REQUESTING state must return the same Promise object that was returned on the first call to its makeRequest(...) method after its makeRequest(...) method is called again", async () => {
		expect.assertions(2);
		let httpClientInstance = new HTTPClient(httpTestServerBaseURL);
		let httpClientInstancePromise = httpClientInstance.makeRequest();
		expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
		expect(httpClientInstance.makeRequest()).toBe(httpClientInstancePromise);
		await httpClientInstancePromise;
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE when its makeRequest(...) method is called and the HTTP request body object is not serializable", async () => {
		expect.assertions(3);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: {
					firstName: "John",
					lastName: "Smith",
					username: "jsmith"
				}
			};
			httpRequestOptions.body._self = httpRequestOptions.body; // This makes the object not serializable
			httpClientInstance = new HTTPClient(checkJSONURL, httpRequestOptions);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_BODY_OBJECT_NOT_SERIALIZABLE);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, the server has not returned a response, and has its connection severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(silentRejectionURL);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_BROKEN_PIPE error when the HTTP request has a request body, the server has not returned a response, and has its connection severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(silentRejectionURL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_BROKEN_PIPE);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_RESPONSE_TIMED_OUT error when the HTTP request has no request body, the server has not returned a response, and has the connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(silentTimeoutURL, { timeout: 200 });
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_RESPONSE_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, the server has not returned a response, and has the connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(silentTimeoutURL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, the server has not returned a response, and has the connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(silentTimeoutURL);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_BROKEN_PIPE error when the HTTP request has a request body, the server has not returned a response, and has the connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(silentTimeoutURL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_BROKEN_PIPE);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has no request body, the server has returned a partial response, and has its connection severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(noisyRejectionURL);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_NETWORK_CONNECTION_RESET error when the HTTP request has a request body, the server has returned a partial response, and has its connection is severed from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(noisyRejectionURL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_RESPONSE_TIMED_OUT error when the HTTP request has no request body, the server has returned a partial response, and has its connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(noisyTimeoutURL, { timeout: 200 });
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_RESPONSE_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_RESPONSE_TIMED_OUT error when the HTTP request has a request body, the server has returned a partial response, and has its connection time out from the client side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				timeout: 200,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(noisyTimeoutURL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_RESPONSE_TIMED_OUT);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has no request body, the server has returned a partial response, and has its connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			httpClientInstance = new HTTPClient(noisyTimeoutURL, { timeout: 2000 });
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_TIMED_OUT error when the HTTP request has a request body, the server has returned a partial response, and has its connection time out from the server side", async () => {
		expect.assertions(2);
		let httpClientInstance = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				timeout: 2000,
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(noisyTimeoutURL, httpRequestOptions);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_NETWORK_CONNECTION_RESET);
		}
		expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
	});

	test("An HTTP Client instance in the CANCELLING state must return the same Promise object that was returned on the first call to its cancelRequest(...) method after its cancelRequest(...) method is called again", async () => {
		expect.assertions(7);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			httpClientInstance = new HTTPClient(httpTestServerBaseURL);
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
		let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
		expect(httpClientInstanceCancelResult).toBe(true);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has no request body, the server has not returned a response, and it is cancelled", async () => {
		expect.assertions(4);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			httpClientInstance = new HTTPClient(silentTimeoutURL);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
		expect(httpClientInstanceCancelResult).toBe(true);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has no request body, the server has returned a partial response, and it is cancelled", async () => {
		expect.assertions(4);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			httpClientInstance = new HTTPClient(noisyTimeoutURL);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
		expect(httpClientInstanceCancelResult).toBe(true);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has a request body, the server has not returned a response, and it is cancelled", async () => {
		expect.assertions(4);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(silentTimeoutURL, httpRequestOptions);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
		expect(httpClientInstanceCancelResult).toBe(true);
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_CANCELLED error when the HTTP request has a request body, the server has returned a partial response, and it is cancelled", async () => {
		expect.assertions(4);
		let httpClientInstance = null;
		let httpClientInstancePromise = null;
		let httpClientInstanceCancelPromise = null;
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream" },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			httpClientInstance = new HTTPClient(noisyTimeoutURL, httpRequestOptions);
			httpClientInstancePromise = httpClientInstance.makeRequest();
			await new SimpleTimer(200).start();
			httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
			await httpClientInstancePromise;
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
		}
		let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
		expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
		expect(httpClientInstanceCancelResult).toBe(true);
	});

	test(`An HTTP Client instance must return a 200 status code, an "OK" status message, an "application/octet-stream" content-type header, a "${PATTERN_SIZE}" content-length header, and a matching pattern when the correct pattern is sent as the request body.`, async () => {
		expect.assertions(10);
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/octet-stream", "Content-Length": PATTERN_SIZE },
				body: Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING)
			};
			let httpClientInstance = new HTTPClient(checkPatternURL, httpRequestOptions);
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

	test(`An HTTP Client instance must return a 200 status code, an "OK" status message, a "text/plain" content-type header, an appropriate content-length header, and a matching string when the correct string is sent as the request body.`, async () => {
		expect.assertions(10);
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "text/plain" },
				body: PATTERN_STRING.repeat(PATTERN_STRING_REPEAT),
				bodyEncoding: PATTERN_ENCODING
			};
			let httpClientInstance = new HTTPClient(checkStringURL, httpRequestOptions);
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

	test(`An HTTP Client instance must return a 200 status code, an "OK status message, an "application/json" content-type header, and a mathing JSON object when the correct JSON object is sent as the request body.`, async () => {
		expect.assertions(8);
		try {
			let httpRequestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON_OBJECT
			};
			let httpClientInstance = new HTTPClient(checkJSONURL, httpRequestOptions);
			let httpClientResponse = await httpClientInstance.makeRequest();
			expect(httpClientResponse.statusCode).toBe(200);
			expect(httpClientResponse.statusMessage.toUpperCase()).toBe("OK");
			expect("content-type" in httpClientResponse.headers).toBe(true);
			expect(httpClientResponse.headers["content-type"].toLowerCase()).toBe("application/json");
			expect("body" in httpClientResponse).toBe(true);
			expect(typeof httpClientResponse.body).toBe("object");
			expect(httpClientResponse.body).toStrictEqual(JSON_OBJECT);
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test(`An HTTP Client instance must return a 204 status code and a "No content" status message when a request to a URL that provides a response with no content is made.`, async () => {
		expect.assertions(4);
		try {
			let httpClientInstance = new HTTPClient(silentResponseURL);
			let httpClientResponse = await httpClientInstance.makeRequest();
			expect(httpClientResponse.statusCode).toBe(204);
			expect(httpClientResponse.statusMessage.toUpperCase()).toBe("NO CONTENT");
			expect("body" in httpClientResponse).toBe(false);
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
		} catch (error) {
			throw error; // No error should be catched
		}
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE error when the HTTP client is not is not in a state that allows making HTTP requests", async () => {
		expect.assertions(21);

		// Test for the FULFILLED state (4 assertions)
		try {
			let httpClientInstance = new HTTPClient(httpTestServerBaseURL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			let httpClientInstancePromise = httpClientInstance.makeRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
			await httpClientInstancePromise;
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
			await httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
		}

		// Test for the CANCELLING state (5 assertions)
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;
			let httpClientInstanceCancelPromise = null;
			try {
				httpClientInstance = new HTTPClient(httpTestServerBaseURL);
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

		// Test for the CANCELLED state (7 assertions)
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;
			let httpClientInstanceCancelPromise = null;
			try {
				httpClientInstance = new HTTPClient(httpTestServerBaseURL);
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
				await httpClientInstancePromise;
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
			}
			let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
			expect(httpClientInstanceCancelResult).toBe(true);
			httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
		}

		// Test for the FAILED state (5 assertions)
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;

			try {
				httpClientInstance = new HTTPClient(noisyTimeoutURL, { timeout: 200 });
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				await httpClientInstancePromise;
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_RESPONSE_TIMED_OUT);
			}
			expect(httpClientInstance.state).toBe(HTTPClient.FAILED);
			httpClientInstance.makeRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_MAKE_REQUEST_UNAVAILABLE);
		}
	});

	test("An HTTP Client instance must throw an ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE error when the HTTP client is not is not in a state that allows requesting the HTTP request cancellation", async () => {
		expect.assertions(13);

		// Test for the CREATED state (2 assertions)
		try {
			let httpClientInstance = new HTTPClient(httpTestServerBaseURL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			httpClientInstance.cancelRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE);
		}

		// Test for the FULFILLED state (4 assertions)
		try {
			let httpClientInstance = new HTTPClient(httpTestServerBaseURL);
			expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
			let httpClientInstancePromise = httpClientInstance.makeRequest();
			expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
			await httpClientInstancePromise;
			expect(httpClientInstance.state).toBe(HTTPClient.FULFILLED);
			httpClientInstance.cancelRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE);
		}

		// Test for the CANCELLED state (7 assertions)
		try {
			let httpClientInstance = null;
			let httpClientInstancePromise = null;
			let httpClientInstanceCancelPromise = null;
			try {
				httpClientInstance = new HTTPClient(httpTestServerBaseURL);
				expect(httpClientInstance.state).toBe(HTTPClient.CREATED);
				httpClientInstancePromise = httpClientInstance.makeRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.REQUESTING);
				httpClientInstanceCancelPromise = httpClientInstance.cancelRequest();
				expect(httpClientInstance.state).toBe(HTTPClient.CANCELLING);
				await httpClientInstancePromise;
			} catch (error) {
				expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCELLED);
			}
			let httpClientInstanceCancelResult = await httpClientInstanceCancelPromise;
			expect(httpClientInstance.state).toBe(HTTPClient.CANCELLED);
			expect(httpClientInstanceCancelResult).toBe(true);
			httpClientInstance.cancelRequest();
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPClient.errors.ERROR_HTTP_REQUEST_CANCEL_UNAVAILABLE);
		}
	});
});

// Stops the HTTP Test Server after running the tests
afterAll(async () => {
	// Requests the HTTP Test Server worker to stop the server
	httpTestServerWorker.postMessage({ action: "server-stop" });

	// Waits for the HTTP Test Server worker to stop the server
	await new Promise((resolve, reject) => {
		// Creates a "server-stop" message event listener
		const serverStopMessageEventListener = (message) => {
			if (message.action !== "server-stop") {
				return;
			}

			// Removes the "server-stop" message event listener
			httpTestServerWorker.off("message", serverStopMessageEventListener);

			if (message.result === "SUCCESS") {
				resolve();
			} else {
				reject(message.error);
			}
		};

		httpTestServerWorker.on("message", serverStopMessageEventListener);
	});

	// Waits for the HTTP Test Server worker thread to exit
	await httpTestServerWorkerExitPromise;
});
