import { ref, watchEffect, onUnmounted, onMounted } from "vue";

export function useHeartbeat(intervalMs = 60000) {
  let interval: ReturnType<typeof setInterval> | null = null;
  const { loggedIn } = useUserSession();

  const start = () => {
    if (interval) return;
    interval = setInterval(async () => {
      if (loggedIn.value) {
        try {
          await $fetch("/api/heartbeat", { method: "POST" });
        } catch (err) {
          console.error("Heartbeat failed:", err);
        }
      }
    }, intervalMs);
  };

  const stop = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  onMounted(() => {
    watchEffect(() => {
      if (loggedIn.value) {
        start();
      } else {
        stop();
      }
    });
  });

  onUnmounted(() => {
    stop();
  });

  return { start, stop };
}
