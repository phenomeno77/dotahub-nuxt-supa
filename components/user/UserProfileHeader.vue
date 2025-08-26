<script setup lang="ts">
import { computed } from "vue";
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
  <div class="flex items-center gap-4 border-b pb-4 mb-4">
    <!-- Avatar -->
    <Avatar
      :image="avatarImage"
      :label="avatarLabel"
      size="xlarge"
      shape="circle"
    />

    <!-- Info -->
    <div>
      <h1 class="text-xl font-bold">
        {{ props.user.username }}'s post history
      </h1>
    </div>
  </div>
</template>
