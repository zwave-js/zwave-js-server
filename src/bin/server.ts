#!/usr/bin/env node

import * as yargs from 'yargs';
import { resolve } from 'path'
import { Driver } from 'zwave-js'
import { ZwavejsServer } from '../lib/server'
import { createMockDriver } from '../mock'

const argv = yargs.usage('$0 [path]', 'Start the server')
    .option('config', {
    alias: 'c',
    description: 'Configuration file path',
    type: 'string'
  })
  .option('mock', {
    alias: 'm',
    description: 'Mock driver',
    type: 'boolean',
    default: false
  })
  .option('port', {
    alias: 'p',
    description: 'Listening port',
    type: 'number',
    default: 3000
  })
.help().argv;

(async () => {

  if (argv.path === undefined) {
    console.error('Error: Missing path to serial port')
    return
  }

  const serialPort = argv.path as string

  let configPath = argv.config as string
  if (configPath && configPath.substring(0, 1) !== '/') {
    configPath = resolve(process.cwd(), configPath)
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
          .replace("0x", "")
          .replace(", ", "");
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

  const driver = argv.mock as boolean
    ? createMockDriver()
    : new Driver(serialPort, options);

  driver.on("error", (e) => {
    console.error("Error in driver", e);
  });

  driver.on("driver ready", async () => {
    try {
      const server = new ZwavejsServer(driver, { port: argv.port })
      await server.start()
      console.info('Server listening on port', argv.port)
    } catch (error) {
      console.error("Unable to start Server", error);
    }
  });

  await driver.start();
})().catch((err) => {
  console.error("Unable to start driver", err);
});
