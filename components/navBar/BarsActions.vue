<!-- components/UserDrawer.vue -->
<script lang="ts" setup>
import { computed } from "vue";
import { buttons } from "~/constants/labels";
import { useAuthStore } from "~/stores/auth";
import { UserRole } from "~/types/enums";

const { loggedIn, user: currentUser } = useUserSession();
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
const menu = ref<any[]>([]);

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

const handleSendFeedback = () => {
  navigateTo("/feedback");
  showBarsDrawer.value = false;
};

const initDrawerMenuItems = () => {
  if (loggedIn.value) {
    menu.value.push({
      label: buttons.HOME,
      icon: "pi pi-home",
      command: () => {
        showBarsDrawer.value = false;
        navigateTo("/");
      },
    });

    if (currentUser.value?.role === UserRole.admin) {
      menu.value.push({
        label: buttons.ADMIN_DASHBOARD,
        icon: "pi pi-cog",
        command: () => {
          showBarsDrawer.value = false;
          navigateTo("/admin");
        },
      });
    }

    menu.value.push({ separator: true });

    menu.value.push({
      label: buttons.CREATE_POST,
      icon: "pi pi-pen-to-square",
      command: () => {
        showBarsDrawer.value = false;
        showCreatePostDialog.value = true;
      },
    });

    menu.value.push({
      label: buttons.POST_HISTORY,
      icon: "pi pi-history",
      command: () => {
        showBarsDrawer.value = false;
        navigateTo(`/profile/${currentUser.value.publicId}`);
      },
    });
  }
};

const actionButtons = computed(() => ({
  root: {
    style: {
      color: "var(--text-color)",
    },
    class: "custom-action-button",
  },
}));

onMounted(async () => {
  const { user, loggedIn } = useUserSession();
  initDrawerMenuItems();
  if (!user.value && !loggedIn) {
    if (avatarImage.value || avatarLabel.value) {
      await handleLogout();
    }
  }
});
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
      <div v-for="(item, index) in menu" :key="index" class="mb-2">
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
      <div class="d-flex justify-content-between p-2">
        <Button
          :label="buttons.SEND_FEEDBACK"
          icon="pi pi-comment"
          outlined
          class="me-auto"
          @click="handleSendFeedback()"
        />
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
