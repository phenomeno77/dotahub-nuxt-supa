<template>
  <div class="error-container">
    <div class="error-box">
      <h1 class="error-title">
        {{ title }}
      </h1>
      <p class="error-message">
        {{ description }}
      </p>
      <Button
        label="Go Back to Home"
        variant="link"
        icon="pi pi-home"
        @click="navigateTo('/')"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
});

const title = computed(() =>
  props.error.statusCode === 404
    ? "404 — Page Not Found"
    : "Something Went Wrong"
);

const description = computed(() =>
  props.error.statusCode === 404
    ? "The page you are looking for does not exist or has been moved."
    : props.error.message || "An unexpected error has occurred."
);
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.error-box {
  max-width: 600px;
  text-align: center;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--rank-text);
}

.error-message {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.home-link:hover {
  border-color: #007bff;
}
</style>
