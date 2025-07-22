// composables/useRealtimeNotifications.ts
export const useRealtimeNotifications = (
  userId: string,
  onNew: (notif: any) => void
) => {
  const supabase = useSupabaseClient();

  const channel = supabase
    .channel("realtime-notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Notifications",
      },
      (payload) => {
        const notif = payload.new;
        if (String(notif.userId) === String(userId)) {
          onNew(notif);
        }
      }
    )
    .subscribe();

  // Return an unsubscribe function
  return async () => {
    await channel.unsubscribe();
  };
};
