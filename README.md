# Z-Wave JS Server

Small server wrapper around Z-Wave JS to access it via a WebSocket.

## Trying it out

These instructions are for development only. These CLIs will be available as `zwave-server` and `zwave-client` after installing the [NPM package](https://www.npmjs.com/package/@zwave-js/server).

### Start server

```shell
ts-node src/bin/server.ts /dev/tty0
```

Opens server on `ws://0.0.0.0:3000`.

You can specify a configuration file with `--config`. This can be a JSON file or a JS file that exports the config. It needs to follow the [Z-Wave JS config format](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=zwaveoptions).

> NOTE: Unless specificed in the configuration file, the [`emitValueUpdateAfterSetValue` configuration option](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=zwaveoptions) will be set to `true`. This is recommended for multi-client setups and for cases where multiple applications are sharing access to the same driver, e.g. [zwavejs2mqtt](https://github.com/zwave-js/zwavejs2mqtt)

You can specify a different port for the websocket server to listen on with `--port`, as well as the interface to attach to using `--host`, the default host is **0.0.0.0** i.e all interfaces.

If you don't have a USB stick, you can add `--mock-driver` to use a fake stick.

DNS-SD is enabled in the server by default. If you would like to disable it, add `--disable-dns-sd`.

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

To set the schema version that the client supports as well as an optional user agent that will be added to web requests, the client should send the `initialize` command.

```ts
interface {
  messageId: string;
  command: "initialize";
  schemaVersion: number;
  additionalUserAgentComponents?: Record<string, string>;
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

#### Start listening to logging events

[compatible with schema version: 31+]

Start receiving logs as events. Look at the [`logging` event documentation](#logging) for more information about the events. If `filter` is included, only logs that match the `filter` will be sent as events, the rest will be skipped.

```ts
interface {
  messageId: string;
  command: "start_listening_logs";
  filter?: Partial<NodeLogContext| DriverLogContext | ControllerLogContext | SerialLogContext | ConfigLogContext>;
}
```

#### Stop listening to logging events

[compatible with schema version: 31+]

Stop receiving logs as events.

```ts
interface {
  messageId: string;
  command: "stop_listening_logs";
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
      level: string | number; // schema versions >= 3 use string, <= 2 use number
      logToFile: boolean;
      filename: string;
      forceConsole: boolean;
    };
    statisticsEnabled: boolean;
  }
}
```

#### [Update the logging configuration](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=updatelogconfig)

[compatible with schema version: 4+]

> NOTE: You must provide at least one key/value pair as part of `config`

```ts
interface {
  messageId: string;
  command: "driver.update_log_config";
  config: {
    enabled?: boolean;
    level?: string | number;
    logToFile?: boolean;
    filename?: string;
    forceConsole?: boolean;
  }
}
```

#### [Get the logging configuration](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=getlogconfig)

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
    level: string | number; // schema versions >= 3 use string, <= 2 use number
    logToFile: boolean;
    filename: string;
    forceConsole: boolean;
  }
}
```

#### [Enable data usage statistics collection](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=enablestatistics)

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.enable_statistics";
  applicationName: string;
  applicationVersion: string;
}
```

#### [Disable data usage statistics collection](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=disablestatistics)

[compatible with schema version: 4+]

```ts
interface {
  messageId: string;
  command: "driver.disable_statistics";
}
```

#### [Get whether statistics are enabled](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=statisticsenabled)

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

#### [Set preferred scales](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=setpreferredscales)

[compatible with schema version: 6+]

Set preferred sensor scales. The `scales` argument has the same type as `preferences.scales` in [ZWaveOptions](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=zwaveoptions)

```ts
interface {
  messageId: string;
  command: "driver.set_preferred_scales";
  scales: ZWaveOptions["preferences"]["scales"];
}
```

#### [Check for config updates](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=checkforconfigupdates)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "driver.check_for_config_updates";
}
```

#### [Install config update](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=installconfigupdate)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "driver.install_config_update";
}
```

#### [Enable Error Reporting](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=enableerrorreporting)

[compatible with schema version: 16+]

```ts
interface {
  messageId: string;
  command: "driver.enable_error_reporting";
}
```

#### [Peform a soft-reset (restart) on the controller](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=softreset)

[compatible with schema version: 25+]

```ts
interface {
  messageId: string;
  command: "driver.soft_reset";
}
```

#### [Attempt to perform a soft-reset (restart) on the controller](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=softreset)

[compatible with schema version: 25+]

```ts
interface {
  messageId: string;
  command: "driver.try_soft_reset";
}
```

#### [Shutdown](https://zwave-js.github.io/node-zwave-js/#/api/node?id=shutdown)

[compatible with schema version: 27+]

```ts
interface {
  messageId: string;
  command: "driver.shutdown";
}
```

#### [Update Options](https://zwave-js.github.io/node-zwave-js/#/api/node?id=updateoptions)

[compatible with schema version: 33+]

```ts
interface {
  messageId: string;
  command: "driver.update_options";
  options: EditableZWaveOptions;
}
```

#### [Perform a hard reset on the controller](https://zwave-js.github.io/node-zwave-js/#/api/driver?id=hardreset)

[compatible with schema version: 25+]

```ts
interface {
  messageId: string;
  command: "driver.hard_reset";
}
```

### Controller level commands

`zwave-js-server` supports all of the controller methods listed in the [Z-Wave JS documentation](https://zwave-js.github.io/node-zwave-js/#/api/controller?id=controller-methods). `zwave-js-server` uses [snake casing](https://en.wikipedia.org/wiki/Snake_case) for commands and prefixes every controller command with `controller.`, so `beginInclusion` is called using the `controller.begin_inclusion` command.

> NOTE: For the most part, `controller` commands have the same inputs as documented in the Z-Wave JS documentation. The exceptions are:
>
> - `controller.begin_inclusion`: in addition to the input types that are documented, this command will also accept the QR code string directly and will convert the string to a `QRProvisioningInformation` object automatically.
> - `controller.provision_smart_start_node`: in addition to the input types that are documented, this command will also accept the QR code string directly and will convert the string to a `QRProvisioningInformation` object automatically.
> - `controller.backup_nvm_raw`: This command will return a base64 encoded string for the NVM data.
> - `controller.restore_nvm`: The NVM input should be a base64 encoded string.
> - `controller.firmware_update_otw`: This command accepts two required parameters (`file`, a base64 representation of the file, and `filename`, the filename of the file) as well as an optional parameter (`fileFormat`, which provides the format of the file to the server so the driver does not have to guess the format)

#### Get controller state

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  command: "controller.get_state";
}
```

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
  options?: SetValueAPIOptions;
}
```

#### [Refresh node info](https://zwave-js.github.io/node-zwave-js/#/api/node?id=refreshinfo)

[compatible with schema version: 0+]

```ts
interface {
  messageId: string;
  command: "node.refresh_info";
  nodeId: number;
  options?: RefreshInfoOptions;
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

#### [Get value](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getvalue)

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  command: "node.get_value";
  nodeId: number;
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
}
```

#### Get node state

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  command: "node.get_state";
  nodeId: number;
}
```

#### [Update Firmware](https://zwave-js.github.io/node-zwave-js/#/api/node?id=updatefirmware)

[compatible with schema version: 24+]

If `firmwareFileFormat` is not provided, the format will be guessed based on the filename and file payload.

```ts
interface {
  messageId: string;
  command: "node.begin_firmware_update";
  nodeId: number;
  updates: {
    filename: string;
    file: string; // use base64 encoding for the file
    fileFormat?: FileFormat;
  }[];
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

#### [Get Firmware Update Capabilities](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getfirmwareupdatecapabilities)

[compatible with schema version: 0+]

```ts
interface {
  messageId: string;
  command: "node.get_firmware_update_capabilities";
  nodeId: number;
}
```

#### [Get Firmware Update Capabilities Cached](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getfirmwareupdatecapabilitiescached)

[compatible with schema version: 21+]

```ts
interface {
  messageId: string;
  command: "node.get_firmware_update_capabilities_cached";
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

#### [Interview command class](https://zwave-js.github.io/node-zwave-js/#/api/node?id=interviewcc)

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.interview_cc";
  commandClass: CommandClasses;
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

#### [Ping](https://zwave-js.github.io/node-zwave-js/#/api/node?id=ping)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "node.ping";
  nodeId: number;
}
```

#### [Check if node has security class](https://zwave-js.github.io/node-zwave-js/#/api/node?id=hassecurityclass)

[compatible with schema version: 8+]

```ts
interface {
  messageId: string;
  command: "node.has_security_class";
  nodeId: number;
  securityClass: SecurityClass;
}
```

#### [Return the highest security class the node has](https://zwave-js.github.io/node-zwave-js/#/api/node?id=gethighestsecurityclass)

[compatible with schema version: 8+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.get_highest_security_class";
}
```

#### [Test Powerlevel](https://zwave-js.github.io/node-zwave-js/#/api/node?id=testpowerlevel)

[compatible with schema version: 13+]

This command emits [events](#test-powerlevel-progress).

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.test_powerlevel";
  testNodeId: number;
  powerlevel: Powerlevel;
  testFrameCount: number;
}
```

#### [Check Lifeline Health](https://zwave-js.github.io/node-zwave-js/#/api/node?id=checklifelinehealth)

[compatible with schema version: 13+]

This command emits [events](#check-lifeline-health-progress).

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.check_lifeline_health";
  rounds?: number;
}
```

#### [Check Route Health](https://zwave-js.github.io/node-zwave-js/#/api/node?id=checkroutehealth)

[compatible with schema version: 13+]

This command emits [events](#check-route-health-progress).

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.check_route_health";
  targetNodeId: number;
  rounds?: number;
}
```

#### [Get endpoint count](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getendpointcount)

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.get_endpoint_count";
}
```

#### [Set name](https://zwave-js.github.io/node-zwave-js/#/api/node?id=name)

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.set_name";
  updateCC?: boolean = true;
}
```

#### [Set location](https://zwave-js.github.io/node-zwave-js/#/api/node?id=location)

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.set_location";
  updateCC?: boolean = true;
}
```

#### [Set keep awake](https://zwave-js.github.io/node-zwave-js/#/api/node?id=keepawake)

[compatible with schema version: 14+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.set_keep_awake";
}
```

#### [Is Firmware Update In Progress](https://zwave-js.github.io/node-zwave-js/#/api/node?id=isfirmwareupdateinprogress)

[compatible with schema version: 21+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.is_firmware_update_in_progress";
}
```

#### [Wait for wakeup](https://zwave-js.github.io/node-zwave-js/#/api/node?id=waitforwakeup)

[compatible with schema version: 18+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.wait_for_wakeup";
}
```

#### [Interview](https://zwave-js.github.io/node-zwave-js/#/api/node?id=interview)

[compatible with schema version: 22+]

```ts
interface {
  messageId: string;
  nodeId: number;
  command: "node.interview";
}
```

#### [Get value timestamp](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getvaluetimestamp)

[compatible with schema version: 27+]

```ts
interface {
  messageId: string;
  command: "node.get_value_timestamp";
  nodeId: number;
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
}
```

#### [Manually Idle Notification CC Value](https://zwave-js.github.io/node-zwave-js/#/api/node?id=manuallyidlenotificationvalue)

[compatible with schema version: 28+]

```ts
interface {
  messageId: string;
  command: "node.manually_idle_notification_value";
  nodeId: number;
  notificationType: number;
  prevValue: number;
  endpointIndex?: number;
}
```

#### [Set date and time](https://zwave-js.github.io/node-zwave-js/#/api/node?id=setdateandtime)

[compatible with schema version: 30+]

```ts
interface {
  messageId: string;
  command: "node.set_date_and_time";
  nodeId: number;
  date?: string; // use ISO 8601 date string format
}
```

#### [Get date and time](https://zwave-js.github.io/node-zwave-js/#/api/node?id=getdateandtime)

[compatible with schema version: 31+]

```ts
interface {
  messageId: string;
  command: "node.get_date_and_time";
  nodeId: number;
}
```

#### [Is Health Check In Progress](https://zwave-js.github.io/node-zwave-js/#/api/node?id=ishealthcheckinprogress)

[compatible with schema version: 31+]

```ts
interface {
  messageId: string;
  command: "node.is_health_check_in_progress";
  nodeId: number;
}
```

#### [Abort Health Check](https://zwave-js.github.io/node-zwave-js/#/api/node?id=aborthealthcheck)

[compatible with schema version: 31+]

```ts
interface {
  messageId: string;
  command: "node.abort_health_check";
  nodeId: number;
}
```

#### [Set Default Volume](https://zwave-js.github.io/node-zwave-js/#/api/node?id=defaultvolume)

[compatible with schema version: 31+]

```ts
interface {
  messageId: string;
  command: "node.set_default_volume";
  nodeId: number;
  defaultVolume?: number;
}
```

#### [Set Default Transition Duration](https://zwave-js.github.io/node-zwave-js/#/api/node?id=defaulttransitionduration)

[compatible with schema version: 31+]

```ts
interface {
  messageId: string;
  command: "node.set_default_transition_duration";
  nodeId: number;
  defaultTransitionDuration?: string; // Will be converted to a Duration object
}
```

#### [Has Device Config Changed](https://zwave-js.github.io/node-zwave-js/#/api/node?id=hasdeviceconfigchanged)

[compatible with schema version: 31+]

```ts
interface {
  messageId: string;
  command: "node.has_device_config_changed";
  nodeId: number;
}
```

#### [Set Raw Config Parameter Value](https://zwave-js.github.io/node-zwave-js/#/api/CCs/Configuration?id=set)

[compatible with schema version: 33+]

```ts
interface {
  messageId: string;
  command: "node.set_raw_config_parameter_value";
  nodeId: number;
  parameter: number;
  bitMask?: number;
  value: ConfigValue;
  valueSize?: 1 | 2 | 4; // valueSize and valueFormat should be used together.
  valueFormat?: ConfigValueFormat;
}
```

### Endpoint level commands

#### [Invoke a Command Classes API method](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=invokeccapi)

[compatible with schema version: 7+]

You can find all of the CC API methods in the [Z-Wave JS docs](https://zwave-js.github.io/node-zwave-js/#/api/CCs/index).

<details>
<summary>Example: Invoking UserCodeCC.set</summary>

Send the following JSON to the server to invoke [`UserCodeCC.set(1, UserIDStatus.Enabled, "1234")`](https://zwave-js.github.io/node-zwave-js/#/api/CCs/UserCode?id=set):

```jsonc
{
  "messageId": "invoke-usercode-cc-set",
  "command": "endpoint.invoke_cc_api",
  "nodeId": 2,
  "endpoint": 1,
  "commandClass": 99, // commandClass = CommandClasses["User Code"]
  "methodName": "set",
  "args": [
    1, // userId = 1
    1, // userIdStatus = UserIDStatus.Enabled
    "1234" // userCode = "1234"
  ]
}
```

</details>

```ts
interface {
  messageId: string;
  command: "endpoint.invoke_cc_api";
  nodeId: number;
  endpoint?: number;
  commandClass: CommandClasses;
  methodName: string;
  args: unknown[];
}
```

For `Buffer` type arguments, use the following JSON format to represent the argument:

```jsonc
{
  "type": "Buffer",
  "data": [] // array of numbers
}
```

#### [Check whether a given Command Classes API is supported by the above method](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=supportsccapi)

[compatible with schema version: 7+]

```ts
interface {
  messageId: string;
  command: "endpoint.supports_cc_api";
  nodeId: number;
  endpoint?: number;
  commandClass: CommandClasses;
}
```

#### [Check whether endpoint supports a given Command Class](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=supportscc)

[compatible with schema version: 23+]

```ts
interface {
  messageId: string;
  command: "endpoint.supports_cc";
  nodeId: number;
  endpoint?: number;
  commandClass: CommandClasses;
}
```

#### [Check whether endpoint controls a given Command Class](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=controlscc)

[compatible with schema version: 23+]

```ts
interface {
  messageId: string;
  command: "endpoint.controls_cc";
  nodeId: number;
  endpoint?: number;
  commandClass: CommandClasses;
}
```

#### [Check whether a given Command Class is secure](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=isccsecure)

[compatible with schema version: 23+]

```ts
interface {
  messageId: string;
  command: "endpoint.is_cc_secure";
  nodeId: number;
  endpoint?: number;
  commandClass: CommandClasses;
}
```

#### [Check version of a given Command Class](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=getccversion)

[compatible with schema version: 23+]

```ts
interface {
  messageId: string;
  command: "endpoint.get_cc_version";
  nodeId: number;
  endpoint?: number;
  commandClass: CommandClasses;
}
```

#### [Get node from endpoint](https://zwave-js.github.io/node-zwave-js/#/api/endpoint?id=getnodeunsafe)

[compatible with schema version: 23+]

```ts
interface {
  messageId: string;
  command: "endpoint.get_node_unsafe";
  nodeId: number;
  endpoint?: number;
}
```

#### [Set Raw Config Parameter Value](https://zwave-js.github.io/node-zwave-js/#/api/CCs/Configuration?id=set)

[compatible with schema version: 33+]

```ts
interface {
  messageId: string;
  command: "endpoint.set_raw_config_parameter_value";
  nodeId: number;
  parameter: number;
  bitMask?: number;
  value: ConfigValue;
  valueSize?: 1 | 2 | 4; // valueSize and valueFormat should be used together.
  valueFormat?: ConfigValueFormat;
}
```

### Multicasting

There are several commands available that can be multicast to multiple nodes simultaneously. If you would like to broadcast to all nodes, use the `broadcast_node` prefix for the following commands. If you would like to multicast to a subset of nodes, use the `multicast_group` prefix for the following commands, adding a `nodeIDs` list as an input parameter:

```ts
interface IncomingCommandMulticastGroupBase extends IncomingCommandBase {
  nodeIDs: number[];
}
```

As an example, here's how you would call the `set_value` command for a multicast group (note the extra `nodeIDs` input parameter):

```ts
interface {
  messageId: string;
  command: "multicast_group.set_value";
  nodeIDs: number[];
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
  value: any;
  options?: SetValueAPIOptions;
}
```

#### [Set value](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=setvalue)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "<prefix>.set_value";
  valueId: {
    commandClass: CommandClasses;
    endpoint?: number;
    property: string | number;
    propertyKey?: string | number;
  };
  value: any;
  options?: SetValueAPIOptions;
}
```

#### [Get endpoint count](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=getendpointcount)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "<prefix>.get_endpoint_count"
}
```

#### [Check if endpoint supports a Command Class](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=supportscc)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "<prefix>.supports_cc"
  index: number
  commandClass: CommandClasses
}
```

#### [Get Command Class version on an endpoint](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=getccversion)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "<prefix>.get_cc_version"
  index: number
  commandClass: CommandClasses
}
```

#### [Invoke a Command Class specific API](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=invokeccapi)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "<prefix>.invoke_cc_api"
  index?: number;  // Endpoint index
  commandClass: CommandClasses;
  methodName: string;
  args: unknown[];
}
```

#### [Check if a Command Class is supported by invoke_cc_api](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=supportsccapi)

[compatible with schema version: 5+]

```ts
interface {
  messageId: string;
  command: "<prefix>.get_cc_version"
  index?: number;  // Endpoint index
  commandClass: CommandClasses;
}
```

#### [Get defined value IDs](https://zwave-js.github.io/node-zwave-js/#/api/virtual-node-endpoint?id=getdefinedvalueids)

[compatible with schema version: 11+]

```ts
interface {
  messageId: string;
  command: "<prefix>.get_defined_value_ids"
}
```

### Utility commands

`zwave-js-server` supports all of the utility methods listed in the [Z-Wave JS documentation](https://zwave-js.github.io/node-zwave-js/#/api/utils). `zwave-js-server` uses [snake casing](https://en.wikipedia.org/wiki/Snake_case) for commands and prefixes every controller command with `utils.`, so `parseQRCodeString` is called using the `utils.parse_qr_code_string` command.

## Events

### `zwave-js` Events

All `zwave-js` events as documented are forwarded on to clients that have sent the `start_listening` command.

```ts
interface {
  type: "event";
  event: {
    source: "driver" | "controller" | "node";
    event: string;
    ... // Additional parameters dependent on the event, see zwave-js docs for more details
  }
}
```

### `zwave-js-server` Node Events

#### `test powerlevel progress`

This event is sent after a `node.test_powerlevel` command is issued and contains test results from the driver. See the [`zwave-js` docs on this command](https://zwave-js.github.io/node-zwave-js/#/api/node?id=testpowerlevel) for more information.

```ts
interface {
  type: "event";
  event: {
    source: "node";
    event: "test powerlevel progress";
    nodeId: number;
    acknowledged: number;
    total: number;
  }
}
```

#### `check lifeline health progress`

This event is sent after a `node.check_lifeline_health` command is issued and contains test results from the driver. See the [`zwave-js` docs on this command](https://zwave-js.github.io/node-zwave-js/#/api/node?id=checklifelinehealth) for more information.

```ts
interface {
  type: "event";
  event: {
    source: "node";
    event: "check lifeline health progress";
    nodeId: number;
    round: number;
    totalRounds: number;
    lastRating: number;
  }
}
```

#### `check route health progress`

This event is sent after a `node.check_route_health` command is issued and contains test results from the driver. See the [`zwave-js` docs on this command](https://zwave-js.github.io/node-zwave-js/#/api/node?id=testpowerlevel) for more information.

```ts
interface {
  type: "event";
  event: {
    source: "node";
    event: "check route health progress";
    nodeId: number;
    rounds: number;
    totalRounds: number;
    lastRating: number;
  }
}
```

### `zwave-js-server` Driver Events

#### `log config updated`

This event is sent whenever a client issues the `driver.update_log_config` command with the updated log config.

```ts
interface {
  type: "event";
  event: {
    source: "driver";
    event: "log config updated";
    config: Partial<LogConfig>; // Includes everything but `transports`
  }
}
```

#### `logging`

This event is sent whenever `zwave-js` logs a statement. Clients will only receive these events when they have issued the `driver.start_listening_logs` command.

```ts
interface {
  type: "event";
  event: {
    source: "driver";
    event: "logging";
    formattedMessage: string;
    direction: string;
    primaryTags?: string;
    secondaryTags?: string;
    secondaryTagPadding?: number;
    multiline?: boolean;
    timestamp?: string;
    label?: string;
    message: string | string[];
  }
}
```

### `zwave-js-server` Controller Events

#### `grant security classes`

This event is sent as part of the node inclusion process (including when replacing a failed node). The event indicates to the client that [the user needs to choose which security classes to grant the node](https://zwave-js.github.io/node-zwave-js/#/getting-started/security-s2?id=granting-security-classes).

```ts
interface {
  type: "event";
  event: {
    source: "controller";
    event: "grant security classes";
    requested: InclusionGrant;
  }
}
```

#### `validate dsk and enter pin`

This event is sent as part of the node inclusion process (including when replacing a failed node). The event indicates to the client that [the user needs to confirm the provided DSK is valid and enter the PIN from the device](https://zwave-js.github.io/node-zwave-js/#/getting-started/security-s2?id=validating-the-dsk-and-entering-the-device-pin).

```ts
interface {
  type: "event";
  event: {
    source: "controller";
    event: "validate dsk and enter pin";
    dsk: string;
  }
}
```

#### `inclusion aborted`

This event is sent as part of the node inclusion process (including when replacing a failed node). The event indicates to the client that the controller aborted the security bootstrapping process (this will occur after inclusion has already been successful). The logs may have more details on why this security bootstrapping process was aborted.

```ts
interface {
  type: "event";
  event: {
    source: "controller";
    event: "inclusion aborted";
  }
}
```

#### `nvm backup progress`

This event is sent on progress updates to the NVM backup process when the [`controller.backup_nvm_raw`](https://zwave-js.github.io/node-zwave-js/#/api/controller?id=nvm-backup-and-restore) command is issued by a client to the server and a backup is in progress.

```ts
interface {
  type: "event";
  event: {
    source: "controller";
    event: "nvm backup progress";
    bytesRead: number;
    total: number;
  }
}
```

#### `nvm backup progress`

This event is sent on progress updates to the NVM conversion process when the [`controller.restore_nvm`](https://zwave-js.github.io/node-zwave-js/#/api/controller?id=nvm-backup-and-restore) command is issued by a client to the server and the NVM file that was passed in is being converted to the right format.

```ts
interface {
  type: "event";
  event: {
    source: "controller";
    event: "nvm backup progress";
    bytesRead: number;
    total: number;
  }
}
```

#### `nvm restore progress`

This event is sent on progress updates to the NVM restoration process when the [`controller.restore_nvm`](https://zwave-js.github.io/node-zwave-js/#/api/controller?id=nvm-backup-and-restore) command is issued by a client to the server and the NVM data is being restored to the controller.

```ts
interface {
  type: "event";
  event: {
    source: "controller";
    event: "nvm backup progress";
    bytesWritten: number;
    total: number;
  }
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

In the case of `zwave_error`, the extra keys `zwaveErrorCode` and `zwaveErrorMessage` will be added.

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
