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
  // Long Range
  getLRRegions = "zniffer.get_lr_regions",
  getCurrentLRChannelConfig = "zniffer.get_current_lr_channel_config",
  getSupportedLRChannelConfigs = "zniffer.get_supported_lr_channel_configs",
  setLRChannelConfig = "zniffer.set_lr_channel_config",
}
