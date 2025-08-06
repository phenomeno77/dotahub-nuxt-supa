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
  <div class="m-4 mx-0 pb-3 border-bottom"></div>
</template>
