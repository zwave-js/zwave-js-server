#!/usr/bin/env node

import { resolve } from "path";
import { Driver } from "zwave-js";
import { ZwavejsServer } from "../lib/server";
import { createMockDriver } from "../mock";
import { parseArgs } from "../util/parse-args";

interface Args {
  _: Array<string>;
  config?: string;
  "mock-driver": boolean;
  "websocket-port": number;
}

(async () => {
  const args = parseArgs<Args>([
    "_",
    "config",
    "mock-driver",
    "websocket-port",
  ]);

  if (args["mock-driver"]) {
    args._.push("mock-serial-port");
  }

  if (args._.length < 1) {
    console.error("Error: Missing path to serial port");
    return;
  }

  const serialPort = args._[0];

  let configPath = args.config;
  if (configPath && configPath.substring(0, 1) !== "/") {
    configPath = resolve(process.cwd(), configPath);
  }

  let options;

  if (configPath) {
    try {
      options = require(configPath);
      // make sure that networkKey is passed as buffer.
      // accept both zwave2mqtt format as ozw format
      if (options.networkKey && options.networkKey.length === 32) {
        options.networkKey = Buffer.from(options.networkKey, "hex");
      } else if (options.networkKey && options.networkKey.includes("0x")) {
        options.networkKey = options.networkKey
          .replace(/0x/g, "")
          .replace(/, /g, "");
        options.networkKey = Buffer.from(options.networkKey, "hex");
      } else {
        console.error("Error: Invalid networkKey defined");
        return;
      }
    } catch (err) {
      console.error(`Error: failed loading config file ${configPath}`);
      console.error(err);
      return;
    }
  }

  const driver = args["mock-driver"]
    ? createMockDriver()
    : new Driver(serialPort, options);

  driver.on("error", (e) => {
    console.error("Error in driver", e);
  });

  let server: ZwavejsServer;

  driver.on("driver ready", async () => {
    try {
      let wsPort = 3000;
      if (args["websocket-port"]) {
        wsPort = args["websocket-port"];
      }
      server = new ZwavejsServer(driver, { port: wsPort });
      await server.start();
      console.info("Server listening on port", wsPort);
    } catch (error) {
      console.error("Unable to start Server", error);
    }
  });

  await driver.start();

  let closing = false;

  const handleShutdown = async () => {
    // Pressing ctrl+c twice.
    if (closing) {
      process.exit();
    }

    // Close gracefully
    closing = true;
    console.log("Shutting down");
    if (server) {
      await server.destroy();
    }
    await driver.destroy();
    process.exit();
  };

  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
})().catch((err) => {
  console.error("Unable to start driver", err);
});
