// composables/useRealtimePosts.ts
export const useRealtimePosts = (
  currentUserId: string,
  onNewPost: (post: any) => void
) => {
  const supabase = useSupabaseClient();

  const channel = supabase
    .channel("realtime-posts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Posts",
      },
      (payload) => {
        const post = payload.new;

        if (String(post.userId) !== String(currentUserId)) {
          onNewPost(post);
        }
      }
    )
    .subscribe();

  return async () => {
    await channel.unsubscribe();
  };
};
