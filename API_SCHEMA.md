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

### Commands

| Object     | Category           | Command                                           | Description                                                                |
| ---------- | ------------------ | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Controller | Association        | `controller.get_all_association_groups`           | Get all association groups for a node and all its endpoints                |
| Controller | Association        | `controller.get_all_associations`                 | Get all associations for a node and all its endpoints                      |
| Controller | Diagnostics        | `controller.get_background_rssi`                  | Get background RSSI noise levels for all channels                          |
| Controller | Firmware           | `controller.get_all_available_firmware_updates`   | Get all available firmware updates                                         |
| Controller | Identification     | `controller.get_dsk`                              | Get the controller's DSK (base64 encoded)                                  |
| Controller | Long Range         | `controller.get_long_range_nodes`                 | Get list of nodes using Z-Wave Long Range                                  |
| Controller | Network Join/Leave | `controller.begin_joining_network`                | Begin joining another network (learn mode)                                 |
| Controller | Network Join/Leave | `controller.stop_joining_network`                 | Stop the join network process                                              |
| Controller | Network Join/Leave | `controller.begin_leaving_network`                | Begin leaving the network                                                  |
| Controller | Network Join/Leave | `controller.stop_leaving_network`                 | Stop the leave network process                                             |
| Controller | NVM Operations     | `controller.get_nvm_id`                           | Get the NVM ID (manufacturer, type, size)                                  |
| Controller | NVM Operations     | `controller.external_nvm_open`                    | Open external NVM for reading/writing (SDK 7.x)                            |
| Controller | NVM Operations     | `controller.external_nvm_close`                   | Close external NVM (SDK 7.x)                                               |
| Controller | NVM Operations     | `controller.external_nvm_read_byte`               | Read a single byte from external NVM                                       |
| Controller | NVM Operations     | `controller.external_nvm_write_byte`              | Write a single byte to external NVM                                        |
| Controller | NVM Operations     | `controller.external_nvm_read_buffer`             | Read a buffer from external NVM                                            |
| Controller | NVM Operations     | `controller.external_nvm_write_buffer`            | Write a buffer to external NVM                                             |
| Controller | NVM Operations     | `controller.external_nvm_read_buffer_700`         | Read buffer from external NVM (SDK 7.x API)                                |
| Controller | NVM Operations     | `controller.external_nvm_write_buffer_700`        | Write buffer to external NVM (SDK 7.x API)                                 |
| Controller | NVM Operations     | `controller.external_nvm_open_ext`                | Open external NVM with extended info                                       |
| Controller | NVM Operations     | `controller.external_nvm_close_ext`               | Close external NVM (extended API)                                          |
| Controller | NVM Operations     | `controller.external_nvm_read_buffer_ext`         | Read buffer from external NVM (extended API)                               |
| Controller | NVM Operations     | `controller.external_nvm_write_buffer_ext`        | Write buffer to external NVM (extended API)                                |
| Controller | RF Region          | `controller.get_supported_rf_regions`             | Get list of supported RF regions (cached)                                  |
| Controller | RF Region          | `controller.query_supported_rf_regions`           | Query all supported RF regions                                             |
| Controller | RF Region          | `controller.query_rf_region_info`                 | Get detailed info about a specific RF region                               |
| Controller | Routing            | `controller.assign_return_routes`                 | Assign optimized return routes from a node to a destination                |
| Controller | Routing            | `controller.delete_return_routes`                 | Delete return routes from a node                                           |
| Controller | Routing            | `controller.assign_suc_return_routes`             | Assign optimized return routes from a node to the SUC                      |
| Controller | Routing            | `controller.delete_suc_return_routes`             | Delete SUC return routes from a node                                       |
| Controller | Routing            | `controller.assign_priority_return_route`         | Assign a specific priority return route                                    |
| Controller | Routing            | `controller.assign_priority_suc_return_route`     | Assign a specific priority SUC return route                                |
| Controller | Routing            | `controller.assign_custom_return_routes`          | Assign custom return routes with up to 4 routes                            |
| Controller | Routing            | `controller.assign_custom_suc_return_routes`      | Assign custom SUC return routes                                            |
| Controller | Routing            | `controller.set_priority_route`                   | Set the priority route to a destination node                               |
| Controller | Routing            | `controller.remove_priority_route`                | Remove the priority route to a destination node                            |
| Controller | Routing            | `controller.get_priority_route`                   | Get the currently configured priority route                                |
| Controller | Routing            | `controller.discover_node_neighbors`              | Trigger neighbor discovery for a node                                      |
| Controller | Routing (Cached)   | `controller.get_priority_return_route_cached`     | Get cached priority return route to a destination                          |
| Controller | Routing (Cached)   | `controller.get_priority_return_routes_cached`    | Get all cached priority return routes for a node                           |
| Controller | Routing (Cached)   | `controller.get_priority_suc_return_route_cached` | Get cached priority SUC return route                                       |
| Controller | Routing (Cached)   | `controller.get_custom_return_routes_cached`      | Get cached custom return routes                                            |
| Controller | Routing (Cached)   | `controller.get_custom_suc_return_routes_cached`  | Get cached custom SUC return routes                                        |
| Controller | Watchdog           | `controller.start_watchdog`                       | Start the hardware watchdog                                                |
| Controller | Watchdog           | `controller.stop_watchdog`                        | Stop the hardware watchdog                                                 |
| Driver     | Bootloader         | `driver.soft_reset_and_restart`                   | Soft reset the controller and restart the driver                           |
| Driver     | Bootloader         | `driver.enter_bootloader`                         | Put the controller into bootloader mode                                    |
| Driver     | Bootloader         | `driver.leave_bootloader`                         | Exit bootloader mode                                                       |
| Driver     | CC Version         | `driver.get_supported_cc_version`                 | Get the supported CC version for a node/endpoint                           |
| Driver     | CC Version         | `driver.get_safe_cc_version`                      | Get a safe CC version (returns 1 if unknown, undefined if not implemented) |
| Driver     | User Agent         | `driver.update_user_agent`                        | Update user agent components for service requests                          |
| Endpoint   | Command Class      | `endpoint.get_ccs`                                | Get all command classes on the endpoint                                    |
| Endpoint   | Command Class      | `endpoint.may_support_basic_cc`                   | Check if the endpoint may support Basic CC                                 |
| Endpoint   | Command Class      | `endpoint.was_cc_removed_via_config`              | Check if a CC was removed via device config                                |
| Node       | Link Reliability   | `node.check_link_reliability`                     | Run an extended link reliability check on a node                           |
| Node       | Link Reliability   | `node.is_link_reliability_check_in_progress`      | Check if a link reliability check is running                               |
| Node       | Link Reliability   | `node.abort_link_reliability_check`               | Abort an ongoing link reliability check                                    |
| Zniffer    | Long Range         | `zniffer.get_lr_regions`                          | Get list of Long Range capable regions                                     |
| Zniffer    | Long Range         | `zniffer.get_current_lr_channel_config`           | Get currently configured LR channel configuration                          |
| Zniffer    | Long Range         | `zniffer.get_supported_lr_channel_configs`        | Get map of supported LR channel configurations                             |
| Zniffer    | Long Range         | `zniffer.set_lr_channel_config`                   | Set Long Range channel configuration (800 series)                          |
| Utils      | Firmware           | `utils.guess_firmware_file_format`                | Guess the firmware file format from filename and file contents             |
| Utils      | Firmware           | `utils.try_unzip_firmware_file`                   | Extract firmware from a ZIP archive (returns undefined if not valid)       |
| Utils      | Firmware           | `utils.extract_firmware`                          | Extract firmware data from a firmware file given its format                |

### Events

| Object     | Category          | Event                             | Description                                                                      |
| ---------- | ----------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| Controller | Network Lifecycle | `network found`                   | Emitted when a new network is found during join (includes `homeId`, `ownNodeId`) |
| Controller | Network Lifecycle | `network joined`                  | Emitted when successfully joined a network                                       |
| Controller | Network Lifecycle | `network left`                    | Emitted when left the current network                                            |
| Controller | Network Lifecycle | `joining network failed`          | Emitted when joining a network fails                                             |
| Controller | Network Lifecycle | `leaving network failed`          | Emitted when leaving a network fails                                             |
| Driver     |                   | `all nodes ready`                 | Emitted when all nodes are ready                                                 |
| Driver     |                   | `error`                           | Emitted when a driver error occurs (includes `error` message string)             |
| Driver     |                   | `bootloader ready`                | Emitted when the controller enters bootloader mode                               |
| Node       | Diagnostics       | `check link reliability progress` | Emitted during link reliability check (includes `nodeId`, `progress`)            |

### State Properties

| Object     | Property                 | Description                                                     |
| ---------- | ------------------------ | --------------------------------------------------------------- |
| Controller | `isSIS`                  | Whether this controller is the SIS (Static Information Station) |
| Controller | `maxPayloadSize`         | Maximum Z-Wave payload size                                     |
| Controller | `maxPayloadSizeLR`       | Maximum Long Range payload size                                 |
| Controller | `zwaveApiVersion`        | Z-Wave API version info (`{kind, version}`)                     |
| Controller | `zwaveChipType`          | Controller chip type info                                       |
| Driver     | `ready`                  | Whether the driver is ready                                     |
| Driver     | `allNodesReady`          | Whether all nodes are ready                                     |
| Driver     | `configVersion`          | Device config database version                                  |
| Node       | `canSleep`               | Whether the node can sleep                                      |
| Node       | `supportsWakeUpOnDemand` | Whether the node supports wake-up on demand                     |
| Node       | `hardwareVersion`        | Hardware version number                                         |
| Node       | `hasSUCReturnRoute`      | Whether the node has a SUC return route configured              |
| Node       | `manufacturer`           | Manufacturer name string                                        |
| Node       | `dsk`                    | Device Specific Key for S2 (human-readable format)              |
