# Z-Wave JS Server

Small server wrapper around Z-Wave JS to access it via a WebSocket.

## Trying it out

These instructions are for development only. These CLIs will be available as `zwave-server` and `zwave-client` after installing the NPM package.

### Start server

```shell
ts-node src/bin/server.ts /dev/tty0
```

Opens server on `ws://localhost:3000`.

You can specify a configuration file with `--config`. This can be a JSON file or a JS file that exports the config. It needs to follow the [Z-Wave JS config format](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=zwaveoptions).

If you don't have a USB stick, you can add `--mock-driver` to use a fake stick.

### Start client

Requires server to be running.

Default connects to `ws://localhost:3000`:

```shell
ts-node src/bin/client.ts
```

To specify different host:

```shell
ts-node src/bin/client.ts ws://192.168.1.100:6000
```

To specify that it outputs each message on a single line so it can be replayed later:

```shell
ts-node src/bin/client.ts --dump
```

You can filter the output by a specific node ID:

```shell
ts-node src/bin/client.ts --node 52
```

All these options can be combined.

## API

When a client connects, the server will send the version.

```ts
interface {
  type: "version";
  driverVersion: string;
  serverVersion: string;
  homeId: number;
}
```

To start receive the state and get events, the client needs to send the `start_listening` command.

```ts
interface {
  messageId: string;
  command: "start_listening";
}
```

The server will respond with the current state and start sending events.

```ts
interface {
  type: "result";
  messageId: string; // maps the `start_listening` command
  success: true,
  result: {
    state: {
      controller: Partial<ZWaveController>;
      nodes: Partial<ZWaveNode>[];
    }
  };
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

## Client commands

### Server level commands

#### Start listening to events

```ts
interface {
  messageId: string;
  command: "start_listening";
}
```

#### Update the logging configuration

> NOTE: You must provide at least one key/value pair as part of `config`

```ts
interface {
  messageId: string;
  command: "update_log_config";
  config: {
    enabled?: boolean;
    level?: number;
    logToFile?: boolean;
    filename?: string;
    forceConsole?: boolean;
  }
}
```

#### Get the logging configuration

```ts
interface {
  messageId: string;
  command: "get_log_config";
}
```

Returns:

```ts
interface {
  config: {
    enabled: boolean;
    level: number;
    logToFile: boolean;
    filename: string;
    forceConsole: boolean;
  }
}
```

### Controller level commands

Refer to the [Z-Wave JS Controller methods documentation](https://zwave-js.github.io/node-zwave-js/#/api/controller?id=controller-methods) for more information on available commands. `zwave-js-server` uses [snake casing](https://en.wikipedia.org/wiki/Snake_case) for commands, so `beginInclusion` is called using the `node.begin_inclusion` command.

### Node level commands

#### [Set value on a node](https://zwave-js.github.io/node-zwave-js/#/api/node?id=setvalue)

```ts
interface {
  messageId: string;
  command: "node.set_value";
  nodeId: number;
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
  value: any;
}
```

#### [Refresh node info](https://zwave-js.github.io/node-zwave-js/#/api/node?id=refreshinfo)

```ts
interface {
  messageId: string;
  command: "node.refresh_info";
  nodeId: number;
}
```

#### [Get defined Value IDs](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getdefinedvalueids)

```ts
interface {
  messageId: string;
  command: "node.get_defined_value_ids";
  nodeId: number;
}
```

#### [Get value metadata](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getvaluemetadata)

```ts
interface {
  messageId: string;
  command: "node.get_value_metadata";
  nodeId: number;
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
}
```

#### [Abort Firmware Update](https://zwave-js.github.io/node-zwave-js/#/api/node?id=abortfirmwareupdate)

```ts
interface {
  messageId: string;
  command: "node.abort_firmware_update";
  nodeId: number;
}
```

#### [Poll value](https://zwave-js.github.io/node-zwave-js/#/api/node?id=pollvalue)

```ts
interface {
  messageId: string;
  command: "node.poll_value";
  nodeId: number;
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
}
```

#### [Set raw configuration parameter value (Advanced)](https://zwave-js.github.io/node-zwave-js/#/api/CCs/Configuration?id=set)

```ts
interface {
  messageId: string;
  command: "node.set_raw_config_parameter_value";
  nodeId: number;
}
```

## Authentication

Z-Wave JS Server does not handle authentication and allows all connections to the websocket API. If you want to add authentication, add authentication middleware to your Express instance or run NGINX in front of Express instance.
