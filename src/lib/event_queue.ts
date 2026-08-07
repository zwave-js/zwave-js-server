import { setImmediate as setImmediatePromise } from "node:timers/promises";

/**
 * Runs queued tasks one per event loop iteration, in the order they were
 * pushed. The first task of a burst runs synchronously inside `push`, so a
 * single task costs no extra latency.
 *
 * A bare `setImmediate` per task would not be enough: Node drains the whole
 * immediate queue in a single check phase without polling for I/O in between,
 * so tasks queued during the same tick would still run as one uninterruptible
 * block.
 */
export class EventQueue {
  private tasks: (() => void)[] = [];
  private draining = false;

  constructor(private onError: (error: Error) => void) {}

  push(task: () => void): void {
    this.tasks.push(task);
    if (!this.draining) void this.drain();
  }

  clear(): void {
    this.tasks = [];
  }

  private async drain(): Promise<void> {
    this.draining = true;
    try {
      let task: (() => void) | undefined;
      while ((task = this.tasks.shift())) {
        try {
          task();
        } catch (error) {
          this.onError(error as Error);
        }
        await setImmediatePromise();
      }
    } finally {
      this.draining = false;
    }
  }
}
