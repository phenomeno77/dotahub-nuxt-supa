<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import { useRouter } from "vue-router";

const emits = defineEmits(["logout"]);

const { loggedIn } = useUserSession();
const profileMenu = ref();
const router = useRouter();
const authStore = useAuthStore();

const avatarImage = computed(() => authStore.avatarUrl ?? undefined);
const avatarLabel = computed(() =>
  !authStore?.avatarUrl && authStore?.username
    ? authStore.username.charAt(0).toUpperCase()
    : ""
);

const toggleProfile = (event: any) => {
  profileMenu.value.toggle(event);
};

const profileMenuItems = computed(() => {
  const menu = [];

  if (loggedIn) {
    menu.push({
      separator: true,
    });
    menu.push({
      label: buttons.POST_HISTORY,
      icon: "pi pi-history",
      command: () => router.push({ path: `/profile` }),
    });

    menu.push({
      separator: true,
    });

    menu.push({
      label: buttons.LOGOUT,
      icon: "pi pi-sign-out",
      command: () => emits("logout"),
    });
  }

  return menu;
});
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
      @click="toggleProfile"
    />

    <div v-if="authStore.isPremium" class="premium-avatar-label">Premium</div>
  </div>

  <Menu
    ref="profileMenu"
    id="overlay_menu"
    :model="profileMenuItems"
    :popup="true"
    :pt="{
      root: {
        style: {
          border: 'none',
          top: '7%',
        },
      },
      item: {
        style: {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      },
    }"
  >
    <template #start>
      <div class="d-flex align-items-center justify-content-start gap-2 p-1">
        <Avatar
          :image="avatarImage"
          :label="avatarLabel"
          shape="circle"
          class="avatar-fixed"
        />
        <div class="d-flex flex-column justify-content-center">
          <span class="name-truncate">
            Test name Test name Test name Test name Test name
          </span>
          <span v-if="!authStore.isPremium" class="text-sm"> Premium </span>
        </div>
      </div>
    </template>
  </Menu>
</template>

<style scoped>
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
