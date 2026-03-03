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
- Added `driver` command namespace (`driver.get_config`, `driver.update_log_config`, `driver.get_log_config`, `driver.enable_statistics`, `driver.disable_statistics`, `driver.is_statistics_enabled`, `driver.start_listening_logs`, `driver.stop_listening_logs`)
- Added `driver` state (`logConfig`, `statisticsEnabled`) to the state dump
- Added `node.refresh_values` and `node.refresh_cc_values` commands
- Added `interview started` node event
- Added `interview stage completed` node event (with `stageName` argument)
- Added `logging` driver event (emitted when `driver.start_listening_logs` is active)

## Schema 5

- Added `deviceDatabaseUrl` property to Node
- Removed `neighbors` property from Node. Use `controller.get_node_neighbors` instead.
- Added `controller.get_node_neighbors` command
- Added `broadcast_node` and `multicast_group` command namespaces
- Added `node.begin_firmware_update` and `node.ping` commands

## Schema 6

- Added `driver.set_preferred_scales` command
- Added `driver.check_for_config_updates` and `driver.install_config_update` commands
- Added `options` parameter to `node.set_value` command (`SetValueAPIOptions`)
- Added optional `endpoint` parameter to `controller.get_association_groups`, `controller.get_associations`, `controller.is_association_allowed`, `controller.add_associations`, and `controller.remove_associations` commands
- Changed `Association` type to `AssociationAddress` in association commands
- Added `isHealNetworkActive` property to controller state dump
- Added `valueChangeOptions` property to value metadata and configuration metadata

## Schema 7

- Added `endpoint.invoke_cc_api` command
- Added `endpoint.supports_cc_api` command
- Added `statistics` property (`NodeStatistics`) to `NodeState`
- Added `statistics` property (`ControllerStatistics`) to controller state dump
- Added `statistics updated` controller event
- Added `statistics updated` node event

## Schema 8

- Added `node.has_security_class` command
- Added `node.get_highest_security_class` command
- Added `node.get_firmware_update_capabilities` command
- Added `controller.grant_security_classes` command
- Added `controller.validate_dsk_and_enter_pin` command
- Added controller events: `grant security classes`, `validate dsk and enter pin`, `inclusion aborted`
- Updated `controller.begin_inclusion` and `controller.replace_failed_node` to support S2 inclusion options
- Added `result` (`InclusionResult`) to `node added` controller event payload
- Added `broadcast_node.invoke_cc_api` and `broadcast_node.supports_cc_api` commands
- Added `multicast_group.invoke_cc_api` and `multicast_group.supports_cc_api` commands
- Added `options` parameter (`SetValueAPIOptions`) to `broadcast_node.set_value` and `multicast_group.set_value` commands

## Schema 9

- Bumped `zwave-js` to `^8.3.1` (no server API changes)

## Schema 10

- Added `replaced` boolean to `node removed` controller event
- Added `highestSecurityClass` property to `NodeState`
- Added server message compression support

## Schema 11

- Added `controller.provision_smart_start_node` command
- Added `controller.unprovision_smart_start_node` command
- Added `controller.get_provisioning_entry` command
- Added `controller.get_provisioning_entries` command
- Added `utils.parse_qr_code_string` command
- Updated `controller.begin_inclusion` to support QR code string provisioning
- Updated `controller.begin_exclusion` with `unprovision` parameter
- Added `broadcast_node.get_defined_value_ids` and `multicast_group.get_defined_value_ids` commands

## Schema 12

- Added `controller.supports_feature` command
- Server now enables `emitValueUpdateAfterSetValue` driver option by default

## Schema 13

- Added `node.test_powerlevel` command
- Added `node.check_lifeline_health` command
- Added `node.check_route_health` command
- Added optional `options` parameter to `node.refresh_info` command
- Added node events: `test powerlevel progress`, `check lifeline health progress`, `check route health progress`

## Schema 14

- Added `node.get_value` command
- Added `node.get_endpoint_count` command
- Added `node.interview_cc` command
- Added `controller.backup_nvm_raw`, `controller.restore_nvm`, `controller.set_rf_region`, `controller.get_rf_region`, `controller.set_powerlevel`, `controller.get_powerlevel`, and `controller.get_state` commands
- Added `node.get_state`, `node.set_name`, `node.set_location`, and `node.set_keep_awake` commands
- Added `isControllerNode` and `keepAwake` properties to `NodeState`
- Added `inclusionState` property and full controller state dump to `ControllerState`
- Added controller events: `nvm backup progress`, `nvm convert progress`, `nvm restore progress` (emitted during NVM backup/restore operations)

## Schema 15

- Added `commandClasses` property to `Endpoint` state dump (array of `CommandClassState` with `id`, `name`, `version`, and `isSecure`)
- Moved `commandClasses` from `Node` state to `Endpoint` state

## Schema 16

- Added `driver.enable_error_reporting` command
- Added `controller.get_known_lifeline_routes` command
- Changed controller state: replaced `libraryVersion` and `serialApiVersion` with `sdkVersion` and `firmwareVersion`
- Added optional `filter` parameter to `driver.start_listening_logs` command
- Added DNS-SD/mDNS service discovery support

## Schema 17

- Changed `controller.begin_exclusion`: `unprovision` parameter now accepts `boolean | "inactive"` (previously just `boolean`)
- Changed `controller.get_provisioning_entry`: parameter changed from `dsk` (string) to `dskOrNodeId` (string | number)
- Added `installedVersion` to `driver.check_for_config_updates` response

## Schema 18

- Added `node.get_firmware_update_progress` command
- Added `target` parameter to `node.begin_firmware_update` command
- Added `node.wait_for_wakeup` command

## Schema 19

- Added controller `node found` event
- Added `node` property to `node found` event containing `FoundNodeState` with `nodeId`, `deviceClass`, and `status`

## Schema 20

- Added `controller.get_any_firmware_update_progress` command

## Schema 21

- Added `controller.is_any_ota_firmware_update_in_progress` command
- Added `controller.get_available_firmware_updates` command
- Added `controller.begin_ota_firmware_update` command
- Added `node.is_firmware_update_in_progress` command
- Added `node.get_firmware_update_capabilities_cached` command
- Refactored firmware update progress tracking to use built-in zwave-js methods
- Added `eventTypeLabel` property to `notification` node event for Multilevel Switch CC and Entry Control CC
- Added `dataTypeLabel` property to `notification` node event for Entry Control CC

## Schema 22

- Added `node.interview` command
- Added `strategy` parameter to `controller.begin_exclusion` command (`ExclusionStrategy`)
- Added `apiKey` parameter to `controller.get_available_firmware_updates` command
- Changed controller state: replaced `isSlave`, `isSecondary`, and `isStaticUpdateController` with `isPrimary`, `isSUC`, and `nodeType`
- Removed `status` property from `FoundNodeState` (was always `NodeStatus.Unknown` for schema < 22)

## Schema 23

- Added `supportedCCs` and `controlledCCs` properties to `FoundNodeState`
- Added `initialize` server command (alternative to `set_api_schema`, also accepts `additionalUserAgentComponents` parameter)
- Added `endpoint.supports_cc`, `endpoint.controls_cc`, `endpoint.is_cc_secure`, `endpoint.get_cc_version`, and `endpoint.get_node_unsafe` commands

## Schema 24

- Added `node.update_firmware` command supporting multiple firmware files in a single request
- Added `controller.firmware_update_ota` command supporting multiple firmware updates
- Added `includePrereleases` parameter to `controller.get_available_firmware_updates` command
- Changed `firmware update progress` node event payload from `{sentFragments, totalFragments}` to `{progress}` object
- Changed `firmware update finished` node event payload from `{status, waitTime}` to `{result}` object
- Changed `node.begin_firmware_update` return type from empty `{}` to `{ success: boolean }`
- Changed `controller.begin_ota_firmware_update` return type from empty `{}` to `{ success: boolean }`

## Schema 25

- Added `driver.soft_reset` command
- Added `driver.try_soft_reset` command
- Added `driver.hard_reset` command
- Added `controller.firmware_update_otw` command
- Added `utils.try_parse_dsk_from_qr_code_string` command
- Added `rfRegion` property to `ControllerState`
- Added controller events: `firmware update progress`, `firmware update finished`

## Schema 26

- Added `controller.is_firmware_update_in_progress` command
- Added `endpointLabel` property to `Endpoint` state dump

## Schema 27

- Added `stateful` and `secret` properties to value metadata
- Added `node.get_value_timestamp` command
- Added `driver.shutdown` command

## Schema 28

- Added `node.manually_idle_notification_value` command
- Added `node.set_date_and_time` command

## Schema 29

- Changed `node removed` controller event: `replaced` property changed to `reason` property (`RemoveNodeReason`)
- Changed `controller.begin_exclusion` to accept `ExclusionOptions` object parameter (in addition to legacy `unprovision` parameter for backwards compatibility)
- Removed `name` and `info` properties from `ConfigurationMetadataState`
- Changed `node.set_value` return type from `{ success: boolean }` to `{ result: SetValueResult }`
- Changed firmware update command return types from `{ success: boolean }` to `{ result }` objects

## Schema 30

- Added `lastSeen` property to `NodeState`

## Schema 31

- Added `node.get_date_and_time` command
- Added `node.is_health_check_in_progress` command
- Added `node.abort_health_check` command
- Added `node.set_default_volume` command
- Added `node.set_default_transition_duration` command
- Added `node.has_device_config_changed` command
- Added `status` property (`ControllerStatus`) to `ControllerState`
- Added `defaultVolume` and `defaultTransitionDuration` properties to `NodeState`
- Added `lastResult` property to `check lifeline health progress` and `check route health progress` node events
- Added controller `status changed` event
- Added controller `identify` event
- Added `start_listening_logs` and `stop_listening_logs` as top-level server commands

## Schema 32

- Replaced `controller.heal_node` with `controller.rebuild_node_routes`
- Replaced `controller.begin_healing_network` with `controller.begin_rebuilding_routes` (added `options` parameter)
- Replaced `controller.stop_healing_network` with `controller.stop_rebuilding_routes`
- Renamed controller events `heal network progress` to `rebuild routes progress` and `heal network done` to `rebuild routes done`
- Removed `isHealNetworkActive` property from `ControllerState`, replaced with `isRebuildingRoutes`
- Changed `controller.firmware_update_ota` command: `updates` parameter replaced with `updateInfo`
- Deprecated `controller.begin_ota_firmware_update` command
- Changed `notification` node event to include `endpointIndex` property
- Added `message` property to error responses and `zwaveErrorCodeName` to Z-Wave error responses

## Schema 33

- Fixed `node.set_raw_config_parameter_value` command to match Z-Wave JS types (added `bitMask` and `valueFormat` parameters, made `valueSize` optional, return type changed from `{}` to `{ result?: SupervisionResult }`)
- Added `endpoint.set_raw_config_parameter_value` command
- Added `driver.update_options` command

## Schema 34

- Added `rebuildRoutesProgress` to controller state dump
- Listen for clients using IPv6 in addition to IPv4 which was already supported

## Schema 35

- Adds Z-Wave Long Range support
- Added `supportsLongRange` to controller state dump
- Added `protocol` property to `NodeState`

## Schema 36

- Added `maxLongRangePowerlevel`, `longRangeChannel`, and `supportsLongRangeAutoChannelSelection` to controller state dump
- Added commands for controller methods `getMaxLongRangePowerlevel`, `setMaxLongRangePowerlevel`, `getLongRangeChannel`, and `setLongRangeChannel`
- Removed deprecated `mandatoryControlledCCs` and `mandatorySupportedCCs` properties from device class dump
- Added commands for `node.createDump` and `driver.sendTestFrame`

## Schema 37

- Added command for `checkAssociation` controller method
- Updated payload for `inclusion started` controller event (sends `strategy` instead of `secure` boolean)
- Removed `noBulkSupport` from `ConfigurationMetadataState` dump

## Schema 38

- Added controller `inclusion state changed` event
- Added `config_manager` commands (`config_manager.lookup_device`)
- Added `zniffer` commands
- Added `utils` commands: `utils.num2hex`, `utils.format_id`, `utils.buffer2hex`, `utils.get_enum_member_name`, `utils.rssi_to_string`

## Schema 39

- Added support for both overloads of `node.manuallyIdleNotificationValue`
- Added `node.get_raw_config_parameter_value` and `endpoint.get_raw_config_parameter_value` commands

## Schema 40

- Added `endpoint.try_get_node` command
- Added `driver ready` driver event
- Added `controller.cancel_secure_bootstrap_s2` command

## Schema 41

- Changed `source` of the `firmware update progress` and `firmware update finished` events from `controller` to `driver`
- Added `driver.firmware_update_otw` and `driver.is_otw_firmware_update_in_progress` commands
- Added `node.get_supported_notification_events` command

## Schema 42

- Added `sdkVersion` property to `NodeState`
- Added optional `migrateOptions` parameter to `controller.restore_nvm` command

## Schema 43

- Added `controller.toggle_rf` command

## Schema 44

- Added another overload to the `driver.firmware_update_otw` command

## Schema 45

- Fixed JSON serialization of `Map` objects in responses (affects `controller.get_known_lifeline_routes` and other Map-returning commands)
- Added `node info received` node event

## Schema 46

- Added `allowed` property to numeric value metadata and configuration metadata
- Added `purpose` property to configuration metadata

## Schema 47

- Added driver state properties: `ready`, `allNodesReady`, `configVersion`
- Added node state properties: `canSleep`, `supportsWakeUpOnDemand`, `hardwareVersion`, `hasSUCReturnRoute`, `manufacturer`, `dsk`
- Added controller state properties: `isSIS`, `maxPayloadSize`, `maxPayloadSizeLR`, `zwaveApiVersion`, `zwaveChipType`
- Added driver events: `all nodes ready`, `error`, `bootloader ready`
- Added controller events: `network found`, `network joined`, `network left`, `joining network failed`, `leaving network failed`
- Added driver commands: `soft_reset_and_restart`, `enter_bootloader`, `leave_bootloader`, `get_supported_cc_version`, `get_safe_cc_version`, `update_user_agent`, `enable_frequent_rssi_monitoring`, `disable_frequent_rssi_monitoring`
- Automatic ZIP extraction for firmware update commands
