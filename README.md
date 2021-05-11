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

You can specify a different port for the websocket server to listen on with `--port`.

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

To specify a schema version other than the latest (`maxSchemaVersion`):

```shell
ts-node src/bin/client.ts --schemaVersion 0
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

### Set API schema version

[compatible with schema version: 0+]

```ts
interface {
  messageId: string;
  command: "set_api_schema";
  schemaVersion: number;
}
```

### Driver level commands

#### Get the config of the driver

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.get_config";
}
```

Returns:

```ts
interface {
  config: {
    logConfig: {
      enabled: boolean;
      level: number;
      logToFile: boolean;
      filename: string;
      forceConsole: boolean;
    };
    statisticsEnabled: boolean;
  }
}
```

#### Update the logging configuration

[compatible with schema version: 4+]

> NOTE: You must provide at least one key/value pair as part of `config`

```ts
interface {
  messageId: string;
  command: "driver.update_log_config";
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

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.get_log_config";
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

#### Enable data usage statistics collection

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.enable_statistics";
}
```

#### Disable data usage statistics collection

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.disable_statistics";
}
```

#### Get whether statistics are enabled

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.is_statistics_enabled";
}
```

Returns:

```ts
interface {
  statisticsEnabled: boolean;
}
```

### Start listening to logging events

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.start_listening_logs";
}
```

### Stop listening to logging events

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.stop_listening_logs";
}
```

### Controller level commands

`zwave-js-server` supports all of the controller methods listed in the [Z-Wave JS documentation](https://zwave-js.github.io/node-zwave-js/#/api/controller?id=controller-methods). `zwave-js-server` uses [snake casing](https://en.wikipedia.org/wiki/Snake_case) for commands and prefixes every controller command with `controller.`, so `beginInclusion` is called using the `controller.begin_inclusion` command.

### Node level commands

#### [Set value on a node](https://zwave-js.github.io/node-zwave-js/#/api/node?id=setvalue)

[compatible with schema version: 0+]

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

[compatible with schema version: 0+]

```ts
interface {
  messageId: string;
  command: "node.refresh_info";
  nodeId: number;
}
```

#### [Get defined Value IDs](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getdefinedvalueids)

[compatible with schema version: 0+]

```ts
interface {
  messageId: string;
  command: "node.get_defined_value_ids";
  nodeId: number;
}
```

#### [Get value metadata](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getvaluemetadata)

[compatible with schema version: 0+]

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

[compatible with schema version: 0+]

```ts
interface {
  messageId: string;
  command: "node.abort_firmware_update";
  nodeId: number;
}
```

#### [Poll value](https://zwave-js.github.io/node-zwave-js/#/api/node?id=pollvalue)

[compatible with schema version: 1+]

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

[compatible with schema version: 1+]

```ts
interface {
  messageId: string;
  command: "node.set_raw_config_parameter_value";
  nodeId: number;
}
```

#### [Refresh values](https://zwave-js.github.io/node-zwave-js/#/api/node?id=refreshvalues)

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "node.refresh_values";
  nodeId: number;
}
```

#### [Refresh command class values](https://zwave-js.github.io/node-zwave-js/#/api/node?id=refreshccvalues)

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "node.refresh_cc_values";
  nodeId: number;
  commandClass: CommandClasses;
}
```

## Schema Version

In an attempt to keep compatibility between different server and client versions, we've introduced a (basic) API Schema Version.

1. **client connects** --> server sends back version info including the schema versions it can handle:

   ```json
   {
     "type": "version",
     "driverVersion": "6.5.0",
     "serverVersion": "1.0.0",
     "homeId": 3967882672,
     "minSchemaVersion": 0,
     "maxSchemaVersion": 1
   }
   ```

2. **Client decides what to do based on supported schema version**.
   For example drop connection if the supported server schema is too old or just handle the supported schema itself. For example most/all basic commands will just work but relatively new commands won't and the client decides to only not handle the stuff in the upgraded schema.

3. **Client needs to tell the server what schema it wants to use.** This is done with the "set_api_schema" command:

   ```json
   {
     "command": "set_api_schema",
     "messageId": 1,
     "schemaVersion": 1
   }
   ```

   From this moment the server knows how to treat commands to/from this client. The server can handle multiple clients with different schema versions.

4. By default the server will use the minimum schema it supports (which is 0 at this time) if the `set_api_schema` command is omitted.

5. If the client sends a schema version which is **out of range**, this will produce an error to the client and in the server's log:

   ```json
   {
     "command": "set_api_schema",
     "messageId": 1,
     "schemaVersion": 3
   }
   {"type":"result","success":false,"messageId":1,"errorCode":"schema_incompatible"}
   ```

6. When we make **breaking changes** in the api, we **bump the schema version**. When adding new commands/features, we also bump the api schema and note in both code comments and documentation to which schema version that feature is compatible with.

## Errors

If a command results in an error, the following response is returned:

```json
{
  "type": "result",
  "success": false,
  "messageId": 1,
  "errorCode": "schema_incompatible"
}
```

The following error codes exist:

| code                | description          |
| ------------------- | -------------------- |
| unknown_command     | Unknown command      |
| node_not_found      | Node not found       |
| schema_incompatible | Incompatible Schema  |
| zwave_error         | Error from Z-Wave JS |
| unknown_error       | Unknown exception    |

In the case of `zwave_error`, the extra keys `zwave_error_code` and `zwave_error_message` will be added.

{
"type": "result",
"success": false,
"messageId": 1,
"errorCode": "zwave_error",
"zwaveErrorCode": 18,
"zwaveErrorMessage": "The message cannot be sent because node 61 is dead"
}

## Authentication

Z-Wave JS Server does not handle authentication and allows all connections to the websocket API. If you want to add authentication, add authentication middleware to your Express instance or run NGINX in front of Express instance.
