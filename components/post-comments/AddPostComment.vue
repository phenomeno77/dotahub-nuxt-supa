<script setup lang="ts">
import { labels } from "@/constants/labels";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const avatarImage = computed(() => authStore?.avatarUrl || undefined);
const avatarLabel = computed(() =>
  !authStore?.avatarUrl && authStore?.username
    ? authStore.username.charAt(0).toUpperCase()
    : undefined
);

const comment = defineModel<string | null>();
</script>

<template>
  <div class="d-flex px-3 gap-1">
    <div>
      <Avatar
        :image="avatarImage"
        :label="avatarLabel"
        size="large"
        shape="circle"
      />
    </div>
    <div class="d-flex w-100">
      <Textarea
        v-model="comment"
        rows="2"
        autoResize
        class="d-flex w-100"
        :placeholder="labels.COMMENT_PLACEHOLDER"
      />
    </div>
  </div>
</template>

<style scoped></style>
