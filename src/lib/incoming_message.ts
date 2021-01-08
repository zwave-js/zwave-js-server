interface IncomingCommandStartListening {
  messageId: string;
  command: 'start_listening';
}

export type IncomingMessage = IncomingCommandStartListening;
