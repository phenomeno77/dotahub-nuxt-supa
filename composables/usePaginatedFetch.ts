import { useToast } from "primevue/usetoast";
import { shallowRef } from "vue";

export function usePaginatedFetch<T>(url: string, limit = 5) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const total = ref(0);
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
      const res = await $fetch<PaginatedResponse>(
        `${url}?limit=${limit}&skip=0`
      );
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
      notifications(toast, "warn", "Fetching Failed", message, 3000);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMore = async () => {
    if (items.value.length >= total.value) return;
    isLoading.value = true;

    try {
      const res = await $fetch<PaginatedResponse>(
        `${url}?limit=${limit}&skip=${items.value.length}`
      );
      if (res.success) {
        items.value = [...items.value, ...res.items] as T[];
      }
    } catch (error: any) {
      const message =
        error?.response?._data?.statusMessage ||
        error.statusMessage ||
        error.message ||
        "Unexpected error";
      notifications(toast, "warn", "Fetching Failed", message, 3000);
    } finally {
      isLoading.value = false;
    }
  };

  return { items, total, isLoading, fetchInitial, fetchMore };
}
