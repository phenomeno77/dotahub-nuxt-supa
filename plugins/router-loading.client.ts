import { useRouter } from "vue-router";

export default defineNuxtPlugin(() => {
  const loading = useLoadingStore();
  const router = useRouter();

  router.beforeEach((to, from, next) => {
    setTimeout(() => {
      loading.startLoading();
    }, 150);
    next();
  });

  router.afterEach(() => {
    setTimeout(() => {
      loading.stopLoading();
    }, 700);
  });
});
