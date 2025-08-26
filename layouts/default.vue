<template>
  <header class="w-full">
    <div
      class="fixed top-0 flex items-center justify-between w-full"
      style="height: 80px; background-color: var(--navmenubar-background)"
    >
      <NavBar />
    </div>
  </header>

  <slot />

  <footer
    class="fixed bottom-0 flex items-center justify-center md:justify-end w-full px-3 h-10"
    style="background-color: var(--navmenubar-background)"
  >
    <div class="flex gap-3">
      <a href="/terms" class="no-underline">Terms</a>
      <a href="/privacy" class="no-underline">Privacy</a>
      <a href="/cookies" class="no-underline">Cookies</a>
    </div>
  </footer>
</template>
