import ws from "ws";

const args = process.argv.slice(2).filter((val) => !val.startsWith("--"));
const host = args.length < 1 ? "ws://localhost:3000" : args[0];
const dump = process.argv.includes("--dump");
const url = `${host}/zjs`;
if (!dump) {
  console.info("Connecting to", url);
}
const socket = new ws(url);

// ws.on('open', function open() {
//   ws.send('something');
// });

socket.on("message", (data) => {
  if (dump) {
    console.log(data);
  } else {
    console.dir(JSON.parse(data.toString()));
  }
});
