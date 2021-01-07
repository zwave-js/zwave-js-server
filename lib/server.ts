import ws from 'ws'
import type WebSocket from 'ws'
import { Driver } from 'zwave-js'
import { EventForwarder } from './forward'
import { OutgoingEvent, OutgoingMessage } from './outgoing_message'
import { dumpState } from './state'
import { Server as HttpServer, createServer } from 'http'
import { once } from 'events'

class Client {
  public _respondedPing = true;

  constructor (private socket: WebSocket) {
    socket.on('pong', () => {
      this._respondedPing = true
    })
    socket.on('close', () => {
      this._respondedPing = false
    })
    socket.on('message', (data: string) => this.receiveMessage(data))
  }

  get isAlive (): boolean {
    return this._respondedPing && this.socket.readyState === this.socket.OPEN
  }

  receiveMessage (data: string) {
    console.log('Receiving message not implemented yet:', data)
  }

  sendState (driver: Driver) {
    this.sendData({
      type: 'state',
      state: dumpState(driver)
    })
  }

  sendEvent (event: OutgoingEvent) {
    this.sendData({
      type: 'event',
      event
    })
  }

  sendData (data: OutgoingMessage) {
    if (!this._respondedPing) {
      return
    }
    this.socket.send(JSON.stringify(data))
  }

  checkAlive () {
    this._respondedPing = false
    this.socket.ping()
  }

  destroy () {
    this.socket.terminate()
  }
}
class Clients {
  private clients: Array<Client> = [];
  private pingInterval?: NodeJS.Timeout;
  private eventForwarder?: EventForwarder;

  constructor (private driver: Driver) {}

  addSocket (socket: WebSocket) {
    console.debug('New client')
    const client = new Client(socket)
    client.sendState(this.driver)
    this.clients.push(client)

    if (this.pingInterval === undefined) {
      this.pingInterval = setInterval(() => {
        const newClients = []

        for (const client of this.clients) {
          if (client._respondedPing) {
            newClients.push(client)
          } else {
            client.destroy()
          }
        }

        this.clients = newClients
      }, 30000)
    }

    if (this.eventForwarder === undefined) {
      this.eventForwarder = new EventForwarder(this.driver, (data) => {
        for (const client of this.clients) {
          client.sendEvent(data)
        }
      })
      this.eventForwarder.start()
    }
  }

  destroy () {
    clearInterval(this.pingInterval)
    this.pingInterval = undefined
    this.clients.forEach((client) => client.destroy())
    this.clients = []
  }
}

interface ZwavejsServerOptions {
  port: number
}

export class ZwavejsServer {
  private server: HttpServer;
  private wsServer: ws.Server;
  private sockets: Clients;

  constructor (private driver: Driver, private options: ZwavejsServerOptions) {}

  async start () {
    this.server = createServer()
    this.wsServer = new ws.Server({ server: this.server })
    this.sockets = new Clients(this.driver)
    this.wsServer.on('connection', (socket) => this.sockets.addSocket(socket))

    this.server.listen(this.options.port)
    await once(this.server, 'listening')
  }

  async destroy () {
    this.sockets.destroy()
    this.server.close()
    await once(this.server, 'close')
  }
}
