export const usePost = () => {
  const shouldRefreshPosts = useState<boolean>("refresh-posts", () => false);

  const triggerRefresh = () => {
    shouldRefreshPosts.value = true;
  };

  const clearRefreshFlag = () => {
    shouldRefreshPosts.value = false;
  };

  return {
    shouldRefreshPosts,
    triggerRefresh,
    clearRefreshFlag,
  };
};
