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
const showPremiumDialog = usePremiumDialog();
const showCreatePostDialog = useCreatePostDialog();

const toggleMenu = () => {
  showDrawer.value = true;
};

const drawerMenuItems = computed(() => {
  const menu: any[] = [];

  if (loggedIn.value) {
    if (user.value?.role === UserRole.admin) {
      menu.push({
        label: buttons.ADMIN_DASHBOARD,
        icon: "pi pi-users",
        command: () => {
          showDrawer.value = false;
          navigateTo("/admin-dashboard");
        },
      });

      menu.push({ separator: true });
    }

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
    menu.push({ separator: true });
    menu.push({
      label: buttons.GO_PREMIUM,
      icon: "pi pi-crown",
      command: () => {
        showDrawer.value = false;
        showPremiumDialog.value = true;
      },
    });
  }

  return menu;
});

const formattedPremiumDate = computed(() => {
  if (!authStore.premiumExpiresAt) return "N/A";
  return new Date(authStore.premiumExpiresAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
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
  <div class="position-relative d-inline-block me-2 premium-avatar-container">
    <Avatar
      :image="avatarImage"
      :label="avatarLabel"
      :class="['avatar-clickable', { 'premium-avatar': authStore.isPremium }]"
      size="large"
      shape="circle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
      @click="toggleMenu"
    />

    <div
      v-if="authStore.isPremium"
      class="premium-avatar-label"
      v-tooltip.bottom="{
        value: `Premium until ${formattedPremiumDate}`,
        autoHide: false,
      }"
      type="text"
      placeholder="autoHide: false"
    >
      Premium
    </div>
  </div>

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
          class="avatar-fixed"
        />
        <div class="d-flex flex-column">
          <span class="fw-bold">{{ authStore.username }}</span>
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
          class="d-flex justify-content-start gap-2"
          severity="danger"
          variant="text"
          @click="() => emits('logout')"
        >
          <i class="pi pi-sign-out"></i>
          Logout
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
.custom-action-button:hover {
  color: black !important;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(to Right, #f7d977, #fbb034);
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
  box-shadow: 0 0 5px rgba(251, 176, 52, 0.6);
}

.premium-badge i {
  color: #fff;
}

.premium-avatar {
  border: 2px solid #fbb034;
  box-shadow: 0 0 6px rgba(251, 176, 52, 0.6);
  transition: box-shadow 0.3s ease;
}

.premium-avatar:hover {
  box-shadow: 0 0 10px rgba(251, 176, 52, 0.8);
}

.premium-avatar-label {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #fbb034;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

a {
  all: unset;
}

a:hover {
  cursor: pointer;
}

.avatar-clickable {
  cursor: pointer;
}

.avatar-fixed {
  width: 40px;
  height: 40px;
  font-size: 1rem;
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
