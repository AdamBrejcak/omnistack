<template>
  <div
    class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 shadow-xl"
  >
    <h2 class="text-base font-semibold text-white mb-4">Edit Profile</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-400 mb-1"
          >Full Name</label
        >
        <input
          v-model="form.name"
          type="text"
          class="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          required
        />
      </div>

      <AvatarUpload
        :current-avatar-url="form.avatarUrl"
        @uploaded="handleAvatarUploaded"
      />

      <button
        type="submit"
        :disabled="loading || !isDirty"
        class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
      >
        <span
          v-if="loading"
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
        ></span>
        <span>{{ loading ? "Saving..." : "Save Changes" }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { toast } from "vue-sonner";
import type { User } from "@omnistack/core/db";

const props = defineProps<{
  user: User | null;
}>();

const emit = defineEmits<{
  (e: "updated", data: Partial<User>): void;
}>();

const { fetchWithAuth } = useApi();
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
    await fetchWithAuth("api/user/profile", {
      method: "PATCH",
      body: {
        name: form.value.name,
        avatarUrl: form.value.avatarUrl,
      },
    });

    emit("updated", {
      name: form.value.name,
      avatarUrl: form.value.avatarUrl,
    });

    toast.success("Profile updated successfully!");
  } catch (err) {
    console.error("Failed to update profile:", err);
    toast.error("Failed to update profile. Please try again.");
  } finally {
    loading.value = false;
  }
};
</script>
