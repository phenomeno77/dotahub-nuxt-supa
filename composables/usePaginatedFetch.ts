import { useToast } from "primevue/usetoast";

export function usePaginatedFetch<T>(url: string, limit = 20) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const total = ref(0);
  const isLoadingInit = ref(false);
  const isLoadingMore = ref(false);
  const toast = useToast();

  type PaginatedResponse = {
    success: boolean;
    items: T[];
    total: number;
  };

  const fetchInitial = async () => {
    isLoadingInit.value = true;
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
      isLoadingInit.value = false;
    }
  };

  const fetchMore = async () => {
    if (items.value.length >= total.value) return;
    isLoadingMore.value = true;

    try {
      const res = await $fetch<PaginatedResponse>(url, {
        query: {
          limit: total.value - limit,
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
      isLoadingMore.value = false;
    }
  };

  return {
    items,
    total,
    isLoadingInit,
    isLoadingMore,
    fetchInitial,
    fetchMore,
  };
}
