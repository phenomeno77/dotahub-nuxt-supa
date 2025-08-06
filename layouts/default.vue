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
    class="d-flex justify-content-end align-items-center fixed-bottom"
    style="height: 40px; background-color: var(--navmenubar-background)"
  >
    <p class="m-0 me-3">Powered by: Phenomeno</p>
  </footer>
</template>
