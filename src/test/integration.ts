import * as assert from "assert";
import ws from "ws";
import { libVersion } from "zwave-js";
import { ZwavejsServer } from "../lib/server";
import { createMockDriver } from "../mock";
import { minSchemaVersion, maxSchemaVersion } from "../lib/const";

const PORT = 45001;

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

const runTest = async () => {
  const server = new ZwavejsServer(createMockDriver(), { port: PORT });
  await server.start();
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
        messageId: "my-msg-id!",
        command: "start_listening",
      })
    );

    assert.deepEqual(await nextMessage(), {
      type: "result",
      success: true,
      messageId: "my-msg-id!",
      result: {
        state: {
          driver: {
            config: { enabled: true, level: 5 },
            statisticsEnabled: true,
          },
          controller: { homeId: 1 },
          nodes: [],
        },
      },
    });

    console.log("Integration tests passed :)");
  } finally {
    if (socket) {
      socket.close();
    }
    await server.destroy();
  }
};

runTest();
