import { Driver, HealNodeStatus, ZWaveNode } from "zwave-js";
import { ZWaveNodeEvents } from "zwave-js/build/lib/node/Types";
import { OutgoingEvent } from "./outgoing_message";
import { dumpNode } from "./state";

// TODO This should be exported in zwave-js and we import it
interface ControllerEventCallbacks {
  "inclusion failed": () => void;
  "exclusion failed": () => void;
  "inclusion started": (secure: boolean) => void;
  "exclusion started": () => void;
  "inclusion stopped": () => void;
  "exclusion stopped": () => void;
  "node added": (node: ZWaveNode) => void;
  "node removed": (node: ZWaveNode) => void;
  "heal network progress": (
    progress: ReadonlyMap<number, HealNodeStatus>
  ) => void;
  "heal network done": (result: ReadonlyMap<number, HealNodeStatus>) => void;
}
declare type ControllerEvents = Extract<keyof ControllerEventCallbacks, string>;

export class EventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param driver
   * @param forwardEvent
   */
  constructor(
    public driver: Driver,
    public forwardEvent: (data: OutgoingEvent) => void
  ) {}

  start() {
    this.driver.once("all nodes ready", () =>
      this.forwardEvent({
        source: "driver",
        event: "all nodes ready",
      })
    );

    this.driver.controller.nodes.forEach((node) => this.setupNode(node));

    // Bind to all controller events
    // https://github.com/zwave-js/node-zwave-js/blob/master/packages/zwave-js/src/lib/controller/Controller.ts#L112
    this.driver.controller.on("node added", (node: ZWaveNode) => {
      this.forwardEvent({
        source: "controller",
        event: "node added",
        node: dumpNode(node),
      });
      this.setupNode(node);
    });

    for (const event of [
      "inclusion failed",
      "exclusion failed",
      "exclusion started",
      "inclusion stopped",
      "exclusion stopped",
    ] as Array<ControllerEvents>) {
      this.driver.controller.on(event, () =>
        this.forwardEvent({
          source: "controller",
          event,
        })
      );
    }
    this.driver.controller.on("inclusion started", (secure) =>
      this.forwardEvent({
        source: "controller",
        event: "inclusion started",
        secure,
      })
    );
    this.driver.controller.on("node removed", (node) =>
      this.forwardEvent({
        source: "controller",
        event: "node removed",
        node: dumpNode(node),
      })
    );
    this.driver.controller.on("heal network progress", (progress) =>
      this.forwardEvent({
        source: "controller",
        event: "heal network progress",
        progress,
      })
    );
    this.driver.controller.on("heal network done", (result) =>
      this.forwardEvent({
        source: "controller",
        event: "heal network done",
        result,
      })
    );
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

    for (const event of [
      "interview comleted",
      "ready",
    ] as Array<ZWaveNodeEvents>) {
      node.on(event, (changedNode) => notifyNode(changedNode, event));
    }

    for (const event of [
      "wake up",
      "sleep",
      "dead",
      "alive",
    ] as Array<ZWaveNodeEvents>) {
      node.on(event, (changedNode, oldStatus) =>
        notifyNode(changedNode, event, { oldStatus })
      );
    }

    for (const event of [
      "value added",
      "value updated",
      "value removed",
      "value notification",
      "interview failed",
    ] as Array<ZWaveNodeEvents>) {
      node.on(event, (changedNode, args) =>
        notifyNode(changedNode, event, { args })
      );
    }

    node.on("notification", (changedNode, notificationLabel, parameters) =>
      notifyNode(changedNode, "notification", { notificationLabel, parameters })
    );

    node.on(
      "firmware update progress",
      (changedNode, sentFragments, totalFragments) =>
        notifyNode(changedNode, "firmware update progress", {
          sentFragments,
          totalFragments,
        })
    );

    node.on("firmware update finished", (changedNode, status, waitTime) =>
      notifyNode(changedNode, "firmware update finished", { status, waitTime })
    );
  }
}
