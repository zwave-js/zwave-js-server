import ws from "ws";
import type WebSocket from "ws";
import type { Driver } from "zwave-js";
import { EventForwarder } from "./forward";
import type * as OutgoingMessages from "./outgoing_message";
import { IncomingMessage } from "./incoming_message";
import { dumpState } from "./state";
import { version } from "./const";

class Clients {
  private clients: Array<Client> = [];
  private pingInterval?: NodeJS.Timeout;
  private eventForwarder?: EventForwarder;
  private cleanupScheduled = false;

  constructor(private driver: Driver) {}

  addSocket(socket: WebSocket) {
    console.debug("New client");
    const client = new Client(socket, this.driver);
    socket.on("close", () => {
      console.info("Client disconnected");
      this.scheduleClientCleanup();
    });
    client.sendVersion();
    this.clients.push(client);

    if (this.pingInterval === undefined) {
      this.pingInterval = setInterval(() => {
        const newClients = [];

        for (const client of this.clients) {
          if (client.isConnected) {
            newClients.push(client);
          } else {
            client.disconnect();
          }
        }

        this.clients = newClients;
      }, 30000);
    }

    if (this.eventForwarder === undefined) {
      this.eventForwarder = new EventForwarder(this.driver, (data) => {
        for (const client of this.clients) {
          if (client.receiveEvents && client.isConnected) {
            client.sendEvent(data);
          }
        }
      });
      this.eventForwarder.start();
    }
  }

  private scheduleClientCleanup() {
    if (this.cleanupScheduled) {
      return;
    }
    this.cleanupScheduled = true;
    setTimeout(() => this.cleanupClients(), 0);
  }

  private cleanupClients() {
    this.cleanupScheduled = false;
    this.clients = this.clients.filter((cl) => cl.isConnected);
  }

  disconnect() {
    clearInterval(this.pingInterval);
    this.pingInterval = undefined;
    this.clients.forEach((client) => client.disconnect());
    this.clients = [];
  }
}

class Client {
  public receiveEvents = false;
  private _outstandingPing = false;

  constructor(private socket: WebSocket, private driver: Driver) {
    socket.on("pong", () => {
      this._outstandingPing = false;
    });
    socket.on("message", (data: string) => this.receiveMessage(data));
  }

  get isConnected(): boolean {
    return this.socket.readyState == this.socket.OPEN;
  }

  receiveMessage(data: string) {
    let msg: IncomingMessage;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      // We don't have the message ID. Just close it.
      this.socket.close();
      return;
    }

    if (msg.command === "start_listening") {
      this.sendResultSuccess(msg.messageID, {
        state: dumpState(this.driver),
      });
      this.receiveEvents = true;
      return;
    }

    this.sendResultError(msg.messageID, "unknown_command");
  }

  sendVersion() {
    this.sendData({
      type: "version",
      driverVersion: "TBD",
      serverVersion: version,
      homeId: this.driver.controller.homeId,
    });
  }

  sendResultSuccess(
    messageId: string,
    result: OutgoingMessages.OutgoingResultMessageSuccess["result"]
  ) {
    this.sendData({
      type: "result",
      success: true,
      messageId,
      result,
    });
  }

  sendResultError(messageId: string, errorCode: string) {
    this.sendData({
      type: "result",
      success: false,
      messageId,
      errorCode,
    });
  }

  sendEvent(event: OutgoingMessages.OutgoingEvent) {
    this.sendData({
      type: "event",
      event,
    });
  }

  sendData(data: OutgoingMessages.OutgoingMessage) {
    this.socket.send(JSON.stringify(data));
  }

  checkAlive() {
    if (this._outstandingPing) {
      this.disconnect();
      return;
    }
    this._outstandingPing = true;
    this.socket.ping();
  }

  disconnect() {
    this.socket.close();
  }
}

export const addAPItoExpress = (server, driver: Driver) => {
  const wsServer = new ws.Server({ noServer: true });
  const sockets = new Clients(driver);

  wsServer.on("connection", (socket) => sockets.addSocket(socket));

  server.on("upgrade", (request, socket, head) => {
    if (request.url !== "/zjs") {
      return;
    }

    wsServer.handleUpgrade(request, socket, head, (socket) => {
      wsServer.emit("connection", socket, request);
    });
  });
};
