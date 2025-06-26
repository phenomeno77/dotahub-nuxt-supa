<template>
  <div v-if="showAlert" class="alert-banner">
    <p>Steam login failed. Please try again or contact support.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const showAlert = ref(false);

onMounted(() => {
  showAlert.value = route.query.error === "steam_login_failed";
});
</script>

<style scoped>
.alert-banner {
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  text-align: center;
  margin: 1rem auto;
  max-width: 600px;
  font-weight: bold;
}
</style>
