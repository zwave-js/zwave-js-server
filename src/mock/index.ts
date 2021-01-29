import type { Driver } from "zwave-js";
import { EventEmitter } from "events";

class MockController extends EventEmitter {
  homeId = 1;
  nodes = new Map();
}

class MockDriver extends EventEmitter {
  public controller = new MockController();

  async start() {
    this.emit("driver ready");
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async destroy() {}
}

export const createMockDriver = (): Driver => (new MockDriver() as unknown) as Driver;
