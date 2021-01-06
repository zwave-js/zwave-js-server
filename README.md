# Z-Wave JS Server

Small server wrapper around Z-Wave JS to access it via a WebSocket.

## Trying it out

### Start server

```shell
ts-node cli/server.ts /dev/tty0
```

Opens server on `ws://localhost:3000/zjs`.

You can specify a configuration file with `--config`. This can be a JSON file or a JS file that exports the config. It needs to follow the [Z-Wave JS config format](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=zwaveoptions).

### Start client

Requires server to be running.

Default connects to `ws://localhost:3000/zjs`:

```shell
ts-node cli/client.ts
```

To specify different host:

```shell
ts-node cli/client.ts 192.168.1.100:6000
```

To specify that it outputs each message on a single line so it can be replayed later:

```shell
ts-node cli/client.ts --dump
```

## API

When a client connects, the server will send the current state of Z-Wave JS.

```ts
interface {
  type: "state",
  state: {
    controller: Partial<ZWaveController>;
    nodes: Partial<ZWaveNode>[];
  }
}
```

After that, the client will be notified of each state change that happens inside Z-Wave JS.

Event keys follow the names/types as used by Z-Wave JS.

```ts
interface {
  type: "event",
  event: {
    source: "driver" | "controller" | "node";
    event: string;
    [key: string]: unknown;
  }
}
```

## Authentication

Z-Wave JS Server does not handle authentication and allows all connections to the websocket API. If you want to add authentication, add authentication middleware to your Express instance or run NGINX in front of Express instance.
