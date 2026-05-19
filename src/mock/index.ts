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

  public allNodesReady = true;

  public configVersion = "0.0.0-mock";

  public statisticsEnabled = true;

  private logConfig: Partial<LogConfig> = {
    enabled: true,
    level: "debug",
    transports: [],
  };

  async start() {
    this.emit("driver ready");
  }

  public getLogConfig(): Partial<LogConfig> {
    return {
      ...this.logConfig,
      transports: [...(this.logConfig.transports ?? [])],
    };
  }

  public updateLogConfig(config: Partial<LogConfig>) {
    this.logConfig = {
      ...this.logConfig,
      ...config,
    };
  }

  public updateUserAgent(
    _additionalUserAgentComponents?: Record<string, string> | null,
  ) {}

  public updateOptions(_options: Partial<ZWaveOptions>) {}

  async destroy() {}
}

export const createMockDriver = () => new MockDriver() as unknown as Driver;
