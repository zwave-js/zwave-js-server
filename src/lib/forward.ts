import {
  ControllerEvents,
  Endpoint,
  FirmwareUpdateProgress,
  FirmwareUpdateResult,
  NodeStatistics,
  NodeStatus,
  RemoveNodeReason,
  ZWaveNode,
  ZWaveNodeEvents,
  ZWaveNodeMetadataUpdatedArgs,
} from "zwave-js";
import { CommandClasses, ConfigurationMetadata } from "@zwave-js/core";
import { OutgoingEvent } from "./outgoing_message";
import {
  dumpConfigurationMetadata,
  dumpFoundNode,
  dumpMetadata,
  dumpNode,
} from "./state";
import { Client, ClientsController } from "./server";
import { NodeNotFoundError } from "./error";

export class EventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clientsController
   */
  constructor(private clientsController: ClientsController) {}

  start() {
    this.clientsController.driver.controller.nodes.forEach((node) =>
      this.setupNode(node),
    );

    // Bind to all controller events
    // https://github.com/zwave-js/node-zwave-js/blob/master/packages/zwave-js/src/lib/controller/Controller.ts#L112

    this.clientsController.driver.controller.on(
      "node added",
      (node, result) => {
        // forward event to all connected clients, respecting schemaVersion it supports
        this.clientsController.clients.forEach((client) =>
          this.sendEvent(client, {
            source: "controller",
            event: "node added",
            node: dumpNode(node, client.schemaVersion),
            result,
          }),
        );
        this.setupNode(node);
      },
    );

    this.clientsController.driver.controller.on("node found", (node) => {
      // forward event to all connected clients, respecting schemaVersion it supports
      this.clientsController.clients
        .filter((client) => client.schemaVersion > 18)
        .forEach((client) =>
          this.sendEvent(client, {
            source: "controller",
            event: "node found",
            node: dumpFoundNode(node, client.schemaVersion),
          }),
        );
    });

    {
      const events: ControllerEvents[] = [
        "inclusion failed",
        "exclusion failed",
        "exclusion started",
        "inclusion stopped",
        "exclusion stopped",
      ];
      for (const event of events) {
        this.clientsController.driver.controller.on(event, () =>
          this.forwardEvent({
            source: "controller",
            event,
          }),
        );
      }
    }

    this.clientsController.driver.controller.on("inclusion started", (secure) =>
      this.forwardEvent({
        source: "controller",
        event: "inclusion started",
        secure,
      }),
    );

    this.clientsController.driver.controller.on(
      "firmware update progress",
      (progress) =>
        this.forwardEvent({
          source: "controller",
          event: "firmware update progress",
          progress,
        }),
    );

    this.clientsController.driver.controller.on(
      "firmware update finished",
      (result) =>
        this.forwardEvent({
          source: "controller",
          event: "firmware update finished",
          result,
        }),
    );

    this.clientsController.driver.controller.on(
      "node removed",
      (node, reason) =>
        // forward event to all connected clients, respecting schemaVersion it supports
        this.clientsController.clients.forEach((client) => {
          if (client.schemaVersion < 29) {
            this.sendEvent(client, {
              source: "controller",
              event: "node removed",
              node: dumpNode(node, client.schemaVersion),
              replaced: [
                RemoveNodeReason.Replaced,
                RemoveNodeReason.ProxyReplaced,
              ].includes(reason),
            });
          } else {
            this.sendEvent(client, {
              source: "controller",
              event: "node removed",
              node: dumpNode(node, client.schemaVersion),
              reason,
            });
          }
        }),
    );

    this.clientsController.driver.controller.on(
      "rebuild routes progress",
      (progress) => {
        this.clientsController.clients.forEach((client) => {
          if (client.schemaVersion <= 31) {
            client.sendEvent({
              source: "controller",
              event: "heal network progress",
              progress: Object.fromEntries(progress),
            });
          } else {
            client.sendEvent({
              source: "controller",
              event: "rebuild routes progress",
              progress: Object.fromEntries(progress),
            });
          }
        });
      },
    );

    this.clientsController.driver.controller.on("status changed", (status) =>
      this.forwardEvent(
        {
          source: "controller",
          event: "status changed",
          status,
        },
        31,
      ),
    );

    this.clientsController.driver.controller.on(
      "rebuild routes done",
      (result) => {
        this.clientsController.clients.forEach((client) => {
          if (client.schemaVersion <= 31) {
            client.sendEvent({
              source: "controller",
              event: "heal network done",
              result: Object.fromEntries(result),
            });
          } else {
            client.sendEvent({
              source: "controller",
              event: "rebuild routes done",
              result: Object.fromEntries(result),
            });
          }
        });
      },
    );

    this.clientsController.driver.controller.on(
      "statistics updated",
      (statistics) =>
        this.forwardEvent({
          source: "controller",
          event: "statistics updated",
          statistics,
        }),
    );

    this.clientsController.driver.controller.on("identify", (triggeringNode) =>
      this.forwardEvent(
        {
          source: "controller",
          event: "identify",
          nodeId: triggeringNode.nodeId,
        },
        31,
      ),
    );
  }

  forwardEvent(data: OutgoingEvent, minSchemaVersion?: number) {
    // Forward event to all clients
    this.clientsController.clients.forEach((client) =>
      this.sendEvent(client, data, minSchemaVersion),
    );
  }

  sendEvent(client: Client, data: OutgoingEvent, minSchemaVersion?: number) {
    // Send event to connected client only
    if (
      client.receiveEvents &&
      client.isConnected &&
      client.schemaVersion >= (minSchemaVersion ?? 0)
    ) {
      client.sendEvent(data);
    }
  }

  setupNode(node: ZWaveNode) {
    // Bind to all node events
    // https://github.com/zwave-js/node-zwave-js/blob/master/packages/zwave-js/src/lib/node/Types.ts#L84-L103
    const notifyNode = (node: ZWaveNode, event: string, extra = {}) =>
      this.forwardEvent({
        source: "node",
        event,
        nodeId: node.nodeId,
        ...extra,
      });

    node.on("ready", (changedNode: ZWaveNode) => {
      // Dump full node state on ready event
      this.clientsController.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "node",
          event: "ready",
          nodeId: changedNode.nodeId,
          nodeState: dumpNode(changedNode, client.schemaVersion),
        }),
      );
    });

    {
      const events: ZWaveNodeEvents[] = ["wake up", "sleep", "dead", "alive"];
      for (const event of events) {
        node.on(event, (changedNode: ZWaveNode, oldStatus: NodeStatus) =>
          notifyNode(changedNode, event, { oldStatus }),
        );
      }
    }

    {
      const events: ZWaveNodeEvents[] = [
        "interview completed",
        "interview started",
        "interview failed",
      ];
      for (const event of events) {
        node.on(event, (changedNode: ZWaveNode, args: any) => {
          notifyNode(changedNode, event, { args });
        });
      }
    }

    node.on(
      "interview stage completed",
      (changedNode: ZWaveNode, stageName: string) => {
        notifyNode(changedNode, "interview stage completed", { stageName });
      },
    );

    {
      const events: ZWaveNodeEvents[] = [
        "value updated",
        "value removed",
        "value added",
        "value notification",
      ];
      for (const event of events) {
        node.on(event, (changedNode: ZWaveNode, args: any) => {
          // only forward value events for ready nodes
          if (!changedNode.ready) return;
          notifyNode(changedNode, event, { args });
        });
      }
    }

    node.on(
      "metadata updated",
      (changedNode: ZWaveNode, oldArgs: ZWaveNodeMetadataUpdatedArgs) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clientsController.clients.forEach((client) => {
          // Copy arguments for each client so transforms don't impact all clients
          const args = { ...oldArgs };
          if (args.metadata != undefined) {
            if (args.commandClass === CommandClasses.Configuration) {
              args.metadata = dumpConfigurationMetadata(
                args.metadata as ConfigurationMetadata,
                client.schemaVersion,
              );
            } else {
              args.metadata = dumpMetadata(args.metadata, client.schemaVersion);
            }
          }
          this.sendEvent(client, {
            source: "node",
            event: "metadata updated",
            nodeId: changedNode.nodeId,
            args,
          });
        });
      },
    );

    node.on(
      "notification",
      (endpoint: Endpoint, ccId: CommandClasses, args: any) => {
        // only forward value events for ready nodes
        const changedNode = endpoint.getNodeUnsafe();
        if (!changedNode) {
          throw new NodeNotFoundError(endpoint.nodeId);
        }
        if (!changedNode.ready) return;
        this.clientsController.clients.forEach((client) => {
          // Only send notification events from the Notification CC for schema version < 3
          if (client.schemaVersion < 3 && ccId == CommandClasses.Notification) {
            let eventData: OutgoingEvent = {
              source: "node",
              event: "notification",
              nodeId: changedNode.nodeId,
              notificationLabel: args.eventLabel,
            };
            if ("parameters" in args) {
              eventData["parameters"] = args.parameters;
            }
            this.sendEvent(client, eventData);
          } else if (client.schemaVersion >= 3) {
            if (client.schemaVersion < 21) {
              if (
                [
                  CommandClasses["Multilevel Switch"],
                  CommandClasses["Entry Control"],
                ].includes(ccId)
              ) {
                delete args.eventTypeLabel;
              }
              if (ccId == CommandClasses["Entry Control"]) {
                delete args.dataTypeLabel;
              }
            }
            if (client.schemaVersion <= 31) {
              this.sendEvent(client, {
                source: "node",
                event: "notification",
                nodeId: changedNode.nodeId,
                ccId,
                args,
              });
            } else {
              this.sendEvent(client, {
                source: "node",
                event: "notification",
                nodeId: endpoint.nodeId,
                endpointIndex: endpoint.index,
                ccId,
                args,
              });
            }
          }
        });
      },
    );

    node.on(
      "firmware update progress",
      (changedNode: ZWaveNode, progress: FirmwareUpdateProgress) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clientsController.clients.forEach((client) => {
          if (client.schemaVersion <= 23) {
            this.sendEvent(client, {
              source: "node",
              event: "firmware update progress",
              nodeId: changedNode.nodeId,
              sentFragments: progress.sentFragments,
              totalFragments: progress.totalFragments,
            });
          } else {
            this.sendEvent(client, {
              source: "node",
              event: "firmware update progress",
              nodeId: changedNode.nodeId,
              progress,
            });
          }
        });
      },
    );

    node.on(
      "firmware update finished",
      (changedNode: ZWaveNode, result: FirmwareUpdateResult) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clientsController.clients.forEach((client) => {
          if (client.schemaVersion <= 23) {
            this.sendEvent(client, {
              source: "node",
              event: "firmware update finished",
              nodeId: changedNode.nodeId,
              status: result.status,
              waitTime: result.waitTime as any,
            });
          } else {
            this.sendEvent(client, {
              source: "node",
              event: "firmware update finished",
              nodeId: changedNode.nodeId,
              result,
            });
          }
        });
      },
    );

    node.on(
      "statistics updated",
      (changedNode: ZWaveNode, statistics: NodeStatistics) => {
        notifyNode(changedNode, "statistics updated", { statistics });
      },
    );
  }
}
