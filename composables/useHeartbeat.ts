import { ref, watchEffect, onUnmounted, onMounted } from "vue";

type VerifyUserStatusResponse =
  | { banned: true; banReason: string; banExpiration: string | null }
  | { banned: false };

export function useHeartbeat(intervalMs = 60000) {
  let interval: ReturnType<typeof setInterval> | null = null;
  const { loggedIn } = useUserSession();

  const start = () => {
    if (interval) return;
    interval = setInterval(async () => {
      if (loggedIn.value) {
        try {
          await $fetch("/api/auth/heartbeat", { method: "POST" });

          const response = await $fetch<VerifyUserStatusResponse>(
            "/api/auth/verifyUserStatus",
            { method: "POST" }
          );

          if (response.banned) {
            const query = new URLSearchParams({
              error: "account_banned",
              banReason: encodeURIComponent(response.banReason),
            });

            if (response.banExpiration) {
              query.set(
                "banExpiration",
                encodeURIComponent(response.banExpiration)
              );
            }

            window.location.href = `/?${query.toString()}`;
          }
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
