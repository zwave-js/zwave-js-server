export enum DriverCommand {
  getConfig = "driver.get_config",
  updateLogConfig = "driver.update_log_config",
  getLogConfig = "driver.get_log_config",
  enableStatistics = "driver.enable_statistics",
  disableStatistics = "driver.disable_statistics",
  isStatisticsEnabled = "driver.is_statistics_enabled",
  startListeningToLogs = "driver.start_listening_to_logs",
  stopListeningToLogs = "driver.stop_listening_to_logs",
}
