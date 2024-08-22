import { ZnifferCommand } from "./command";

export interface ZnifferResultTypes {
  [ZnifferCommand.init]: Record<string, never>;
  [ZnifferCommand.start]: Record<string, never>;
  [ZnifferCommand.clearCapturedFrames]: Record<string, never>;
  [ZnifferCommand.getCaptureAsZLFBuffer]: { capture: Buffer };
  [ZnifferCommand.capturedFrames]: { capturedFrames: any[] };
  [ZnifferCommand.stop]: Record<string, never>;
  [ZnifferCommand.supportedFrequencies]: {
    frequencies: ReadonlyMap<number, string>;
  };
  [ZnifferCommand.currentFrequency]: { frequency?: number };
  [ZnifferCommand.setFrequency]: Record<string, never>;
}
