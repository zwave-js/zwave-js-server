# API Schema

This document describes the changes that are introduced with each schema version.

## Schema 0

Base schema.

## Schema 1

- Device classes were previously exposed as their `string` representation. They are now exposed with both their `string` and `integer` representation.
- Command classes at the node level were previously exposed as their `string` representation. They are now exposed with both their `string` and `integer` representation.

## Schema 2

- `Buffer` values were previously exposed with a `ValueType` of `string`. They are now exposed with a `ValueType` of `Buffer`

## Schema 3

- Renamed `controller.removeNodeFromAllAssocations` to `controller.removeNodeFromAllAssociations` to fix a typo
- Numeric loglevels are converted to the corresponding string loglevel internally. driver.getLogConfig always returns the string loglevel regardless.
- `isFrequentListening` was changed to have the type `FLiRS = false | "250ms" | "1000ms"` (previously `boolean`) to indicate the wakeup frequency.
- `maxBaudRate` was renamed to `maxDataRate`, the type `Baudrate` was renamed to `DataRate`
- The property `supportedDataRates` was added to provide an array of supported data rates
- The `version` property was renamed to `protocolVersion` and had its type changed from `number` to the enum `ProtocolVersion` (the underlying values are still the same).
- The `isBeaming` property was renamed to `supportsBeaming` to better show its intent.
- The `supportsSecurity` property was split off from the `isSecure` property because they have a different meaning.
- The old `nodeType` and `roleType` properties were renamed to `zwavePlusNodeType` and `zwavePlusRoleType` to clarify that they refer to Z-Wave+.
- The node `notification` event was reworked and decoupled from the Notification CC. The event callback now indicates which CC raised the event and its arguments are moved into a single object parameter.
- Moved the `deviceClass` property from `ZWaveNode` to its base class `Endpoint` and consider the endpoint's device class where necessary

## Schema 4

- Node `interviewStage` property was changed from type `number` to type `string`

## Schema 5

- Added `deviceDatabaseUrl` property to Node
- Removed `neighbors` property from Node. Use `controller.get_node_neighbors` instead.

---

> Missing schemas (6 - 32) will be added later

---

## Schema 33

- Fixed `node.set_raw_config_parameter_value` command to match Z-Wave JS types
- Added `endpoint.set_raw_config_parameter_value` command
- Added `driver.update_options` command

## Schema 34

- Added `rebuildRoutesProgress` to controller state dump
- Listen for clients using IPv6 in addition to IPv4 which was already supported

## Schema 35

- Adds Z-Wave Long Range support
- Added `supportsLongRange` to controller state dump

## Schema 36

- Added `maxLongRangePowerlevel`, `longRangeChannel`, and `supportsLongRangeAutoChannelSelection` to controller state dump
- Added commands for controller methods `getMaxLongRangePowerlevel`, `setMaxLongRangePowerlevel`, `getLongRangeChannel`, and `setLongRangeChannel`
- Removed deprecated `mandatoryControlledCCs` and `mandatorySupportedCCs` properties from device class dump
- Added commands for `node.createDump` and `driver.sendTestFrame`

## Schema 37

- Added command for `checkAssocation` controller method
- Updated payload for `inclusion started` controller event

## Schema 38

- Added controller `inclusion state changed` event
- Added `config_manager` commands
- Added `zniffer` commands

## Schema 39

- Added support for both overloads of `node.manuallyIdleNotificationValue`
- Added `node.get_raw_config_parameter_value` and `endpoint.get_raw_config_parameter_value` commands

## Schema 40

- Added `endpoint.try_get_node` command
- Added `controller.cancelSecureBootstrapS2` command

## Schema 41

- Changed `source` of the `firmware update progress` and `firmware update finished` events from `controller` to `driver`
- Added `driver.firmware_update_otw` and `driver.is_otw_firmware_update_in_progress` commands
- Added `node.get_supported_notification_events` command

## Schema 42

- Added `sdkVersion` property to `NodeState`

## Schema 43

- Added `controller.toggle_rf` command

## Schema 44

- Added another overload to the `driver.firmware_update_otw` command

## Schema 45

- Fixed JSON serialization of `Map` objects in responses (affects `controller.get_known_lifeline_routes` and other Map-returning commands)
- Added new commands, events, and state properties (see tables below)
- Added automatic ZIP extraction for firmware update commands (`node.begin_firmware_update`, `node.update_firmware`, `controller.firmware_update_otw`, `driver.firmware_update_otw`). When the file format cannot be detected, the server will automatically attempt to extract firmware from a ZIP archive.
- Added new utility commands for firmware handling: `utils.guess_firmware_file_format`, `utils.try_unzip_firmware_file`, `utils.extract_firmware`

## Schema 46

- Added `allowed` property to numeric value metadata and configuration metadata
- Added `purpose` property to configuration metadata

## Schema 47

- Added new controller commands for associations, diagnostics, firmware updates, network join/leave, NVM operations, RF region queries, routing, and watchdog
- Added `controller.restore_nvm_raw` command for raw NVM restoration without format conversion
- Added broadcast node Long Range support via `longRange` flag on `broadcast_node` commands
- Added `controller.get_all_associations` with nested map return type (`nodeId -> endpoint -> groupId -> addresses`)
- Added driver commands: `soft_reset_and_restart`, `enter_bootloader`, `leave_bootloader`, `get_supported_cc_version`, `get_safe_cc_version`, `update_user_agent`
- Added driver events: `all nodes ready`, `error`, `bootloader ready`
- Added driver state properties: `ready`, `allNodesReady`, `configVersion`
- Added node commands: `check_link_reliability`, `is_link_reliability_check_in_progress`, `abort_link_reliability_check`
- Added node event: `check link reliability progress`
- Added node state properties: `canSleep`, `supportsWakeUpOnDemand`, `hardwareVersion`, `hasSUCReturnRoute`, `manufacturer`, `dsk`
- Added endpoint commands: `get_ccs`, `may_support_basic_cc`, `was_cc_removed_via_config`
- Added controller state properties: `isSIS`, `maxPayloadSize`, `maxPayloadSizeLR`, `zwaveApiVersion`, `zwaveChipType`
- Added zniffer Long Range commands: `get_lr_regions`, `get_current_lr_channel_config`, `get_supported_lr_channel_configs`, `set_lr_channel_config`
- Added zniffer file I/O commands: `save_capture_to_file`, `load_capture_from_file`, `load_capture_from_buffer`
- Added utility commands: `guess_firmware_file_format`, `try_unzip_firmware_file`, `extract_firmware`
- Automatic ZIP extraction for firmware update commands
