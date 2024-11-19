import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export const version = require("../../package.json").version;

// minimal schema version the server supports
export const minSchemaVersion = 0;

// maximal/current schema version the server supports
export const maxSchemaVersion = 40;

export const applicationName = "zwave-js-server";
export const dnssdServiceType = applicationName;
