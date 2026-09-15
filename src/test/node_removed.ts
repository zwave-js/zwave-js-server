import * as assert from "node:assert";
import { mock } from "node:test";
import { setImmediate as nextTick } from "node:timers/promises";
import { MultiChannelCCValues } from "@zwave-js/cc";
import { createThrowingMap } from "@zwave-js/shared";
import {
  Driver,
  RemoveNodeReason,
  ZWaveError,
  ZWaveErrorCodes,
  ZWaveNode,
} from "zwave-js";
import ws from "ws";
import { maxSchemaVersion } from "../lib/const.js";
import { EventForwarder } from "../lib/forward.js";
import type { OutgoingMessage } from "../lib/outgoing_message.js";
import {
  Client,
  ClientsController,
  Logger,
  ZwavejsServer,
  ZwavejsServerRemoteController,
} from "../lib/server.js";
import { dumpNode } from "../lib/state.js";
import { createMockDriver } from "../mock/index.js";
import { stringifyReplacer } from "../util/stringify.js";

function createFixture() {
  const driver = createMockDriver();
  const nodes = createThrowingMap<number, ZWaveNode>((nodeId) => {
    throw new ZWaveError(
      `Node ${nodeId} was not found!`,
      ZWaveErrorCodes.Controller_NodeNotFound,
    );
  });
  const networkCache = new Map<string, unknown>();
  Object.assign(driver.controller, { nodes, ownNodeId: 1 });
  Object.assign(driver, {
    networkCache,
    valueDB: new Map(),
    metadataDB: new Map(),
    cacheGet: (key: string) => networkCache.get(key),
    cacheSet: (key: string, value: unknown) => networkCache.set(key, value),
    getValueDB: Driver.prototype.getValueDB,
  });
  const errors: unknown[] = [];
  const logger: Logger = {
    error: (...args) => errors.push(args),
    warn() {},
    info() {},
    debug() {},
  };
  const remoteController = new ZwavejsServerRemoteController(
    driver,
    new ZwavejsServer(driver),
  );
  const clients = new ClientsController(driver, logger, remoteController);
  new EventForwarder(clients).start();
  const node = new ZWaveNode(2, driver);
  nodes.set(node.id, node);
  node.valueDB.setValue(MultiChannelCCValues.endpointCountIsDynamic.id, false, {
    noEvent: true,
  });

  function addClient(
    schemaVersion: number,
    receiveEvents = true,
    connected = true,
  ) {
    const messages: OutgoingMessage[] = [];
    // @ts-expect-error @types/ws omits the server-side options argument
    const socket = new ws(null, undefined, {});
    mock.getter(socket, "readyState", () => (connected ? ws.OPEN : ws.CLOSED));
    mock.method(socket, "send", (data: string) => {
      messages.push(JSON.parse(data));
    });
    const client = new Client(
      socket,
      clients,
      driver,
      logger,
      remoteController,
    );
    client.schemaVersion = schemaVersion;
    client.receiveEvents = receiveEvents;
    clients.clients.push(client);
    return messages;
  }

  return { driver, nodes, node, clients, errors, addClient };
}

export async function runNodeRemovedTests() {
  try {
    for (const busy of [false, true]) {
      for (const reason of [
        RemoveNodeReason.Excluded,
        RemoveNodeReason.RemoveFailed,
        RemoveNodeReason.Replaced,
        RemoveNodeReason.ProxyReplaced,
      ]) {
        const { driver, nodes, node, clients, errors, addClient } =
          createFixture();
        const schemas = [0, 28, 29, maxSchemaVersion, maxSchemaVersion];
        const messages = schemas.map((schema) => addClient(schema));
        const expectedNodes = schemas.map((schema) =>
          JSON.parse(JSON.stringify(dumpNode(node, schema), stringifyReplacer)),
        );
        const dumpCalls = mock.method(node, "getAllEndpoints");
        const replaced = [
          RemoveNodeReason.Replaced,
          RemoveNodeReason.ProxyReplaced,
        ].includes(reason);

        if (busy) driver.controller.emit("exclusion stopped");
        driver.controller.emit("node removed", node, reason);
        const lateMessages = addClient(maxSchemaVersion);
        nodes.delete(node.id);
        let replacement: ZWaveNode | undefined;
        if (replaced) {
          replacement = new ZWaveNode(node.id, driver);
          nodes.set(replacement.id, replacement);
          replacement.valueDB.setValue(
            MultiChannelCCValues.endpointCountIsDynamic.id,
            true,
            { noEvent: true },
          );
        }
        if (busy) {
          for (const received of messages) {
            assert.equal(
              received.some(
                (msg) =>
                  msg.type === "event" && msg.event.event === "node removed",
              ),
              false,
            );
          }
        }
        for (let i = 0; i <= schemas.length * 2; i++) await nextTick();

        for (const [index, schema] of schemas.entries()) {
          assert.deepEqual(messages[index], [
            ...(busy
              ? [
                  {
                    type: "event",
                    event: { source: "controller", event: "exclusion stopped" },
                  },
                ]
              : []),
            {
              type: "event",
              event: {
                source: "controller",
                event: "node removed",
                node: expectedNodes[index],
                ...(schema <= 28 ? { replaced } : { reason }),
              },
            },
          ]);
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(lateMessages, []);
        assert.equal(dumpCalls.mock.callCount(), new Set(schemas).size);
        clients.clients = [];
        node.destroy();
        replacement?.destroy();
      }
    }

    for (const filteredClients of [false, true]) {
      const { driver, nodes, node, errors, addClient } = createFixture();
      const dumpCalls = mock.method(node, "getAllEndpoints");
      if (filteredClients) {
        addClient(maxSchemaVersion, false);
        addClient(maxSchemaVersion, true, false);
      }
      nodes.delete(node.id);
      driver.controller.emit("node removed", node, RemoveNodeReason.Excluded);
      await nextTick();
      assert.equal(dumpCalls.mock.callCount(), 0);
      assert.deepEqual(errors, []);
      node.destroy();
    }

    {
      const { driver, nodes, node, errors, addClient } = createFixture();
      const messages = [addClient(28), addClient(maxSchemaVersion)];
      const failure = new Error("Snapshot getter failed");
      mock.getter(node, "endpointCountIsDynamic", () => {
        throw failure;
      });
      assert.doesNotThrow(() =>
        driver.controller.emit("node removed", node, RemoveNodeReason.Excluded),
      );
      nodes.delete(node.id);
      driver.controller.emit("exclusion stopped");
      for (let i = 0; i < 5; i++) await nextTick();
      for (const received of messages) {
        assert.deepEqual(received, [
          {
            type: "event",
            event: { source: "controller", event: "exclusion stopped" },
          },
        ]);
      }
      assert.deepEqual(errors, [
        ["Error sending event to clients", failure],
        ["Error sending event to clients", failure],
      ]);
      node.destroy();
    }

    {
      const { driver, node, clients, errors, addClient } = createFixture();
      const messages = addClient(maxSchemaVersion);
      driver.controller.emit("exclusion stopped");
      const createEvent = mock.fn(() => ({
        source: "controller" as const,
        event: "exclusion failed",
      }));
      clients.sendEventToListeningClients(createEvent);
      assert.equal(createEvent.mock.callCount(), 0);
      for (let i = 0; i < 3; i++) await nextTick();
      assert.equal(createEvent.mock.callCount(), 1);
      assert.equal(messages.length, 2);
      assert.deepEqual(errors, []);
      node.destroy();
    }

    {
      const { driver, nodes, node, clients, errors, addClient } =
        createFixture();
      const failedMessages = addClient(maxSchemaVersion);
      const messages = addClient(maxSchemaVersion);
      const failure = new Error("Socket send failed");
      mock.method(clients.clients[0], "sendEvent", () => {
        throw failure;
      });
      driver.controller.emit("node removed", node, RemoveNodeReason.Excluded);
      nodes.delete(node.id);
      for (let i = 0; i < 3; i++) await nextTick();
      assert.deepEqual(failedMessages, []);
      assert.equal(messages.length, 1);
      assert.deepEqual(errors, [["Error sending event to clients", failure]]);
      node.destroy();
    }
  } finally {
    mock.restoreAll();
  }
}
