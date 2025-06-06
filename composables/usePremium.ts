export const usePremium = () => {
  const showPremiumDialog = useState<boolean>("premium-dialog", () => false);

  const openPremiumDialog = () => {
    showPremiumDialog.value = true;
  };

  const closePremiumDialog = () => {
    showPremiumDialog.value = false;
  };

  return {
    showPremiumDialog,
    openPremiumDialog,
    closePremiumDialog,
  };
};
