/**
 * @module http-test-server
 * @description HTTP test server for the HTTP client.
 * @license GPL-3.0-only
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Module imports
const http = require("node:http");
const crypto = require("node:crypto");
const chalk = require("chalk");

// Constants
const SERVER_PORT = 8080;
const SERVER_HOST = "127.0.0.1";
const DEFAULT_TIMEOUT = 1 * 1000; // 1 second
const NOISY_REJECTION_SEND_RESPONSE_INTERVAL = 10; // 10 miliseconds
const NOISY_REJECTION_SEND_RESPONSE_TIMER = 100; // 100 miliseconds
const NOISY_TIMEOUT_SEND_RESPONSE_INTERVAL = 10; // 10 miliseconds
const NOISY_TIMEOUT_SEND_RESPONSE_TIMER = 100; // 100 miliseconds
const BIG_FILE_SIZE = 50 * 1000 * 1000; // 50 MB
const PATTERN_STRING = "This is a pattern!";
const PATTERN_ENCODING = "utf8";
const PATTERN_SIZE = 2 * 1000 * 1000; // 2 MB

// Creates the HTTP server and starts listening
let httpServer = http.createServer();

try {
	httpServer.listen(SERVER_PORT, SERVER_HOST);
} catch (error) {
	throw error;
}

console.log(`HTTP Test Server listening on ${SERVER_HOST}:${SERVER_PORT}`);

// Processes the HTTP server "request" event
httpServer.on("request", async (request, response) => {
	// Logs the request itself and the timestamp
	console.log(chalk.bgWhiteBright.black.bold(`Request received on ${new Date().toLocaleString()}`));
	console.log(`${request.method} ${request.url} HTTP/${request.httpVersion}`);

	// Logs the request headers
	for (header in request.headers) {
		console.log(`${header}: ${request.headers[header]}`);
	}

	// Creates a URL object
	const url = new URL(request.url, `http://${request.headers.host}`);

	// HTTP server request state variables
	let silentTimeoutTimer = null;
	let noisyRejectionSendResponseTimer = null;
	let noisyRejectionSendResponseInterval = null;
	let noisyTimeoutSendResponseTimer = null;
	let noisyTimeoutSendResponseInterval = null;
	let noisyTimeoutTimer = null;
	let requestBodyBuffer = null;
	let requestBodyBufferSize = 0;
	let requestBodyArrayOfBuffers = [];

	// Processes the HTTP server request "error" event
	request.on("error", (error) => {
		console.log(`An ${error.code} error occurred while receiving the request.`);

		clearTimersAndIntervals();

		// Destroys the request socket
		request.destroy();
	});

	// Processes the HTTP server response "error" event
	response.on("error", (error) => {
		console.log(`An ${error.code} error occurred while sending the response.`);

		clearTimersAndIntervals();

		// Destroys the response socket
		response.destroy();
	});

	// Executes the silent rejection path
	if (url.pathname === "/silentrejection") {
		console.log("Silent rejection path requested.");
		request.destroy();
		return;
	}

	// Executes the silent timeout path
	if (url.pathname === "/silenttimeout") {
		console.log("Silent timeout path requested.");

		// Sets the silent timeout timer
		silentTimeoutTimer = setTimeout(() => {
			console.log("Silent timeout timer done, destroying the request.");
			request.destroy();
		}, DEFAULT_TIMEOUT);

		return;
	}

	// Processes the HTTP server request "data" event
	request.on("data", (chunk) => {
		requestBodyArrayOfBuffers.push(chunk);
		requestBodyBufferSize = requestBodyBufferSize + chunk.length;
	});

	// Processes the HTTP server request "end" event
	request.on("end", () => {
		if (requestBodyBufferSize > 0) {
			console.log(`Received a request body with a size of ${requestBodyBufferSize} bytes.`);
			requestBodyBuffer = Buffer.concat(requestBodyArrayOfBuffers);
			requestBodyArrayOfBuffers = null; // Reduces memory usage
		} else {
			console.log("No request body.");
		}
	});

	// Processes the HTTP server request "close" event
	request.on("close", () => {
		console.log("The request stream has been closed, sending the response...");

		// Executes the noisy rejection path
		if (url.pathname === "/noisyrejection") {
			console.log("Noisy rejection path requested.");

			// Writes the response status and headers
			response.setHeader("Content-Type", "text/plain; charset=UTF-8");
			response.writeHead(200);

			// Sets the noisy rejection send response interval
			noisyRejectionSendResponseInterval = setInterval(() => {
				response.write("I'll stop sending chunks soon!\n");
			}, NOISY_REJECTION_SEND_RESPONSE_INTERVAL);

			// Sets the noisy rejection send response timer
			noisyRejectionSendResponseTimer = setTimeout(() => {
				response.write("Last chunk!\n");
				clearInterval(noisyRejectionSendResponseInterval);
				noisyRejectionSendResponseInterval = null;
				response.destroy();
			}, NOISY_REJECTION_SEND_RESPONSE_TIMER);

			return;
		}

		// Executes the noisy timeout path
		if (url.pathname === "/noisytimeout") {
			console.log("Noisy timeout path requested.");

			// Writes the response status and headers
			response.setHeader("Content-Type", "text/plain; charset=UTF-8");
			response.writeHead(200);

			// Sets the noisy timeout send response interval
			noisyTimeoutSendResponseInterval = setInterval(() => {
				response.write("I'll stop sending chunks soon!\n");
			}, NOISY_TIMEOUT_SEND_RESPONSE_INTERVAL);

			// Sets the noisy timeout send response timer
			noisyTimeoutSendResponseTimer = setTimeout(() => {
				response.write("Last chunk!\n");
				clearInterval(noisyTimeoutSendResponseInterval);
				noisyTimeoutSendResponseInterval = null;
			}, NOISY_TIMEOUT_SEND_RESPONSE_TIMER);

			// Sets the noisy timeout timer
			noisyTimeoutTimer = setTimeout(() => {
				console.log("Noisy timeout timer done, destroying the request.");
				response.destroy();
			}, DEFAULT_TIMEOUT);

			return;
		}

		// Executes the big random file path
		if (url.pathname === "/bigrandomfile") {
			console.log("Big random file path requested.");

			// Writes the response status and headers
			response.setHeader("Content-Type", "application/octet-stream");
			response.setHeader("Content-Length", BIG_FILE_SIZE);
			response.setHeader("Content-Disposition", 'attachment; filename="bigfile.bin"');
			response.writeHead(200);

			// Writes the file contents
			let responseBodyRemainingBytes = BIG_FILE_SIZE;
			let responseBodyMaxChunkSize = response.writableHighWaterMark;
			let responseBodyChunk = null;
			let writeResponseBody = () => {
				while (responseBodyRemainingBytes > 0) {
					let responseBodyWriteResult = null;
					let responseBodyChunkSize = null;

					// Calculates the HTTP response body chunk size
					if (responseBodyRemainingBytes > responseBodyMaxChunkSize) {
						responseBodyChunkSize = responseBodyMaxChunkSize;
					} else {
						responseBodyChunkSize = responseBodyRemainingBytes;
					}
					// Generates a chunk of the HTTP response body
					responseBodyChunk = crypto.randomBytes(responseBodyChunkSize);

					// Writes a chunk of the HTTP response body
					responseBodyWriteResult = response.write(responseBodyChunk);
					responseBodyRemainingBytes = responseBodyRemainingBytes - responseBodyChunkSize;
					if (responseBodyWriteResult === false) {
						response.once("drain", writeResponseBody);
						return;
					}
				}
				// Finishes writting the response body
				response.end();
			};
			writeResponseBody();

			return;
		}

		// Executes the check pattern path
		if (url.pathname === "/checkpattern") {
			console.log("Check pattern path requested.");

			// Creates a new Buffer object with the pattern
			let patternBuffer = Buffer.alloc(PATTERN_SIZE, PATTERN_STRING, PATTERN_ENCODING);

			// Checks if the request has the correct method, content-type header and body
			if (
				request.method.toUpperCase() !== "POST" ||
				"content-type" in request.headers === false ||
				request.headers["content-type"].toLowerCase() !== "application/octet-stream" ||
				Buffer.compare(patternBuffer, requestBodyBuffer) !== 0
			) {
				console.log("The HTTP request pattern does not match.");
				response.writeHead(400);
				response.end();
				return;
			}

			console.log("The HTTP request pattern matches.");

			patternBuffer = null; // Reduces memory usage

			console.log("Sending the HTTP response pattern...");

			response.setHeader("Content-Type", "application/octet-stream");
			response.setHeader("Content-Length", PATTERN_SIZE);
			response.writeHead(200);

			let responseBodyBufferPointer = 0;
			let responseBodyBufferSize = requestBodyBuffer.length;
			let maxResponseChunkSize = response.writableHighWaterMark;

			let writeResponseBody = () => {
				while (responseBodyBufferPointer < responseBodyBufferSize) {
					let writeResponseBodyResult = null;
					let responseBodyChunkSize = null;
					let responseBodyChunk = null;

					// Calculates the HTTP response body chunk size
					if (responseBodyBufferSize - responseBodyBufferPointer < maxResponseChunkSize) {
						responseBodyChunkSize = responseBodyBufferSize - responseBodyBufferPointer;
					} else {
						responseBodyChunkSize = maxResponseChunkSize;
					}

					// Gets a chunk of the HTTP response body buffer
					responseBodyChunk = requestBodyBuffer.subarray(
						responseBodyBufferPointer,
						responseBodyBufferPointer + responseBodyChunkSize
					);

					// Writes a chunk of the HTTP response body buffer
					writeResponseBodyResult = response.write(responseBodyChunk);
					responseBodyBufferPointer = responseBodyBufferPointer + responseBodyChunkSize;
					if (writeResponseBodyResult === false) {
						response.once("drain", writeResponseBody);
						return;
					}
				}
				// Finishes writing the response body
				console.log("Finished sending the HTTP response pattern.");
				response.end();
			};

			writeResponseBody();

			return;
		}

		// Writes the response status and headers
		response.setHeader("Content-Type", "text/html; charset=UTF-8");
		response.writeHead(200);

		// Writes the welcome page
		response.write(
			"<html><head><title>HTTP Test Server</title></head><body><h1>Welcome to the HTTP Test Server!</h1></body></html>"
		);

		// Finishes the response
		response.end();
	});

	// Processes the HTTP server response "finish" event
	response.on("finish", () => {
		// This event is not used
	});

	// Processes the HTTP server response "close" event
	response.on("close", () => {
		console.log("The response stream has been closed.");

		clearTimersAndIntervals();
	});

	// Clears all the timers and intervals
	function clearTimersAndIntervals() {
		// Clears the silent timeout timer
		if (silentTimeoutTimer !== null) {
			clearTimeout(silentTimeoutTimer);
			silentTimeoutTimer = null;
			console.log("Silent timeout timer cleared.");
		}

		// Clears the noisy rejection send response interval
		if (noisyRejectionSendResponseInterval !== null) {
			clearInterval(noisyRejectionSendResponseInterval);
			noisyRejectionSendResponseInterval = null;
			console.log("Noisy rejection send response interval cleared.");
		}

		// Clears the noisy rejection send response timer
		if (noisyRejectionSendResponseTimer !== null) {
			clearTimeout(noisyRejectionSendResponseTimer);
			noisyRejectionSendResponseTimer = null;
			console.log("Noisy rejection send response timer cleared.");
		}

		// Clears the noisy timeout send response interval
		if (noisyTimeoutSendResponseInterval !== null) {
			clearInterval(noisyTimeoutSendResponseInterval);
			noisyTimeoutSendResponseInterval = null;
			console.log("Noisy timeout send response interval cleared.");
		}

		// Clears the noisy timeout send response timer
		if (noisyTimeoutSendResponseTimer !== null) {
			clearTimeout(noisyTimeoutSendResponseTimer);
			noisyTimeoutSendResponseTimer = null;
			console.log("Noisy timeout send response timer cleared.");
		}

		// Clears the noise timeout timer
		if (noisyTimeoutTimer !== null) {
			clearTimeout(noisyTimeoutTimer);
			noisyTimeoutTimer = null;
			console.log("Noisy timeout timer cleared.");
		}
	}
});
