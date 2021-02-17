import type { Driver } from "zwave-js";
import { EventEmitter } from "events";

class MockController extends EventEmitter {
  homeId = 1;
  nodes = new Map();
}

class MockDriver extends EventEmitter {
  public controller = new MockController();

  public ready = true;

  async start() {
    this.emit("driver ready");
  }

  async destroy() {}
}

export const createMockDriver = () => (new MockDriver() as unknown) as Driver;
