#!/usr/bin/env node

import ws from "ws";
import { OutgoingMessage, ResultTypes } from "../lib/outgoing_message";
import { parseArgs } from "../util/parse-args";

interface Args {
  _: Array<string>;
  dump: boolean;
  node: string;
}

const args = parseArgs<Args>(["_", "dump", "node"]);
const url = args._[0] || "ws://localhost:3000";
const filterNode = args.node ? Number(args.node) : undefined;

if (!args.dump) {
  console.info("Connecting to", url);
}

const socket = new ws(url);

socket.on("open", function open() {
  socket.send(
    JSON.stringify({
      messageId: "start-listening-result",
      command: "start_listening",
    })
  );
});

socket.on("message", (data) => {
  const msg = JSON.parse(data.toString()) as OutgoingMessage;

  if (filterNode) {
    if (msg.type !== "result" && msg.type !== "event") {
      return;
    }

    if (
      msg.type === "result" &&
      msg.messageId === "start-listening-result" &&
      msg.success
    ) {
      const state = (msg.result as ResultTypes["start_listening"]).state;

      const nodes = state.nodes.filter((node) => node.nodeId === filterNode);

      if (nodes.length !== 1) {
        console.error("Unable to find node", filterNode);
        process.exit(1);
      }

      state.nodes = nodes;
    } else if (msg.type === "event" && msg.event.nodeId !== filterNode) {
      return;
    }
  }

  if (args.dump) {
    console.log(JSON.stringify(msg));
  } else {
    console.dir(msg);
  }
});

let closing = false;

process.on("SIGINT", async () => {
  // Pressing ctrl+c twice.
  if (closing) {
    process.exit();
  }

  // Close gracefully
  closing = true;
  console.log("Shutting down");
  socket.close();
  process.exit();
});
