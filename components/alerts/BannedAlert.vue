<template>
  <div v-if="showAlert" class="alert-banner">
    <p>Your account is banned. Please contact support.</p>
    <p v-if="banReason">
      Reason: <strong>{{ banReason }}</strong>
    </p>
    <p v-if="banExpiration">
      Ban expires on: <strong>{{ banExpiration }}</strong>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const showAlert = ref(false);
const banExpiration = ref("");
const banReason = ref("");

function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(",", " at");
}

function updateAlertState() {
  showAlert.value = route.query.error === "account_banned";

  if (showAlert.value) {
    const rawBanExpiration =
      typeof route.query.banExpiration === "string"
        ? decodeURIComponent(route.query.banExpiration)
        : "";

    banExpiration.value = rawBanExpiration ? formatDate(rawBanExpiration) : "";

    banReason.value =
      typeof route.query.banReason === "string"
        ? decodeURIComponent(route.query.banReason)
        : "";
  } else {
    banExpiration.value = "";
    banReason.value = "";
  }
}

onMounted(updateAlertState);

watch(() => route.query, updateAlertState, { immediate: false, deep: true });
</script>

<style scoped>
.alert-banner {
  background-color: #ffe5e5;
  color: #b30000;
  padding: 1rem;
  border: 1px solid #ffcccc;
  border-radius: 6px;
  text-align: center;
  margin: 1rem auto;
  max-width: 600px;
  font-weight: bold;
}
</style>
