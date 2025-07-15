<template>
  <header class="row">
    <div class="col-12 px-0 fixed-top" style="height: 80px">
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
