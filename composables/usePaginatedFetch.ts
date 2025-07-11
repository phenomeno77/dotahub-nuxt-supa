import { useToast } from "primevue/usetoast";

export function usePaginatedFetch<T>(url: string, limit = 20) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const totalPosts = ref(0);
  const isLoading = ref(false);
  const toast = useToast();

  type PaginatedResponse = {
    success: boolean;
    items: T[];
    total: number;
  };

  const fetchInitial = async () => {
    isLoading.value = true;
    try {
      const res = await $fetch<PaginatedResponse>(`${url}`, {
        query: {
          limit: limit,
          skip: 0,
        },
      });
      if (res.success) {
        items.value = res.items;
        totalPosts.value = res.total;
      }
    } catch (error: any) {
      const message =
        error?.response?._data?.statusMessage ||
        error.statusMessage ||
        error.message ||
        "Unexpected error";
      notifications(toast, "warn", "Loading Items Failed", message, 3000);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMore = async () => {
    if (items.value.length >= totalPosts.value) return;
    isLoading.value = true;

    try {
      const res = await $fetch<PaginatedResponse>(`${url}`, {
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
      isLoading.value = false;
    }
  };

  return { items, totalPosts, isLoading, fetchInitial, fetchMore };
}
