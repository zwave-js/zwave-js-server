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
}
