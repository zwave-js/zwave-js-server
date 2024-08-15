import { ZnifferOptions } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { ZnifferCommand } from "./command";

export interface IncomingCommandZnifferBase extends IncomingCommandBase {}

export interface IncomingCommandZnifferStart
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.start;
  devicePath: string;
  options: Omit<
    ZnifferOptions,
    "logConfig" | "securityKeys" | "securityKeysLongRange"
  >;
}

export interface IncomingCommandZnifferClearCapturedFrames
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.clearCapturedFrames;
}

export interface IncomingCommandZnifferGetCaptureAsZLFBuffer
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.getCaptureAsZLFBuffer;
}

export interface IncomingCommandZnifferStop extends IncomingCommandZnifferBase {
  command: ZnifferCommand.stop;
}

export interface IncomingCommandZnifferCapturedFrames
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.capturedFrames;
}

export interface IncomingCommandZnifferSupportedFrequencies
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.supportedFrequencies;
}
export interface IncomingCommandZnifferCurrentFrequency
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.currentFrequency;
}
export interface IncomingCommandZnifferSetFrequency
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.setFrequency;
  frequency: number;
}

export type IncomingMessageZniffer =
  | IncomingCommandZnifferClearCapturedFrames
  | IncomingCommandZnifferGetCaptureAsZLFBuffer
  | IncomingCommandZnifferStart
  | IncomingCommandZnifferStop
  | IncomingCommandZnifferCapturedFrames
  | IncomingCommandZnifferSupportedFrequencies
  | IncomingCommandZnifferCurrentFrequency
  | IncomingCommandZnifferSetFrequency;
