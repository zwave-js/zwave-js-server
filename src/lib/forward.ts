import {
  ControllerEvents,
  Endpoint,
  FirmwareUpdateProgress,
  FirmwareUpdateResult,
  InclusionStrategy,
  NodeStatistics,
  NodeStatus,
  RemoveNodeReason,
  ZWaveNode,
  ZWaveNodeEvents,
  ZWaveNodeMetadataUpdatedArgs,
} from "zwave-js";
import { CommandClasses, ConfigurationMetadata } from "@zwave-js/core";
import {
  dumpConfigurationMetadata,
  dumpFoundNode,
  dumpMetadata,
  dumpNode,
} from "./state.js";
import { ClientsController } from "./server.js";
import { OutgoingEvent } from "./outgoing_message.js";
import { NodeNotFoundError } from "./error.js";

export class EventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clientsController
   */
  constructor(private clientsController: ClientsController) {}

  start() {
    // Bind events for the controller and all existing nodes
    this.setupControllerAndNodes();

    // Bind to driver events
    this.clientsController.driver.on("driver ready", () => {
      // Re-bind events for the controller and nodes after the "driver ready" event,
      // which implies that the old controller and node instances are no longer valid.
      this.setupControllerAndNodes();

      this.clientsController.sendEventToListeningClients(
        {
          source: "driver",
          event: "driver ready",
        },
        { minSchemaVersion: 40 },
      );
    });

    this.clientsController.driver.on("firmware update progress", (progress) => {
      this.clientsController.sendEventToListeningClients(
        (client) =>
          ({
            source: client.schemaVersion >= 41 ? "driver" : "controller",
            event: "firmware update progress",
            progress,
          }) satisfies OutgoingEvent,
      );
    });

    this.clientsController.driver.on("firmware update finished", (result) => {
      this.clientsController.sendEventToListeningClients(
        (client) =>
          ({
            source: client.schemaVersion >= 41 ? "driver" : "controller",
            event: "firmware update finished",
            result,
          }) satisfies OutgoingEvent,
      );
    });

    // Schema 47+ driver events
    this.clientsController.driver.on("all nodes ready", () => {
      this.clientsController.sendEventToListeningClients(
        {
          source: "driver",
          event: "all nodes ready",
        },
        { minSchemaVersion: 47 },
      );
    });

    this.clientsController.driver.on("error", (error) => {
      this.clientsController.sendEventToListeningClients(
        {
          source: "driver",
          event: "error",
          error: error.message,
        },
        { minSchemaVersion: 47 },
      );
    });

    this.clientsController.driver.on("bootloader ready", () => {
      this.clientsController.sendEventToListeningClients(
        {
          source: "driver",
          event: "bootloader ready",
        },
        { minSchemaVersion: 47 },
      );
    });
  }

  setupControllerAndNodes() {
    // Bind events for all existing nodes
    this.clientsController.driver.controller.nodes.forEach((node) =>
      this.setupNode(node),
    );

    // Bind to all controller events
    // https://github.com/zwave-js/node-zwave-js/blob/master/packages/zwave-js/src/lib/controller/Controller.ts#L112

    this.clientsController.driver.controller.on(
      "node added",
      (node, result) => {
        this.clientsController.sendEventToListeningClients(
          (client) =>
            ({
              source: "controller",
              event: "node added",
              node: dumpNode(node, client.schemaVersion),
              result,
            }) satisfies OutgoingEvent,
        );
        this.setupNode(node);
      },
    );

    this.clientsController.driver.controller.on("node found", (node) => {
      this.clientsController.sendEventToListeningClients(
        (client) =>
          ({
            source: "controller",
            event: "node found",
            node: dumpFoundNode(node, client.schemaVersion),
          }) satisfies OutgoingEvent,
        { minSchemaVersion: 19 },
      );
    });

    this.clientsController.driver.controller.on(
      "inclusion state changed",
      (state) => {
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "inclusion state changed",
            state,
          },
          { minSchemaVersion: 38 },
        );
      },
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
        this.clientsController.driver.controller.on(event, () =>
          this.clientsController.sendEventToListeningClients({
            source: "controller",
            event,
          }),
        );
      }
    }

    this.clientsController.driver.controller.on(
      "inclusion started",
      (strategy) => {
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "inclusion started",
            secure: strategy !== InclusionStrategy.Insecure,
          },
          { maxSchemaVersion: 36 },
        );
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "inclusion started",
            strategy,
          },
          { minSchemaVersion: 37 },
        );
      },
    );

    this.clientsController.driver.controller.on(
      "node removed",
      (node, reason) => {
        this.clientsController.sendEventToListeningClients(
          (client) =>
            ({
              source: "controller",
              event: "node removed",
              node: dumpNode(node, client.schemaVersion),
              replaced: [
                RemoveNodeReason.Replaced,
                RemoveNodeReason.ProxyReplaced,
              ].includes(reason),
            }) satisfies OutgoingEvent,
          { maxSchemaVersion: 28 },
        );
        this.clientsController.sendEventToListeningClients(
          (client) =>
            ({
              source: "controller",
              event: "node removed",
              node: dumpNode(node, client.schemaVersion),
              reason,
            }) satisfies OutgoingEvent,
          { minSchemaVersion: 29 },
        );
      },
    );

    this.clientsController.driver.controller.on(
      "rebuild routes progress",
      (progress) => {
        const progressObj = Object.fromEntries(progress);
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "heal network progress",
            progress: progressObj,
          },
          { maxSchemaVersion: 31 },
        );
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "rebuild routes progress",
            progress: progressObj,
          },
          { minSchemaVersion: 32 },
        );
      },
    );

    this.clientsController.driver.controller.on("status changed", (status) =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "controller",
          event: "status changed",
          status,
        },
        { minSchemaVersion: 31 },
      ),
    );

    this.clientsController.driver.controller.on(
      "rebuild routes done",
      (result) => {
        const resultObj = Object.fromEntries(result);
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "heal network done",
            result: resultObj,
          },
          { maxSchemaVersion: 31 },
        );
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "rebuild routes done",
            result: resultObj,
          },
          { minSchemaVersion: 32 },
        );
      },
    );

    this.clientsController.driver.controller.on(
      "statistics updated",
      (statistics) =>
        this.clientsController.sendEventToListeningClients({
          source: "controller",
          event: "statistics updated",
          statistics,
        }),
    );

    this.clientsController.driver.controller.on("identify", (triggeringNode) =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "controller",
          event: "identify",
          nodeId: triggeringNode.nodeId,
        },
        { minSchemaVersion: 31 },
      ),
    );

    // Schema 47+ controller network lifecycle events
    this.clientsController.driver.controller.on(
      "network found",
      (homeId: number, ownNodeId: number) =>
        this.clientsController.sendEventToListeningClients(
          {
            source: "controller",
            event: "network found",
            homeId,
            ownNodeId,
          },
          { minSchemaVersion: 47 },
        ),
    );

    this.clientsController.driver.controller.on("network joined", () =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "controller",
          event: "network joined",
        },
        { minSchemaVersion: 47 },
      ),
    );

    this.clientsController.driver.controller.on("network left", () =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "controller",
          event: "network left",
        },
        { minSchemaVersion: 47 },
      ),
    );

    this.clientsController.driver.controller.on("joining network failed", () =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "controller",
          event: "joining network failed",
        },
        { minSchemaVersion: 47 },
      ),
    );

    this.clientsController.driver.controller.on("leaving network failed", () =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "controller",
          event: "leaving network failed",
        },
        { minSchemaVersion: 47 },
      ),
    );
  }

  setupNode(node: ZWaveNode) {
    // Bind to all node events
    // https://github.com/zwave-js/node-zwave-js/blob/master/packages/zwave-js/src/lib/node/Types.ts#L84-L103
    const notifyNode = (node: ZWaveNode, event: string, extra = {}) =>
      this.clientsController.sendEventToListeningClients({
        source: "node",
        event,
        nodeId: node.nodeId,
        ...extra,
      });
    const notifyEndpoint = (endpoint: Endpoint, event: string, args: object) =>
      this.clientsController.sendEventToListeningClients(
        {
          source: "node",
          event,
          nodeId: endpoint.nodeId,
          endpointIndex: endpoint.index,
          args,
        },
        { minSchemaVersion: 48 },
      );

    node.on("ready", (changedNode: ZWaveNode) => {
      this.clientsController.sendEventToListeningClients(
        (client) =>
          ({
            source: "node",
            event: "ready",
            nodeId: changedNode.nodeId,
            nodeState: dumpNode(changedNode, client.schemaVersion),
          }) satisfies OutgoingEvent,
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
        this.clientsController.sendEventToListeningClients((client) => {
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
          return {
            source: "node",
            event: "metadata updated",
            nodeId: changedNode.nodeId,
            args,
          } satisfies OutgoingEvent;
        });
      },
    );

    node.on(
      "notification",
      (endpoint: Endpoint, ccId: CommandClasses, args: any) => {
        // only forward value events for ready nodes
        const changedNode = endpoint.tryGetNode();
        if (!changedNode) {
          throw new NodeNotFoundError(endpoint.nodeId);
        }
        if (!changedNode.ready) return;
        // Fields set to undefined are omitted during JSON serialization,
        // which lets us exclude fields from older schema versions without
        // mutating the original args object.
        // Schema < 3: only Notification CC, legacy format
        if (ccId == CommandClasses.Notification) {
          this.clientsController.sendEventToListeningClients(
            {
              source: "node",
              event: "notification",
              nodeId: changedNode.nodeId,
              notificationLabel: args.eventLabel,
              parameters: args.parameters,
            },
            { maxSchemaVersion: 2 },
          );
        }
        // Schema 3-20: strip fields not yet supported for specific CCs
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "notification",
            nodeId: changedNode.nodeId,
            ccId,
            args: {
              ...args,
              // Strip eventTypeLabel for Multilevel Switch and Entry Control CCs
              // (condition && object) spreads the object when true, nothing when false
              ...([
                CommandClasses["Multilevel Switch"],
                CommandClasses["Entry Control"],
              ].includes(ccId) && { eventTypeLabel: undefined }),
              // Strip dataTypeLabel for Entry Control CC only
              ...(ccId === CommandClasses["Entry Control"] && {
                dataTypeLabel: undefined,
              }),
            },
          },
          { minSchemaVersion: 3, maxSchemaVersion: 20 },
        );
        // Schema 21-31: node-based notification
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "notification",
            nodeId: changedNode.nodeId,
            ccId,
            args,
          },
          { minSchemaVersion: 21, maxSchemaVersion: 31 },
        );
        // Schema 32+: endpoint-based notification
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "notification",
            nodeId: endpoint.nodeId,
            endpointIndex: endpoint.index,
            ccId,
            args,
          },
          { minSchemaVersion: 32 },
        );
      },
    );

    node.on(
      "firmware update progress",
      (changedNode: ZWaveNode, progress: FirmwareUpdateProgress) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "firmware update progress",
            nodeId: changedNode.nodeId,
            sentFragments: progress.sentFragments,
            totalFragments: progress.totalFragments,
          },
          { maxSchemaVersion: 23 },
        );
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "firmware update progress",
            nodeId: changedNode.nodeId,
            progress,
          },
          { minSchemaVersion: 24 },
        );
      },
    );

    node.on(
      "firmware update finished",
      (changedNode: ZWaveNode, result: FirmwareUpdateResult) => {
        // only forward value events for ready nodes
        if (!changedNode.ready) return;
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "firmware update finished",
            nodeId: changedNode.nodeId,
            status: result.status,
            waitTime: result.waitTime as any,
          },
          { maxSchemaVersion: 23 },
        );
        this.clientsController.sendEventToListeningClients(
          {
            source: "node",
            event: "firmware update finished",
            nodeId: changedNode.nodeId,
            result,
          },
          { minSchemaVersion: 24 },
        );
      },
    );

    node.on(
      "statistics updated",
      (changedNode: ZWaveNode, statistics: NodeStatistics) => {
        notifyNode(changedNode, "statistics updated", { statistics });
      },
    );

    node.on("node info received", (changedNode: ZWaveNode) => {
      notifyNode(changedNode, "node info received");
    });

    {
      const events: ZWaveNodeEvents[] = [
        "user added",
        "user modified",
        "user deleted",
        "credential added",
        "credential modified",
        "credential deleted",
        "credential learn progress",
        "credential learn completed",
      ];
      for (const event of events) {
        node.on(event, (endpoint: Endpoint, args: any) => {
          notifyEndpoint(endpoint, event, args);
        });
      }
    }
  }
}
