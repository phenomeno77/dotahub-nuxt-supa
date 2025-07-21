<!-- components/UserDrawer.vue -->
<script lang="ts" setup>
import { computed } from "vue";
import { buttons } from "~/constants/labels";
import { useAuthStore } from "~/stores/auth";
import { UserRole } from "~/types/enums";

const { loggedIn, user } = useUserSession();
const authStore = useAuthStore();
const supabase = useSupabaseClient();
const loadingStore = useLoadingStore();
const avatarImage = computed(() => authStore.avatarUrl ?? undefined);
const avatarLabel = computed(() =>
  !authStore?.avatarUrl && authStore?.username
    ? authStore.username.charAt(0).toUpperCase()
    : ""
);
const showBarsDrawer = ref(false);
const showCreatePostDialog = useCreatePostDialog();

const handleLogout = async () => {
  loadingStore.startLoading();
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Logout error", e);
  } finally {
    const { clear } = useUserSession();
    clear();
    authStore.logout();

    loadingStore.stopLoading();
    await navigateTo("/", { replace: true });
  }
};

const drawerMenuItems = computed(() => {
  const menu: any[] = [];

  if (loggedIn.value) {
    menu.push({
      label: buttons.HOME,
      icon: "pi pi-home",
      command: () => {
        showBarsDrawer.value = false;
        navigateTo("/");
      },
    });

    if (user.value?.role === UserRole.admin) {
      menu.push({
        label: buttons.ADMIN_DASHBOARD,
        icon: "pi pi-users",
        command: () => {
          showBarsDrawer.value = false;
          navigateTo("/admin-dashboard");
        },
      });
    }

    menu.push({ separator: true });

    menu.push({
      label: buttons.CREATE_POST,
      icon: "pi pi-pen-to-square",
      command: () => {
        showBarsDrawer.value = false;
        showCreatePostDialog.value = true;
      },
    });

    menu.push({
      label: buttons.POST_HISTORY,
      icon: "pi pi-history",
      command: () => {
        showBarsDrawer.value = false;
        navigateTo(`/profile/${authStore.userId}`);
      },
    });
  }

  return menu;
});

const actionButtons = computed(() => ({
  root: {
    style: {
      color: "var(--text-color)",
    },
    class: "custom-action-button",
  },
}));
</script>

<template>
  <Button
    size="large"
    severity="secondary"
    icon="pi pi-bars"
    rounded
    @click="showBarsDrawer = true"
  />

  <Drawer
    v-model:visible="showBarsDrawer"
    position="right"
    :pt="{
      root: {
        class: 'drawer-main',
      },
    }"
  >
    <template #header>
      <div class="d-flex align-items-center gap-2 p-2">
        <Avatar
          :image="avatarImage"
          :label="avatarLabel"
          shape="circle"
          size="large"
          class="avatar-fixed"
        />
        <div class="d-flex flex-column overflow-hidden">
          <p
            class="mb-0 fw-bold username d-flex align-items-center"
            :title="authStore.username ?? ''"
          >
            <span class="text-truncate fw-bold name-truncate">
              {{ authStore.username }}
            </span>
          </p>
        </div>
      </div>
    </template>

    <div class="p-3">
      <div v-for="(item, index) in drawerMenuItems" :key="index" class="mb-2">
        <hr v-if="item.separator" class="my-2" />
        <Button
          :pt="actionButtons"
          v-else
          class="w-100 d-flex justify-content-start gap-2"
          variant="text"
          @click="item.command"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </Button>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-end p-2">
        <Button
          severity="danger"
          :label="buttons.LOGOUT"
          icon="pi pi-sign-out"
          variant="text"
          @click="handleLogout"
        />
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
.custom-action-button:hover {
  color: black !important;
}

.avatar-fixed {
  flex-shrink: 0;
}

.name-truncate {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
