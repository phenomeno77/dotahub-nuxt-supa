export default defineNuxtPlugin(() => {
  const globalFilterSearch = useGlobalFilterSearch();
  const router = useRouter();

  router.beforeEach((to, from, next) => {
    globalFilterSearch.reset();
    next();
  });
});
