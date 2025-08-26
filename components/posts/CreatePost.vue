<script setup lang="ts">
import {
  errorMessage,
  labels,
  buttons,
  fixed_values,
} from "~/constants/labels";
import { Position, Rank } from "~/types/enums";
import type { Post } from "~/types/Post";

const positions = ref(Object.entries(Position));
const ranks = ref(Object.values(Rank));

const description = ref<string>("");
const errors = ref<Record<string, string>>({});
const minRank = ref<Rank>();
const maxRank = ref<Rank>();
const selectedPositions = ref<Position[]>([]);
const createPostDialog = useCreatePostDialog();
const toast = useToast();
const postStore = usePostStore();
const loading = useLoadingStore();

const validateForm = () => {
  errors.value = {};
  if (!description.value.trim()) {
    errors.value.description = errorMessage.DESCRIPTION;
  }
  if (!minRank.value || !maxRank.value) {
    errors.value.ranks = errorMessage.RANK_SELECTION;
  }

  if (!selectedPositions.value || selectedPositions.value.length === 0) {
    errors.value.positions = errorMessage.POSITIONS_SELECTION;
  }

  return Object.keys(errors.value).length === 0;
};

const submitPost = async () => {
  if (!validateForm()) return;

  const post: Post = {
    partySize: selectedPositions.value.length,
    positionsNeeded: selectedPositions.value,
    minRank: minRank.value,
    maxRank: maxRank.value,
    description: description.value,
    createdAt: new Date(),
  };

  loading.startLoading();

  try {
    const response = await $fetch("/api/post", {
      method: "POST",
      body: {
        post,
      },
    });
    if (response.success) {
      createPostDialog.value = false;
      postStore.triggerRefresh();
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error?.message ||
      "An error occurred while submitting the post.";

    console.error(message);
    notifications(toast, "error", message);
  } finally {
    loading.stopLoading();
  }
};

const getPositionIcon = (position: string) => {
  switch (position.toLowerCase()) {
    case "carry":
      return "pi pi-bolt";
    case "mid":
      return "pi pi-bullseye";
    case "offlane":
      return "pi pi-shield";
    case "soft support":
      return "pi pi-users";
    case "hard support":
      return "pi pi-heart";
    default:
      return "pi pi-user";
  }
};

const minOptions = computed(() => {
  if (!maxRank.value) return ranks.value.map((r) => ({ label: r, value: r }));

  const maxIndex = ranks.value.indexOf(maxRank.value);
  return ranks.value.slice(0, maxIndex + 1).map((r) => ({
    label: r,
    value: r,
  }));
});

const maxOptions = computed(() => {
  if (!minRank.value) return ranks.value.map((r) => ({ label: r, value: r }));

  const minIndex = ranks.value.indexOf(minRank.value);
  return ranks.value.slice(minIndex).map((r) => ({
    label: r,
    value: r,
  }));
});
</script>

<template>
  <Dialog
    v-model:visible="createPostDialog"
    modal
    position="center"
    :draggable="false"
    :header="buttons.CREATE_POST"
    :style="{ width: '40%' }"
    :breakpoints="{ '960px': '90vw', '640px': '90vw' }"
    :contentStyle="{ height: '100%' }"
    :pt="{
      root: {
        style: {
          background: 'var(--bg-post)',
          color: 'var(--text-color)',
          border: 'none',
        },
      },
    }"
  >
    <!-- Description -->
    <div class="mb-3 w-full flex flex-col p-2 gap-3">
      <div class="relative">
        <FloatLabel variant="on">
          <label for="description">{{ labels.POST_DESCRIPTION }}</label>
          <Textarea
            id="description"
            autoResize
            rows="5"
            cols="30"
            class="w-full"
            v-model="description"
            required
            :maxlength="fixed_values.POST_MAX_TEXT_LENGTH"
          />
        </FloatLabel>
        <span class="char-counter">
          {{ description?.length ?? 0 }}/{{ fixed_values.POST_MAX_TEXT_LENGTH }}
        </span>
        <Message
          v-if="errors.description"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ errors.description }}
        </Message>
      </div>

      <!-- Rank Range -->
      <div>
        <strong>{{ labels.RANK_RANGE }}</strong>
        <Select
          class="w-full"
          v-model="minRank"
          :options="minOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="labels.SELECT_MIN_RANK"
        />

        <Divider align="left" type="solid">
          <label>to</label>
        </Divider>

        <Select
          class="w-full"
          v-model="maxRank"
          :options="maxOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="labels.SELECT_MAX_RANK"
        />

        <Message
          v-if="errors.ranks"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ errors.ranks }}
        </Message>
      </div>

      <!-- Positions -->
      <div>
        <strong>{{ labels.LOOKING_FOR }}</strong>
        <div class="checkbox-group">
          <div
            v-for="[positionKey, positionValue] in positions"
            :key="positionKey"
            class="checkbox-item"
          >
            <Checkbox
              v-model="selectedPositions"
              :inputId="'checkbox-' + positionKey"
              :value="positionKey"
            />
            <i :class="getPositionIcon(positionKey)" class="position-icon"></i>
            <label :for="'checkbox-' + positionKey">
              {{ positionValue }}
            </label>
          </div>
        </div>
        <Message
          v-if="errors.positions"
          severity="error"
          variant="simple"
          size="small"
        >
          {{ errors.positions }}
        </Message>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="w-full text-center">
      <Button
        :label="buttons.SUBMIT_POST"
        class="w-full"
        severity="primary"
        @click="submitPost"
      />
    </div>
  </Dialog>
</template>
