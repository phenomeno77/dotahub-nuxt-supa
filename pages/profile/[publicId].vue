<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import UserProfile from "~/components/user/UserProfile.vue";

definePageMeta({
  middleware: "auth-logged-in-user",
});

const route = useRoute();
const publicId = route.params.publicId as string;

const userId = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; user: { id: string } }>(
      `/api/user/${publicId}`
    );
    if (res.success) {
      userId.value = res.user.id;
    }
  } catch (err) {
    console.error("Failed to load user ID from publicId", err);
  }
});
</script>

<template>
  <div v-if="userId">
    <UserProfile :userId="userId" />
  </div>
  <div v-else>Loading profile...</div>
</template>
