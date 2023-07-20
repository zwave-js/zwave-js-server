import type { Driver, ZWaveOptions } from "zwave-js";
import { EventEmitter } from "events";
import { LogConfig } from "@zwave-js/core";

class MockController extends EventEmitter {
  homeId = 1;
  nodes = new Map();
}

class MockDriver extends EventEmitter {
  public controller = new MockController();

  public ready = true;

  public statisticsEnabled = true;

  async start() {
    this.emit("driver ready");
  }

  public getLogConfig(): Partial<LogConfig> {
    return {
      enabled: true,
      level: "debug",
      transports: [],
    };
  }

  public updateLogConfig(config: Partial<LogConfig>) {}

  public updateUserAgent(
    additionalUserAgentComponents?: Record<string, string> | null,
  ) {}

  public updateOptions(options: Partial<ZWaveOptions>) {}

  async destroy() {}
}

export const createMockDriver = () => new MockDriver() as unknown as Driver;
