<template>
  <div>
    <div class="flex mb-3 p-3 rounded shadow-sm comment-skeleton">
      <!-- Avatar Skeleton -->
      <Skeleton shape="circle" size="2.5rem" class="mr-3 background-skeleton" />

      <!-- Comment Body Skeleton -->
      <div class="flex-1 w-full">
        <div class="flex justify-between mb-2">
          <Skeleton width="30%" height="1rem" class="background-skeleton" />
          <Skeleton width="20%" height="0.8rem" class="background-skeleton" />
        </div>

        <Skeleton width="100%" height="1rem" class="mb-1 background-skeleton" />
        <Skeleton width="90%" height="1rem" class="mb-1 background-skeleton" />
        <Skeleton width="80%" height="1rem" class="background-skeleton" />

        <Skeleton
          width="25%"
          height="0.8rem"
          class="mt-2 background-skeleton"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-skeleton {
  background-color: var(--bg-comments);
  border-radius: 10px;
}
</style>
