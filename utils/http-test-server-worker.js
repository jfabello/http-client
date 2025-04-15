/**
 * @module http-test-server-worker
 * @description Worker for the HTTP Test Server.
 * @license MIT
 * @author Juan F. Abello <juan@jfabello.com>
 */

// Sets strict mode
"use strict";

// Module imports
import { isMainThread, parentPort } from "node:worker_threads";
import { HTTPTestServer } from "@jfabello/http-test-server";
import { ConsoleLogger } from "@jfabello/log-to-console";

// Creates a new console logger instance
const logToConsole = new ConsoleLogger(ConsoleLogger.INFO);

// Checks if the script is running as a worker thread
if (isMainThread === true) {
	logToConsole.error("This script must be run as a worker thread.");
	process.exit(1);
}

async function main() {
	// Creates a new HTTP Test Server instance
	const httpTestServer = new HTTPTestServer({ serverHost: "127.0.0.1", serverPort: 0 });

	// Starts the HTTP Test Server
	try {
		logToConsole.info("Starting the HTTP Test Server...");
		await httpTestServer.start();
		parentPort.postMessage({ action: "server-start", result: "SUCCESS", serverPort: httpTestServer.serverPort });
	} catch (error) {
		logToConsole.error(`Failed to start the HTTP Test Server: ${error.message}`);
		parentPort.postMessage({ action: "server-start", result: "FAILED", error: error });
		process.exit(1);
	}

	// Listens to messages from the parent thread
	parentPort.on("message", async (message) => {
		if (message.action === "server-stop") {
			// Stops the HTTP Test Server
			try {
				logToConsole.info("Stopping the HTTP Test Server...");
				await httpTestServer.stop();
				parentPort.postMessage({ action: "server-stop", result: "SUCCESS" });
				process.exit(0);
			} catch (error) {
				parentPort.postMessage({ action: "server-stop", result: "FAILED", error: error });
				process.exit(1);
			}
		}
	});
}

main();
