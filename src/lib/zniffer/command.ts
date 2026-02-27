export enum ZnifferCommand {
  init = "zniffer.init",
  start = "zniffer.start",
  clearCapturedFrames = "zniffer.clear_captured_frames",
  getCaptureAsZLFBuffer = "zniffer.get_capture_as_zlf_buffer",
  capturedFrames = "zniffer.captured_frames",
  stop = "zniffer.stop",
  destroy = "zniffer.destroy",
  supportedFrequencies = "zniffer.supported_frequencies",
  currentFrequency = "zniffer.current_frequency",
  setFrequency = "zniffer.set_frequency",
  // Undocumented
  getLRRegions = "zniffer.get_lr_regions",
  // Undocumented
  getCurrentLRChannelConfig = "zniffer.get_current_lr_channel_config",
  // Undocumented
  getSupportedLRChannelConfigs = "zniffer.get_supported_lr_channel_configs",
  // Undocumented
  setLRChannelConfig = "zniffer.set_lr_channel_config",
  // File I/O
  saveCaptureToFile = "zniffer.save_capture_to_file",
  loadCaptureFromFile = "zniffer.load_capture_from_file",
  loadCaptureFromBuffer = "zniffer.load_capture_from_buffer",
}
