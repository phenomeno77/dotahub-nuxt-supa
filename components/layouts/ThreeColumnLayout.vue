<!-- components/layouts/ThreeColumnLayout.vue -->
<script setup lang="ts">
const mainEl = ref<HTMLElement | null>(null);
provide("scrollEl", mainEl);
</script>

<template>
  <main
    ref="mainEl"
    class="position-absolute start-0 end-0"
    style="top: 9%; bottom: 3%; overflow-y: auto; height: calc(100dvh - 12%)"
  >
    <div class="container-fluid h-100">
      <div class="row justify-content-center h-100">
        <div class="col-md-3 d-none d-md-block">
          <slot name="left" />
        </div>
        <div class="col-md-6 col-10 p-0 center-layout">
          <slot />
        </div>
        <div class="col-md-3 d-none d-md-block">
          <slot name="right" />
        </div>
      </div>
    </div>
  </main>
</template>
