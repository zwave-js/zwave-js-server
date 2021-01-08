import type { ZwaveState } from './state'

export interface OutgoingEvent {
  source: 'driver' | 'controller' | 'node';
  event: string;
  [key: string]: unknown;
}

interface OutgoingVersionMessage {
  type: 'version';
  driverVersion: string;
  serverVersion: string;
  homeId: number | undefined;
}

interface OutgoingEventMessage {
  type: 'event';
  event: OutgoingEvent;
}

interface OutgoingResultMessageError {
  type: 'result';
  messageId: string;
  success: false;
  errorCode: string;
}

interface OutgoingResultMessageSuccessBase {
  type: 'result';
  messageId: string;
  success: true;
}

interface OutgoingStartListeningResultMessage
  extends OutgoingResultMessageSuccessBase {
  result: { state: ZwaveState };
}

export type OutgoingResultMessageSuccess = OutgoingStartListeningResultMessage;

export type OutgoingMessage =
  | OutgoingVersionMessage
  | OutgoingEventMessage
  | OutgoingResultMessageSuccess
  | OutgoingResultMessageError;
