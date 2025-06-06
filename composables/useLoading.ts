export const useLoading = () => {
  const isLoading = useState<boolean>("loading", () => false);

  const startLoading = () => {
    isLoading.value = true;
  };

  const stopLoading = () => {
    setTimeout(() => {
      isLoading.value = false;
    }, 700);
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
};
