<template>
  <div
    class="flex flex-col items-center gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"
  >
    <div
      class="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer shadow-inner"
      :class="{ 'opacity-70 cursor-not-allowed': isUploading }"
      @click="triggerFileInput"
    >
      <img
        v-if="props.currentAvatarUrl"
        :src="props.currentAvatarUrl"
        alt="Profile avatar"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <svg
        v-else
        class="w-12 h-12 text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>

      <div
        v-if="!isUploading"
        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium backdrop-blur-sm"
      >
        Change Photo
      </div>

      <div
        v-if="isUploading"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center"
      >
        <svg
          class="animate-spin h-7 w-7 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      :disabled="isUploading"
      @change="handleFileChange"
    />

    <button
      type="button"
      :disabled="isUploading"
      class="w-full px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
      @click="triggerFileInput"
    >
      <svg
        v-if="!isUploading"
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
      {{ isUploading ? "Uploading..." : "Upload new photo" }}
    </button>

    <p
      v-if="uploadError"
      class="text-xs text-red-400 font-medium text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 w-full"
    >
      {{ uploadError }}
    </p>
  </div>
</template>

<script setup lang="ts">
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const props = defineProps<{
  currentAvatarUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: "uploaded", newImageUrl: string): void;
}>();

const {
  uploadProfileImage,
  isUploading,
  error: uploadError,
} = useProfileUpload();
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  if (isUploading.value) return;
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    alert("File is too big! Maximum allowed size is 5 MB.");
    input.value = "";
    return;
  }

  try {
    const uploadedUrl = await uploadProfileImage(file);
    emit("uploaded", uploadedUrl);

    input.value = "";
  } catch (err) {
    console.error("Upload failed in component:", err);
    input.value = "";
  }
};
</script>
