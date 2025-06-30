export function useHeartbeat(intervalMs = 60000) {
  let interval: ReturnType<typeof setInterval>;

  const start = () => {
    interval = setInterval(async () => {
      try {
        await $fetch("/api/heartbeat", { method: "POST" });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    }, intervalMs);
  };

  const stop = () => {
    clearInterval(interval);
  };

  return { start, stop };
}
