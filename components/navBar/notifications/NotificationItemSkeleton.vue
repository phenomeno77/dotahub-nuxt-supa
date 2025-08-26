<template>
  <div
    class="notification-item-skeleton flex flex-col p-3 mb-2 rounded shadow-sm"
  >
    <!-- HEADER -->
    <div class="flex items-center mb-2">
      <!-- Avatar Skeleton -->
      <Skeleton shape="circle" size="2.5rem" class="mr-3 flex-shrink-0" />

      <!-- Username + Type Skeleton -->
      <div class="flex-grow w-full">
        <div class="flex flex-wrap items-baseline gap-2 mb-1">
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="25%" height="0.8rem" />
        </div>
      </div>
    </div>

    <!-- CONTENT Skeleton -->
    <Skeleton width="100%" height="1rem" class="mb-1" />
    <Skeleton width="90%" height="1rem" class="mb-1" />
    <Skeleton width="80%" height="1rem" />

    <!-- FOOTER -->
    <div class="mt-3 flex justify-end">
      <Skeleton width="25%" height="0.8rem" />
    </div>
  </div>
</template>

<style scoped>
.notification-item-skeleton {
  background-color: #f8f9fa;
  border-radius: 10px;
}
</style>
