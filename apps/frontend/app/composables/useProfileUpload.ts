import { ref } from "vue";
import { useApi } from "./useApi";

export const useProfileUpload = () => {
  const { fetchWithAuth } = useApi();
  const isUploading = ref(false);
  const error = ref<string | null>(null);

  const uploadProfileImage = async (file: File) => {
    isUploading.value = true;
    error.value = null;

    try {
      const fileExtension = file.name.split(".").pop() || "jpg";

      const response = await fetchWithAuth<{
        uploadUrl: string;
        publicUrl: string;
        fileKey: string;
      }>("api/uploads/profile-image", {
        method: "POST",
        body: {
          fileType: file.type,
          fileExtension,
        },
      });

      const uploadResponse = await fetch(response.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3.");
      }

      return response.publicUrl;
    } catch (e: any) {
      error.value = e.message || "An error occurred during upload.";
      throw e;
    } finally {
      isUploading.value = false;
    }
  };

  return {
    uploadProfileImage,
    isUploading,
    error,
  };
};