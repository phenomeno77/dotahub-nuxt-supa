<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import { UserRole } from "~/utils/enums";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.userRole === UserRole.admin);
const mainMenu = ref();
const { loggedIn } = useUserSession();
const showPremiumDialog = useState("showPremiumDialog");
const showCreatePostDialog = useState("createPostDialog");

// Define menu items dynamically
const mainMenuItems = computed(() => {
  const menu = [];

  if (isAdmin.value) {
    menu.push({
      label: buttons.ADMIN_DASHBOARD,
      icon: "pi pi-users",
      command: () => navigateTo("/admin-dashboard"),
    });
  }

  if (loggedIn) {
    menu.push({
      label: buttons.CREATE_POST,
      icon: "pi pi-pen-to-square",
      command: () => (showCreatePostDialog.value = true),
    });

    menu.push({
      label: buttons.GO_PREMIUM,
      icon: "pi pi-crown",
      command: () => (showPremiumDialog.value = true),
    });
  }

  return menu;
});

const toggleMainMenu = (event: any) => {
  mainMenu.value.toggle(event);
};
</script>

<template>
  <!-- TODO: ADD MARGIN TO MENU -->
  <Button icon="pi pi-th-large" aria-haspopup="true" @click="toggleMainMenu" />
  <Menu ref="mainMenu" id="overlay_menu" :model="mainMenuItems" :popup="true" />
</template>

<style></style>
