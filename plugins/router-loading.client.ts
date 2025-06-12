import { useRouter } from "vue-router";

export default defineNuxtPlugin(() => {
  const loading = useLoading();
  const router = useRouter();

  router.beforeEach((to, from, next) => {
    setTimeout(() => {
      loading.value = true;
    }, 150);
    next();
  });

  router.afterEach(() => {
    setTimeout(() => {
      loading.value = false;
    }, 700);
  });
});
