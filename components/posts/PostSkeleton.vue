<template>
  <div class="post-item shadow-sm my-4">
    <!-- Header -->
    <div class="d-flex align-items-center mb-3 px-3 pt-3">
      <Skeleton shape="circle" size="3rem" class="me-2" />
      <div class="flex-grow-1">
        <Skeleton width="40%" height="1rem" class="mb-2" />
        <Skeleton width="60%" height="0.75rem" />
      </div>
    </div>

    <!-- Description -->
    <div class="px-3">
      <Skeleton width="100%" height="1rem" class="mb-2" />
      <Skeleton width="90%" height="1rem" class="mb-2" />
      <Skeleton width="80%" height="1rem" />
    </div>

    <!-- Rank Row -->
    <div class="px-3 pb-2 mt-3">
      <Skeleton width="50%" height="1.2rem" />
    </div>

    <!-- Positions Row -->
    <div class="px-3 pb-2 mt-2">
      <Skeleton width="30%" height="1rem" class="mb-2" />
      <div class="d-flex flex-wrap gap-2">
        <Skeleton
          v-for="n in 5"
          :key="n"
          width="80px"
          height="2rem"
          borderRadius="999px"
        />
      </div>
    </div>

    <!-- Button -->
    <div class="d-flex justify-content-end p-3">
      <Skeleton width="130px" height="2.5rem" borderRadius="8px" />
    </div>
  </div>
</template>

<style scoped>
.post-item {
  background-color: #fff;
  border-radius: 12px;
}
</style>
