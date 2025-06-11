<script lang="ts" setup>
  import AddUserForm from '~/components/admin/AddUserForm.vue';

  const showDialog = ref(false)

</script>
<template>
  <div>
    <Button label="Add User" @click="showDialog = true" />

    <AddUserForm v-model:showDialog="showDialog" />
  </div>
</template>

<style></style>
