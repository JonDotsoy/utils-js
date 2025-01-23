import { describe, expect, it, mock } from "bun:test";
import { CleanupTasks } from "./cleanuptasks";

describe("CleanupTasks", () => {
  it("should call the cleanup tasks", async () => {
    const task = mock();
    const cleanupTasks = new CleanupTasks();

    cleanupTasks.add(() => task());

    await cleanupTasks.cleanup();

    expect(task).toHaveBeenCalled();
  });

  it("should call the cleanup tasks inside an async function", async () => {
    const task = mock();
    const handler = async () => {
      await using cleanupTasks = new CleanupTasks();

      cleanupTasks.add(() => task());
    };

    await handler();

    expect(task).toHaveBeenCalled();
  });

  it("should call the cleanup tasks only once", async () => {
    const task = mock();
    const cleanupTasks = new CleanupTasks();

    cleanupTasks.add(() => task());

    await cleanupTasks.cleanup();
    await cleanupTasks.cleanup();
    await cleanupTasks.cleanup();

    expect(task).toHaveBeenCalledTimes(1);
  });
});
