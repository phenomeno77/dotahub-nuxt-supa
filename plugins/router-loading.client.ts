export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const loading = useLoadingStore();
    const router = useRouter();

    router.beforeEach((to, from, next) => {
      loading.startLoading();
      next();
    });

    router.afterEach(() => {
      setTimeout(() => {
        loading.stopLoading();
      }, 300);
    });

    router.onError(() => {
      loading.stopLoading();
    });
  }
});
