<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import { UserRole } from "~/types/enums";

const emits = defineEmits(["logout"]);

const { loggedIn, user } = useUserSession();
const authStore = useAuthStore();
const avatarImage = computed(() => authStore.avatarUrl ?? undefined);
const avatarLabel = computed(() =>
  !authStore?.avatarUrl && authStore?.username
    ? authStore.username.charAt(0).toUpperCase()
    : ""
);
const showDrawer = ref(false);
const showCreatePostDialog = useCreatePostDialog();

const toggleMenu = () => {
  showDrawer.value = true;
};

const drawerMenuItems = computed(() => {
  const menu: any[] = [];

  if (loggedIn.value) {
    menu.push({
      label: buttons.HOME,
      icon: "pi pi-home",
      command: () => {
        showDrawer.value = false;
        navigateTo("/");
      },
    });

    if (user.value?.role === UserRole.admin) {
      menu.push({
        label: buttons.ADMIN_DASHBOARD,
        icon: "pi pi-users",
        command: () => {
          showDrawer.value = false;
          navigateTo("/admin-dashboard");
        },
      });
    }

    menu.push({ separator: true });

    menu.push({
      label: buttons.CREATE_POST,
      icon: "pi pi-pen-to-square",
      command: () => {
        showDrawer.value = false;
        showCreatePostDialog.value = true;
      },
    });

    // Profile-related actions
    menu.push({
      label: buttons.POST_HISTORY,
      icon: "pi pi-history",
      command: () => {
        showDrawer.value = false;
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
  <Avatar
    :image="avatarImage"
    :label="avatarLabel"
    size="large"
    shape="circle"
    aria-haspopup="true"
    aria-controls="overlay_menu"
  />

  <Button
    size="large"
    severity="secondary"
    icon="pi pi-bars"
    rounded
    @click="toggleMenu"
  />

  <Drawer
    v-model:visible="showDrawer"
    position="right"
    :pt="{
      root: {
        style: {
          background: 'var(--background-color)',
          color: 'var( --text-color)',
          border: 'none',
        },
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
            <span
              class="text-truncate fw-bold"
              style="
                display: inline-block;
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >
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
          @click="() => emits('logout')"
        />
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
.custom-action-button:hover {
  color: black !important;
}

a {
  all: unset;
}

a:hover {
  cursor: pointer;
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
