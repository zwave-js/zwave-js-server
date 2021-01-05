# Z-Wave JS Server

Small server wrapper around Z-Wave JS to access it via a WebSocket.

## Trying it out

### Start server

```shell
ts-node test_server.ts /dev/tty0
```

Opens server on `ws://localhost:3000/zjs`.

### Start client

Requires server to be running.

```shell
ts-node test_client.ts
```
