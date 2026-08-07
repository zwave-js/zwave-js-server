import { setImmediate as setImmediatePromise } from "node:timers/promises";

/**
 * Runs queued tasks one per event loop iteration, in the order they were
 * pushed. While the queue is idle, a task runs synchronously inside `push`.
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
        } catch (e) {
          this.onError(e instanceof Error ? e : new Error(`${e}`));
        }
        // The last task must yield too, so `draining` stays true for the rest
        // of this tick
        await setImmediatePromise();
      }
    } finally {
      this.draining = false;
    }
  }
}
