import { useToast } from "primevue/usetoast";

export function usePaginatedFetch<T>(
  url: string,
  limit = 20,
  params: () => Record<string, any> = () => ({})
) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const total = ref(0);
  const toast = useToast();
  const loadingStore = useLoadingStore();
  const loadingMore = ref(false);
  const { loggedIn } = useUserSession();

  type PaginatedResponse = {
    success: boolean;
    items: T[];
    total: number;
  };

  const fetchInitial = async () => {
    loadingStore.startLoading();
    try {
      const res = await $fetch<PaginatedResponse>(url, {
        query: {
          limit: limit,
          skip: 0,
          ...params(),
        },
      });
      if (res.success) {
        items.value = res.items;
        total.value = res.total;
      }
    } catch (error: any) {
      const message =
        error?.response?._data?.statusMessage ||
        error.statusMessage ||
        error.message ||
        "Unexpected error";
      notifications(toast, "warn", "Loading Items Failed", message, 3000);
    } finally {
      loadingStore.stopLoading();
    }
  };

  const fetchMore = async () => {
    if (!loggedIn.value) {
      return;
    }

    if (items.value.length >= total.value) return;
    loadingMore.value = true;
    try {
      const res = await $fetch<PaginatedResponse>(url, {
        query: {
          limit: limit,
          skip: items.value.length,
          ...params(),
        },
      });
      if (res.success) {
        items.value = [...items.value, ...res.items] as T[];
      }
    } catch (error: any) {
      const message =
        error?.response?._data?.statusMessage ||
        error.statusMessage ||
        error.message ||
        "Unexpected error";
      notifications(toast, "warn", "Loading Items Failed", message, 3000);
    } finally {
      loadingMore.value = false;
    }
  };

  return {
    items,
    total,
    fetchInitial,
    loadingMore,
    fetchMore,
  };
}
