interface IncomingCommandStartListening {
  messageID: string;
  command: "start_listening";
}

export type IncomingMessage = IncomingCommandStartListening;
