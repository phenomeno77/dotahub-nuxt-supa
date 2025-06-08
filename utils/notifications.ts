import { useToast } from "primevue/usetoast";

export default function notifications(
  toast: ReturnType<typeof useToast>,
  severity: "success" | "info" | "warn" | "error",
  summary: string,
  detail?: string,
  life?: number
) {
  toast.add({
    severity,
    summary,
    detail: detail || "",
    life: life || 3000,
  });
}
