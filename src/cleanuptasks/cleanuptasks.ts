export class CleanupTasks {
  cleanupTasks = new Set<() => any>();

  async cleanup() {
    for (const cleanupTask of this.cleanupTasks) {
      await cleanupTask();
      this.cleanupTasks.delete(cleanupTask);
    }
  }

  async [Symbol.asyncDispose]() {
    await this.cleanup();
  }

  add(cleanupTask: () => any) {
    this.cleanupTasks.add(cleanupTask);
  }
}
