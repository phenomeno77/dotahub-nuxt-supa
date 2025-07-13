<template>
  <div class="px-3 pb-2">
    <div
      v-for="n in skeletonCount"
      :key="n"
      class="d-flex mb-3 p-3 rounded shadow-sm comment-skeleton"
    >
      <!-- Avatar Skeleton -->
      <Skeleton shape="circle" size="2.5rem" class="me-3" />

      <!-- Comment Body Skeleton -->
      <div class="flex-grow-1 w-100">
        <div class="d-flex justify-content-between mb-2">
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="20%" height="0.8rem" />
        </div>

        <Skeleton width="100%" height="1rem" class="mb-1" />
        <Skeleton width="90%" height="1rem" class="mb-1" />
        <Skeleton width="80%" height="1rem" />

        <Skeleton width="25%" height="0.8rem" class="mt-2" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  skeletonCount: {
    type: Number,
    default: 3,
  },
});
</script>

<style scoped>
.comment-skeleton {
  background-color: #f8f9fa;
  border-radius: 10px;
}
</style>
