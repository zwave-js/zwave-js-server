import {
  ControllerEvents,
  ControllerStatistics,
  FirmwareUpdateStatus,
  InclusionResult,
  NodeStatistics,
  NodeStatus,
  ZWaveNode,
  ZWaveNodeEvents,
  ZWaveNodeMetadataUpdatedArgs,
} from "zwave-js";
import { CommandClasses, ConfigurationMetadata } from "@zwave-js/core";
import { OutgoingEvent } from "./outgoing_message";
import { dumpConfigurationMetadata, dumpMetadata, dumpNode } from "./state";
import { Client, ClientsController } from "./server";

export class EventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clients
   */
  constructor(private clients: ClientsController) {}

  start() {
    this.clients.driver.controller.nodes.forEach((node) =>
      this.setupNode(node)
    );

    // Bind to all controller events
    // https://github.com/zwave-js/node-zwave-js/blob/master/packages/zwave-js/src/lib/controller/Controller.ts#L112

    this.clients.driver.controller.on(
      "node added",
      (node: ZWaveNode, result: InclusionResult) => {
        // clean up any promises that were stored for inclusion
        delete this.clients.grantSecurityClassesPromise;
        delete this.clients.validateDSKAndEnterPinPromise;
        // forward event to all connected clients, respecting schemaVersion it supports
        this.clients.clients.forEach((client) =>
          this.sendEvent(client, {
            source: "controller",
            event: "node added",
            node: dumpNode(node, client.schemaVersion) as any,
            result: result as any,
          })
        );
        this.setupNode(node);
      }
    );

    {
      const events: ControllerEvents[] = [
        "inclusion failed",
        "exclusion failed",
        "exclusion started",
        "inclusion stopped",
        "exclusion stopped",
      ];
      for (const event of events) {
        this.clients.driver.controller.on(event, () =>
          this.forwardEvent({
            source: "controller",
            event,
          })
        );
      }
    }

    this.clients.driver.controller.on("inclusion started", (secure) =>
      this.forwardEvent({
        source: "controller",
        event: "inclusion started",
        secure,
      })
    );

    this.clients.driver.controller.on("node removed", (node) =>
      // forward event to all connected clients, respecting schemaVersion it supports
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "controller",
          event: "node removed",
          node: dumpNode(node, client.schemaVersion) as any,
        })
      )
    );

    this.clients.driver.controller.on("heal network progress", (progress) =>
      this.forwardEvent({
        source: "controller",
        event: "heal network progress",
        progress: Object.fromEntries(progress),
      })
    );

    this.clients.driver.controller.on("heal network done", (result) =>
      this.forwardEvent({
        source: "controller",
        event: "heal network done",
        result: Object.fromEntries(result),
      })
    );

    this.clients.driver.controller.on(
      "statistics updated",
      (statistics: ControllerStatistics) =>
        this.forwardEvent({
          source: "controller",
          event: "statistics updated",
          statistics: statistics as any,
        })
    );
  }

  forwardEvent(data: OutgoingEvent) {
    // Forward event to all connected clients
    this.clients.clients.forEach((client) => this.sendEvent(client, data));
  }

  sendEvent(client: Client, data: OutgoingEvent) {
    // Send event to connected client only
    if (client.receiveEvents && client.isConnected) {
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
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "node",
          event: "ready",
          nodeId: changedNode.nodeId,
          nodeState: dumpNode(changedNode, client.schemaVersion) as any,
        })
      );
    });

    {
      const events: ZWaveNodeEvents[] = ["wake up", "sleep", "dead", "alive"];
      for (const event of events) {
        node.on(event, (changedNode: ZWaveNode, oldStatus: NodeStatus) =>
          notifyNode(changedNode, event, { oldStatus })
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
      }
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
      (changedNode: ZWaveNode, args: ZWaveNodeMetadataUpdatedArgs) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clients.clients.forEach((client) => {
          // Copy arguments for each client so transforms don't impact all clients
          const newArgs = { ...args };
          if (newArgs.metadata != undefined) {
            if (newArgs.commandClass === CommandClasses.Configuration) {
              newArgs.metadata = dumpConfigurationMetadata(
                newArgs.metadata as ConfigurationMetadata,
                client.schemaVersion
              );
            } else {
              newArgs.metadata = dumpMetadata(
                newArgs.metadata,
                client.schemaVersion
              );
            }
          }
          this.sendEvent(client, {
            source: "node",
            event: "metadata updated",
            nodeId: changedNode.nodeId,
            args: newArgs as any,
          });
        });
      }
    );

    node.on(
      "notification",
      (changedNode: ZWaveNode, ccId: CommandClasses, args: any) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clients.clients.forEach((client) => {
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
            this.sendEvent(client, {
              source: "node",
              event: "notification",
              nodeId: changedNode.nodeId,
              ccId,
              args,
            });
          }
        });
      }
    );

    node.on(
      "firmware update progress",
      (
        changedNode: ZWaveNode,
        sentFragments: number,
        totalFragments: number
      ) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        notifyNode(changedNode, "firmware update progress", {
          sentFragments,
          totalFragments,
        });
      }
    );

    node.on(
      "firmware update finished",
      (
        changedNode: ZWaveNode,
        status: FirmwareUpdateStatus,
        waitTime?: number
      ) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        notifyNode(changedNode, "firmware update finished", {
          status,
          waitTime,
        });
      }
    );

    node.on(
      "statistics updated",
      (changedNode: ZWaveNode, statistics: NodeStatistics) => {
        notifyNode(changedNode, "statistics updated", { statistics });
      }
    );
  }
}
