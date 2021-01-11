#!/usr/bin/env node

import ws from "ws";
const args = process.argv.slice(2).filter((val) => !val.startsWith("--"));
const url = args.length < 1 ? "ws://localhost:3000" : args[0];
const dump = process.argv.includes("--dump");

if (!dump) {
  console.info("Connecting to", url);
}

const socket = new ws(url);

socket.on("open", function open() {
  socket.send(
    JSON.stringify({
      messageId: "my-msg-id!",
      command: "start_listening",
    })
  );
});

socket.on("message", (data) => {
  if (dump) {
    console.log(data);
  } else {
    console.dir(JSON.parse(data.toString()));
  }
});
