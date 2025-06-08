<template>
  <Toast />
  <ConfirmDialog />
  <!-- <div v-if="loadingStore.isLoading" class="loading-overlay">
    <ProgressSpinner />
  </div>

  <PremiumPlan v-if="premiumStore.showPremiumDialog" /> -->

  <div class="container-fluid d-flex flex-column h-100">
    <header class="row">
      <div class="col-12 px-0 fixed-top" style="height: 7%">
        <NavBar />
      </div>
    </header>

    <main
      class="position-absolute start-0 end-0"
      style="top: 7%; bottom: 3%; overflow-y: auto"
    >
      <div class="container-fluid h-100">
        <div class="row justify-content-center h-100">
          <div v-if="layoutColumns.left" :class="layoutColumns.left"></div>
          <div :class="layoutColumns.center">
            <NuxtPage />
          </div>
          <div v-if="layoutColumns.right" :class="layoutColumns.right"></div>
        </div>
      </div>
    </main>

    <footer
      class="d-flex justify-content-end align-items-center fixed-bottom"
      style="height: 3%; background-color: var(--navmenubar-background)"
    >
      <p class="m-0 me-3">Powered by: Phenomeno</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { NuxtPage } from "#components";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
// import NavBarView from '~/components/NavBarView.vue';
// import PremiumPlan from '~/components/premium/PremiumPlan.vue';
// import { useAuth } from '~/composables/useAuth';
// import { useLoading } from '~/composables/useLoading';
// import { usePremium } from '~/composables/usePremium';

const config = useRuntimeConfig();
useHead({
  title: config.public.appName,
});

const route = useRoute();
// const loading = useLoading();
// const auth = useAuth();
// const premium = usePremium();

const isHomePage = computed(() => route.path === "/");
const isProfilePage = computed(() => route.path === "/my-posts");

const layoutColumns = computed(() => {
  if (isHomePage.value || isProfilePage.value) {
    return {
      left: "col-md-3 d-none d-md-block",
      center: "col-md-6 col-10  p-0",
      right: "col-md-3 d-none d-md-block",
    };
  } else {
    return {
      left: false,
      center: "col-12 p-0",
      right: false,
    };
  }
});

// onMounted(() => {
//   auth.checkAuth();

//   const updateDarkMode = (matches: boolean) => {
//     document.body.classList.toggle('dark', matches);
//   };

//   const match = window.matchMedia('(prefers-color-scheme: dark)');
//   updateDarkMode(match.matches);
//   match.addEventListener('change', e => updateDarkMode(e.matches));
// });
</script>
