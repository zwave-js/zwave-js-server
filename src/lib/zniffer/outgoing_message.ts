import { ZnifferCommand } from "./command.js";

export interface ZnifferResultTypes {
  [ZnifferCommand.init]: Record<string, never>;
  [ZnifferCommand.start]: Record<string, never>;
  [ZnifferCommand.clearCapturedFrames]: Record<string, never>;
  [ZnifferCommand.getCaptureAsZLFBuffer]: { capture: Buffer };
  [ZnifferCommand.capturedFrames]: { capturedFrames: any[] };
  [ZnifferCommand.stop]: Record<string, never>;
  [ZnifferCommand.destroy]: Record<string, never>;
  [ZnifferCommand.supportedFrequencies]: {
    frequencies: ReadonlyMap<number, string>;
  };
  [ZnifferCommand.currentFrequency]: { frequency?: number };
  [ZnifferCommand.setFrequency]: Record<string, never>;
  // Long Range
  [ZnifferCommand.getLRRegions]: { regions: number[] };
  [ZnifferCommand.getCurrentLRChannelConfig]: { channelConfig?: number };
  [ZnifferCommand.getSupportedLRChannelConfigs]: {
    channelConfigs: ReadonlyMap<number, string>;
  };
  [ZnifferCommand.setLRChannelConfig]: Record<string, never>;
  // File I/O
  [ZnifferCommand.saveCaptureToFile]: Record<string, never>;
  [ZnifferCommand.loadCaptureFromFile]: Record<string, never>;
  [ZnifferCommand.loadCaptureFromBuffer]: Record<string, never>;
}
