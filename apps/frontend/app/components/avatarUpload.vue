<template>
  <div
    class="flex flex-col items-center gap-4 p-6 rounded-2xl border border-default bg-elevated shadow-xl"
  >
    <UFileUpload
      v-slot="{ open }"
      v-model="selectedFile"
      accept="image/*"
      :disabled="isUploading"
      class="contents"
    >
      <div
        class="relative group w-28 h-28 rounded-full cursor-pointer"
        :class="{ 'opacity-70 pointer-events-none': isUploading }"
        @click="open()"
      >
        <UAvatar
          :src="previewUrl ?? props.currentAvatarUrl ?? undefined"
          icon="i-lucide-user"
          size="3xl"
          class="w-28 h-28 ring-2 ring-default"
        />

        <div
          class="absolute inset-0 rounded-full bg-inverted/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-inverted text-xs font-medium backdrop-blur-sm"
        >
          <UIcon
            v-if="isUploading"
            name="i-lucide-loader-circle"
            class="size-6 animate-spin"
          />
          <span v-else>Change photo</span>
        </div>
      </div>

      <UButton
        label="Upload new photo"
        icon="i-lucide-image-up"
        color="neutral"
        variant="outline"
        block
        :loading="isUploading"
        class="cursor-pointer"
        @click="open()"
      />
    </UFileUpload>

    <p
      v-if="uploadError"
      class="text-xs text-error font-medium text-center bg-error/10 p-2 rounded-lg border border-error/20 w-full"
    >
      {{ uploadError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const props = defineProps<{
  currentAvatarUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: "uploaded", newImageUrl: string): void;
}>();

const toast = useToast();
const { uploadProfileImage, isUploading, error: uploadError } = useProfileUpload();

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const clearPreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
};

watch(selectedFile, async (file) => {
  clearPreview();

  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    toast.add({ title: "File is too big! Maximum allowed size is 5 MB.", color: "error" });
    selectedFile.value = null;
    return;
  }

  previewUrl.value = URL.createObjectURL(file);

  try {
    const uploadedUrl = await uploadProfileImage(file);
    emit("uploaded", uploadedUrl);
  } catch (err) {
    console.error("Upload failed in component:", err);
  } finally {
    selectedFile.value = null;
  }
});

onBeforeUnmount(clearPreview);
</script>
