<script setup lang="ts">
import { useRoute } from "vue-router";
import UserPostFeed from "~/components/user/UserPostFeed.vue";
import ThreeColumnLayout from "~/components/layouts/ThreeColumnLayout.vue";

definePageMeta({
  middleware: "auth-logged-in-user",
});

const route = useRoute();
const userId = route.params.id as string;
</script>

<template>
  <ThreeColumnLayout>
    <template #default>
      <UserPostFeed :user-id="userId" />
    </template>
  </ThreeColumnLayout>
</template>
