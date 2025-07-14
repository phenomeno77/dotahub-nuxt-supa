<script setup lang="ts">
import { labels } from "@/constants/labels";
import { usePremiumDialog } from "~/composables/usePremiumDialog";

const showPremiumDialog = usePremiumDialog();
</script>

<template>
  <Dialog
    v-model:visible="showPremiumDialog"
    modal
    :header="labels.UPGRADE_TO_PREMIUM"
    :style="{ minWidth: '300px' }"
    @hide="showPremiumDialog = false"
    :pt="{
      root: {
        style: {
          background: 'var(--background-color)',
          color: 'var( --text-color)',
          border: 'none',
        },
      },
    }"
  >
    <div class="premium-modal">
      <ul class="benefits list-unstyled">
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Priority Post
          Placement
        </li>
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Profile Badge &
          Crown
        </li>
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Advanced Post
          Filters
        </li>
      </ul>

      <div class="pricing-options mt-4 d-flex gap-2 flex-column">
        <Button
          class="mb-2 w-100 premium-btn border-0 d-flex justify-content-between align-items-center"
        >
          <span class="d-flex align-items-center">
            <i class="pi pi-star me-2"></i>
            Monthly
          </span>
          <span>$2.99</span>
        </Button>

        <Button
          class="mb-2 w-100 premium-btn border-0 d-flex justify-content-between align-items-center"
        >
          <span class="d-flex align-items-center">
            <i class="pi pi-star-fill"></i>
            <span class="ms-2">6 Months</span>
          </span>
          <span>$14.99</span>
        </Button>

        <Button
          class="mb-2 w-100 premium-btn border-0 d-flex justify-content-between align-items-center"
        >
          <span class="d-flex align-items-center">
            <i class="pi pi-prime me-2"></i>
            Yearly
          </span>
          <span>$24.99</span>
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.premium-modal {
  padding: 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.benefits li i {
  font-size: 1.1rem;
  color: #fbb034;
}

.benefits li {
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.premium-btn {
  background: linear-gradient(to right, #fbb034, #f7d977);
  color: #000;
  font-weight: bold;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.premium-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 0 10px rgba(251, 176, 52, 0.5);
}

::v-deep(.p-dialog-header) {
  font-size: 1.25rem;
  font-weight: bold;
  color: #fbb034;
}

.premium-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(251, 176, 52, 0.4);
  z-index: -1;
}
</style>
