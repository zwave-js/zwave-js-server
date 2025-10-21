import { ZnifferOptions } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base.js";
import { ZnifferCommand } from "./command.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IncomingCommandZnifferBase extends IncomingCommandBase {}

export interface IncomingCommandZnifferInit extends IncomingCommandZnifferBase {
  command: ZnifferCommand.init;
  devicePath: string;
  options: ZnifferOptions;
}

export interface IncomingCommandZnifferStart
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.start;
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

export interface IncomingCommandZnifferDestroy
  extends IncomingCommandZnifferBase {
  command: ZnifferCommand.destroy;
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
  | IncomingCommandZnifferInit
  | IncomingCommandZnifferStart
  | IncomingCommandZnifferStop
  | IncomingCommandZnifferCapturedFrames
  | IncomingCommandZnifferSupportedFrequencies
  | IncomingCommandZnifferCurrentFrequency
  | IncomingCommandZnifferSetFrequency
  | IncomingCommandZnifferDestroy;
