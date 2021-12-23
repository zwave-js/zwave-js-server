module.exports = {
  logConfig: {
    filename: "/var/log/zwave/zwave",
    forceConsole: true,
    logToFile: true,
    level: "info",
  },

  storage: {
    cacheDir: "/opt/zwave_js_server/data",
    deviceConfigPriorityDir: "/opt/zwave_js_server/data/config",
  },

  // Generated with: "< /dev/urandom tr -dc A-F0-9 | head -c32 ;echo"
  securityKeys: {
    S0_Legacy: Buffer.from("<NETWORK_KEY>", "hex"),
  },
};
