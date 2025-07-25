<script setup lang="ts">
import { type UserProfile } from "~/types/UserProfile";
const props = defineProps<{ user: UserProfile }>();

const avatarImage = computed(() => props.user?.avatarUrl || undefined);
const avatarLabel = computed(() =>
  !props.user?.avatarUrl && props.user?.username
    ? props.user.username.charAt(0).toUpperCase()
    : undefined
);
</script>

<template>
  <div class="m-4 mx-0 pb-3 border-bottom">
    <div class="d-flex align-items-center gap-3">
      <Avatar
        :image="avatarImage"
        :label="avatarLabel"
        class="me-2 flex-shrink-0"
        size="xlarge"
        shape="circle"
      />
      <div>
        <h3 class="mb-1">{{ user.username }}</h3>
      </div>
    </div>
  </div>
</template>
