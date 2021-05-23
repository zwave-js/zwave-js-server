# API Schema

This document describes the changes that are introduced with each schema version.

## Schema 0

Base schema.

## Schema 1

- Device classes were previously exposed as their `string` representation. They are now exposed with both their `string` and `integer` representation.
- Command classes at the node level were previously exposed as their `string` representation. They are now exposed with both their `string` and `integer` representation.

## Schema 2

- `Buffer` values were previously exposed with a `ValueType` of `string`. They are now exposed with a `ValueType` of `Buffer`

# Schema 3

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

# Schema 4

- Node `interviewStage` property was changed from type `number` to type `string`

# Schema 5

- Added `deviceDatabaseUrl` property to Node
- Removed `neighbors` property from Node. Use `controller.get_node_neighbors` instead.
