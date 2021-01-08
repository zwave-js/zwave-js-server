#!/usr/bin/env node

import ws from 'ws'
import * as yargs from 'yargs';


const argv = yargs.option('dump', {
    alias: 'd',
    description: 'Dump',
    type: 'boolean',
    default: false
  }).option('port', {
    alias: 'p',
    description: 'Websocket server port',
    type: 'number',
    default: 3000
  })
  .option('host', {
    alias: 'h',
    description: 'Server host url',
    type: 'string',
    default: 'ws://localhost'
  })
.help().argv;

const url = `${argv.host}:${argv.port}`

if (!argv.dump) {
  console.info('Connecting to', url)
}

const socket = new ws(url)

socket.on("open", function open() {
  socket.send(
    JSON.stringify({
      messageId: "my-msg-id!",
      command: "start_listening",
    })
  );
});

<<<<<<< HEAD
socket.on("message", (data) => {
  if (dump) {
    console.log(data);
=======
socket.on('message', (data) => {
  if (argv.dump) {
    console.log(data)
>>>>>>> fix: switch client to yargs
  } else {
    console.dir(JSON.parse(data.toString()));
  }
});
