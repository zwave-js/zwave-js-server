import { OutgoingEvent } from "./outgoing_message";
import { Client } from "./server";

function notifyAllClients(clients: Client[], event: OutgoingEvent): void {
  clients.forEach((client) => {
    if (client.receiveEvents && client.isConnected) {
      client.sendEvent(event);
    }
  });
}
