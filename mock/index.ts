import type { Driver } from 'zwave-js'
import { EventEmitter } from 'events'

class MockController extends EventEmitter {
  homeId = 1;
  nodes = new Map();
}

class MockDriver extends EventEmitter {
  public controller = new MockController();

  async start () {
    this.emit('driver ready')
  }
}

export const createMockDriver = () => (new MockDriver() as unknown) as Driver
