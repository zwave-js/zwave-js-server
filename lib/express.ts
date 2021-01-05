import { URL } from "url";
import ws from "ws";
import type WebSocket from "ws";
import type { Driver } from "zwave-js";
import { EventForwarder } from "./forward";

class Clients {
  private clients: Array<Client> = [];
  private pingInterval?: NodeJS.Timeout;
  private eventForwarder?: EventForwarder;

  constructor(private driver: Driver) {}

  addSocket(socket: WebSocket) {
    console.debug("New client");
    this.clients.push(new Client(socket));

    if (this.pingInterval === undefined) {
      this.pingInterval = setInterval(() => {
        const newClients = [];

        for (const client of this.clients) {
          if (client.isAlive) {
            newClients.push(client);
          } else {
            client.destroy();
          }
        }

        this.clients = newClients;
      }, 30000);
    }

    if (this.eventForwarder === undefined) {
      this.eventForwarder = new EventForwarder(this.driver, (data) => {
        for (const client of this.clients) {
          client.sendEvent(data);
        }
      });
      this.eventForwarder.start();
    }
  }

  destroy() {
    clearInterval(this.pingInterval);
    this.pingInterval = undefined;
    this.clients.forEach((client) => client.destroy());
    this.clients = [];
  }
}

class Client {
  public isAlive = true;

  constructor(private socket: WebSocket) {
    socket.on("pong", () => {
      this.isAlive = true;
    });
    socket.on("close", () => {
      this.isAlive = false;
    });
    socket.on("message", (data: string) => this.receiveMessage(data));
  }

  receiveMessage(data: string) {
    console.log("Receiving message not implemented yet:", data);
  }

  sendEvent(data: object) {
    if (!this.isAlive) {
      return;
    }
    this.socket.send(
      JSON.stringify({
        type: "event",
        data,
      })
    );
  }

  checkAlive() {
    this.isAlive = false;
    this.socket.ping();
  }

  destroy() {
    this.socket.terminate();
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
