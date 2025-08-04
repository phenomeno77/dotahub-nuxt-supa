import { useToast } from "primevue/usetoast";

export function usePaginatedFetch<T>(url: string, limit = 20) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const total = ref(0);

  const toast = useToast();
  const loadingStore = useLoadingStore();

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
    if (items.value.length >= total.value) return;
    loadingStore.startLoading();
    try {
      const res = await $fetch<PaginatedResponse>(url, {
        query: {
          limit: limit,
          skip: items.value.length,
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
      loadingStore.stopLoading();
    }
  };

  return {
    items,
    total,
    fetchInitial,
    fetchMore,
  };
}
