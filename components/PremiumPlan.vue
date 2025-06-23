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
  >
    <div class="premium-modal">
      <ul class="benefits list-unstyled">
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Unlimited Posts
          per Day
        </li>
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Unlimited
          Comments
        </li>
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Priority Post
          Placement
        </li>
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Profile Crown &
          Badge
        </li>
        <li>
          <i class="pi pi-check-circle text-success me-2"></i> Advanced Post
          Filters
        </li>
      </ul>

      <div class="pricing-options mt-4 d-flex gap-2 flex-column">
        <Button
          label="Monthly - $2.99"
          class="mb-2 w-full premium-btn border-0"
          icon="pi pi-star"
        />
        <Button
          label="6 Months - $14.99"
          class="mb-2 w-full premium-btn border-0"
          icon="pi pi-star-fill"
        />
        <Button
          label="Yearly - $24.99"
          class="mb-2 w-full premium-btn border-0"
          icon="pi pi-prime"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.premium-modal {
  padding: 1rem;
  background-color: var(--background-color: #212121);
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
