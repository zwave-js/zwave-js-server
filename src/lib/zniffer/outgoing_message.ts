import { ZnifferCommand } from "./command";

export interface ZnifferResultTypes {
  [ZnifferCommand.start]: Record<string, never>;
  [ZnifferCommand.clearCapturedFrames]: Record<string, never>;
  [ZnifferCommand.getCaptureAsZLFBuffer]: { capture: Buffer };
  [ZnifferCommand.capturedFrames]: { capturedFrames: any[] };
  [ZnifferCommand.stop]: Record<string, never>;
}
