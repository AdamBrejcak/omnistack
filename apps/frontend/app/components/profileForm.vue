<template>
  <UCard>
    <template #header>
      <h2 class="text-base font-semibold text-highlighted">Edit Profile</h2>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <UFormField label="Full Name">
        <UInput v-model="form.name" class="w-full" required />
      </UFormField>

      <AvatarUpload
        :current-avatar-url="form.avatarUrl"
        @uploaded="handleAvatarUploaded"
      />

      <UButton
        type="submit"
        block
        :loading="loading"
        :disabled="!isDirty"
        class="cursor-pointer"
      >
        {{ loading ? "Saving..." : "Save Changes" }}
      </UButton>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ClientUser } from "../composables/useUser";

const props = defineProps<{
  user: ClientUser | null;
}>();

const emit = defineEmits<{
  (e: "updated", data: Partial<ClientUser>): void;
}>();

const toast = useToast();
const { client } = useApi();
const loading = ref(false);

const form = ref({
  name: props.user?.name || null,
  avatarUrl: props.user?.avatarUrl || null,
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.value.name = newUser.name || null;
      form.value.avatarUrl = newUser.avatarUrl || null;
    }
  },
  { immediate: true },
);

const isDirty = computed(() => {
  return (
    form.value.name !== (props.user?.name || null) ||
    form.value.avatarUrl !== (props.user?.avatarUrl || null)
  );
});

const handleAvatarUploaded = (url: string) => {
  form.value.avatarUrl = url;
  handleSubmit();
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const res = await client.api.user.profile.$patch({
      json: {
        name: form.value.name ?? undefined,
        avatarUrl: form.value.avatarUrl ?? undefined,
      },
    });
    await unwrap(res);

    emit("updated", {
      name: form.value.name,
      avatarUrl: form.value.avatarUrl,
    });

    toast.add({ title: "Profile updated successfully!", color: "success" });
  } catch (err) {
    console.error("Failed to update profile:", err);
    toast.add({ title: "Failed to update profile. Please try again.", color: "error" });
  } finally {
    loading.value = false;
  }
};
</script>
