// composables/useRealtimePostComments.ts
export const useRealtimePostComments = (
  onNewComment: (comment: any) => void
) => {
  const supabase = useSupabaseClient();

  const channel = supabase
    .channel("realtime-post-comments")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "PostComments",
      },
      (payload) => {
        const comment = payload.new;
        onNewComment(comment);
      }
    )
    .subscribe();

  return async () => {
    await channel.unsubscribe();
  };
};
