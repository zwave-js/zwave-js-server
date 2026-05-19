import * as assert from "assert";
import dns from "node:dns";
import ws from "ws";
import type { LogConfig } from "@zwave-js/core";
import Transport from "winston-transport";
import { libVersion } from "zwave-js";
import { ZwavejsServer } from "../lib/server.js";
import { createMockDriver } from "../mock/index.js";
import { minSchemaVersion, maxSchemaVersion } from "../lib/const.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

dns.setDefaultResultOrder("ipv4first");

const PORT = 45001;
type LogTransport = LogConfig["transports"][number];

const createNextMessage = (socket: ws) => {
  let waitingListener: ((msg: unknown) => void) | undefined;
  const pendingMessages: unknown[] = [];

  socket.on("message", (data: string) => {
    const msg = JSON.parse(data);
    if (!waitingListener) {
      pendingMessages.push(msg);
      return;
    }
    const listener = waitingListener;
    waitingListener = undefined;
    listener(msg);
  });

  return () => {
    if (pendingMessages.length) {
      return pendingMessages.splice(0, 1)[0];
    }
    return new Promise((resolve) => {
      waitingListener = resolve;
    });
  };
};

const waitForResult = async (
  nextMessage: ReturnType<typeof createNextMessage>,
  messageId: string,
) => {
  for (;;) {
    const message = await Promise.race([
      nextMessage(),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Timed out while waiting for result message ${messageId}`,
              ),
            ),
          5000,
        ),
      ),
    ]);
    if (
      typeof message === "object" &&
      message !== undefined &&
      message !== null &&
      "type" in message &&
      message.type === "result" &&
      "messageId" in message &&
      message.messageId === messageId
    ) {
      return message;
    }
  }
};

class MockTransport extends Transport {
  public log(_info: unknown, next: () => void): void {
    next();
  }
}

const runTest = async () => {
  const driver = createMockDriver();
  const customTransport = new MockTransport() as LogTransport;
  driver.updateLogConfig({ transports: [customTransport] });
  const server = new ZwavejsServer(driver, { port: PORT });
  await server.start(true);
  let socket: ws | undefined = undefined;

  try {
    socket = new ws(`ws://localhost:${PORT}`);
    const nextMessage = createNextMessage(socket);
    await new Promise((resolve) => socket!.once("open", resolve));

    assert.deepEqual(await nextMessage(), {
      driverVersion: libVersion,
      homeId: 1,
      serverVersion: require("../../package.json").version,
      minSchemaVersion: minSchemaVersion,
      maxSchemaVersion: maxSchemaVersion,
      type: "version",
    });

    socket.send(
      JSON.stringify({
        command: "initialize",
        messageId: "initialize",
        schemaVersion: maxSchemaVersion,
      }),
    );

    assert.deepEqual(await nextMessage(), {
      type: "result",
      success: true,
      messageId: "initialize",
      result: {},
    });

    socket.send(
      JSON.stringify({
        messageId: "my-msg-id!",
        command: "start_listening",
      }),
    );

    assert.deepEqual(await nextMessage(), {
      type: "result",
      success: true,
      messageId: "my-msg-id!",
      result: {
        state: {
          driver: {
            logConfig: { enabled: true, level: "debug" },
            statisticsEnabled: true,
            ready: true,
            allNodesReady: true,
            configVersion: "0.0.0-mock",
          },
          controller: { homeId: 1 },
          nodes: [],
        },
      },
    });

    socket.send(
      JSON.stringify({
        messageId: "start-listening-logs",
        command: "driver.start_listening_logs",
      }),
    );

    assert.deepEqual(await nextMessage(), {
      type: "result",
      success: true,
      messageId: "start-listening-logs",
      result: {},
    });

    assert.equal(
      driver.getLogConfig().transports?.includes(customTransport),
      true,
    );
    assert.equal(driver.getLogConfig().transports?.length, 2);

    socket.send(
      JSON.stringify({
        messageId: "update-log-config",
        command: "driver.update_log_config",
        config: {
          enabled: true,
          level: "info",
          transports: [],
        },
      }),
    );

    assert.deepEqual(await nextMessage(), {
      type: "event",
      event: {
        source: "driver",
        event: "log config updated",
        config: {
          enabled: true,
          level: "info",
        },
      },
    });

    assert.deepEqual(await waitForResult(nextMessage, "update-log-config"), {
      type: "result",
      success: true,
      messageId: "update-log-config",
      result: {},
    });

    assert.equal(driver.getLogConfig().level, "info");
    assert.equal(
      driver.getLogConfig().transports?.includes(customTransport),
      true,
    );
    assert.equal(driver.getLogConfig().transports?.length, 2);

    socket.send(
      JSON.stringify({
        messageId: "stop-listening-logs",
        command: "driver.stop_listening_logs",
      }),
    );

    assert.deepEqual(await nextMessage(), {
      type: "result",
      success: true,
      messageId: "stop-listening-logs",
      result: {},
    });

    assert.deepEqual(driver.getLogConfig().transports, [customTransport]);

    console.log("Integration tests passed :)");
  } finally {
    if (socket) {
      socket.close();
    }
    await server.destroy();
  }
};

runTest();
