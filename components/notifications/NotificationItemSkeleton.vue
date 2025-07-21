<template>
  <div
    class="notification-item-skeleton d-flex flex-column p-3 mb-2 rounded shadow-sm"
  >
    <!-- HEADER -->
    <div class="d-flex align-items-center mb-2">
      <!-- Avatar Skeleton -->
      <Skeleton shape="circle" size="2.5rem" class="me-3 flex-shrink-0" />

      <!-- Username + Type Skeleton -->
      <div class="flex-grow-1 w-100">
        <div class="d-flex flex-wrap align-items-baseline gap-2 mb-1">
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
    <div class="footer mt-3 d-flex justify-content-end">
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
