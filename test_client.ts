import ws from "ws";

const socket = new ws("ws://localhost:3000/zjs");

// ws.on('open', function open() {
//   ws.send('something');
// });

socket.on("message", (data) => {
  console.dir(JSON.parse(data.toString()));
});
