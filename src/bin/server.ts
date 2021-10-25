#!/usr/bin/env node
import { resolve } from "path";
import { Driver, ZWaveError, ZWaveErrorCodes, ZWaveOptions } from "zwave-js";
import { ZwavejsServer } from "../lib/server";
import { createMockDriver } from "../mock";
import { parseArgs } from "../util/parse-args";
import { clearTimeout, setTimeout } from "timers";

const normalizeKey = (key: Buffer | string, keyName: string): Buffer => {
  if (Buffer.isBuffer(key)) return key;
  if (key.length === 32) return Buffer.from(key, "hex");
  // Convert from OpenZWave format
  key = key.toLowerCase();
  if (key.includes("0x"))
    return Buffer.from(key.replace(/0x/g, "").replace(/, /g, ""), "hex");
  throw new Error(`Invalid key format for ${keyName} option`);
};

interface Args {
  _: Array<string>;
  config?: string;
  "mock-driver": boolean;
  port: number;
}

async () => {
  const args = parseArgs<Args>(["_", "config", "mock-driver", "port"]);

  let wsPort = 3000;
  if (args["port"]) {
    if (typeof args["port"] !== "number") {
      throw new Error("port must be a valid integer");
    }
    wsPort = args["port"];
  }

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

  let options: Partial<ZWaveOptions> = {};

  if (configPath) {
    try {
      options = require(configPath);
      // If both securityKeys.S0_Legacy and networkKey are defined, throw an error.
      if (options.securityKeys?.S0_Legacy && options.networkKey) {
        throw new Error(
          "Both `networkKey` and `securityKeys.S0_Legacy` options are present in the " +
            "config. Remove `networkKey`."
        );
      }
      // We prefer the securityKeys option over the networkKey one
      if (options.securityKeys) {
        let key: keyof typeof options.securityKeys;
        for (key in options.securityKeys) {
          if (key in options.securityKeys) {
            options.securityKeys[key] = normalizeKey(
              options.securityKeys[key]!,
              `securityKeys.${key}`
            );
          }
        }
      }
      // If we get here, securityKeys.S0_Legacy is not defined, so we can safely use networkKey
      // make sure that networkKey is passed as buffer and accept both zwave2mqtt format and ozw format
      if (options.networkKey) {
        if (!options.securityKeys) options.securityKeys = {};
        options.securityKeys.S0_Legacy = normalizeKey(
          options.networkKey,
          "networkKey"
        );
        console.warn(
          "The `networkKey` option is deprecated in favor of `securityKeys` option. To eliminate " +
            "this warning, move your networkKey into the securityKeys.S0_Legacy option. Refer to " +
            "the Z-Wave JS docs for more information"
        );
        delete options.networkKey;
      } else if (!options.networkKey && !options.securityKeys!.S0_Legacy)
        throw new Error("Error: `securityKeys.S0_Legacy` key is missing.");
    } catch (err) {
      console.error(`Error: failed loading config file ${configPath}`);
      console.error(err);
      return;
    }
  }

  let driver: Driver | null = null;
  let server: ZwavejsServer | null = null;
  let handle: NodeJS.Timeout | undefined = undefined;

  const onDriverError = async (error: Error): Promise<void> => {
    console.error("Error in driver", error);
    // Driver_Failed cannot be recovered by zwave-js, requires a manual restart
    if (
      error instanceof ZWaveError &&
      error.code === ZWaveErrorCodes.Driver_Failed
    ) {
      console.error("Attempting to restart driver in 5 seconds...");
      handle = setTimeout(startServer, 5000);
    }
  };

  const startServer = async (): Promise<void> => {
    handle = undefined;
    try {
      if (server) {
        await server.destroy();
        server = null;
      }
      if (driver) {
        await driver.destroy();
        driver = null;
      }

      driver = args["mock-driver"]
        ? createMockDriver()
        : new Driver(serialPort, options);

      driver.on("error", onDriverError);

      driver.on("driver ready", async () => {
        try {
          server = new ZwavejsServer(driver as Driver, { port: wsPort });
          await server.start();
          console.info("Server listening on port", wsPort);
        } catch (error) {
          console.error("Unable to start Server", error);
        }
      });

      await driver.start();
    } catch (err: any) {
      console.error(
        `Error while starting driver, trying again in 5 seconds: ${err.message}`
      );
      handle = setTimeout(startServer, 5000);
    }
  };

  await startServer();

  let closing = false;

  const handleShutdown = async () => {
    if (handle) {
      clearTimeout(handle);
    }

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
    if (driver) {
      await driver.destroy();
    }
    process.exit();
  };

  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
};
