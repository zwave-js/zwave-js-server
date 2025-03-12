export enum DriverCommand {
  getConfig = "driver.get_config",
  updateLogConfig = "driver.update_log_config",
  getLogConfig = "driver.get_log_config",
  enableStatistics = "driver.enable_statistics",
  disableStatistics = "driver.disable_statistics",
  isStatisticsEnabled = "driver.is_statistics_enabled",
  startListeningLogs = "driver.start_listening_logs",
  stopListeningLogs = "driver.stop_listening_logs",
  checkForConfigUpdates = "driver.check_for_config_updates",
  installConfigUpdate = "driver.install_config_update",
  setPreferredScales = "driver.set_preferred_scales",
  enableErrorReporting = "driver.enable_error_reporting",
  softReset = "driver.soft_reset",
  trySoftReset = "driver.try_soft_reset",
  hardReset = "driver.hard_reset",
  shutdown = "driver.shutdown",
  updateOptions = "driver.update_options",
  sendTestFrame = "driver.send_test_frame",
  // Schema version >= 41:
  firmwareUpdateOTW = "driver.firmware_update_otw",
  // Schema version >= 41:
  isOTWFirmwareUpdateInProgress = "driver.is_otw_firmware_update_in_progress",
}
