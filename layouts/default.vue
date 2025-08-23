<template>
  <header class="row">
    <div
      class="fixed-top align-items-center justify-content-between px-0 d-flex w-100"
      style="height: 80px; background-color: var(--navmenubar-background)"
    >
      <NavBar />
    </div>
  </header>
  <slot />
  <footer
    class="d-flex justify-content-between align-items-center fixed-bottom px-3"
    style="height: 40px; background-color: var(--navmenubar-background)"
  >
    <p class="m-0">Powered by: Phenomeno</p>
    <div class="d-flex gap-3">
      <a href="/terms" class="text-decoration-none">Terms</a>
      <a href="/privacy" class="text-decoration-none">Privacy</a>
      <a href="/cookies" class="text-decoration-none">Cookies</a>
    </div>
  </footer>
</template>
