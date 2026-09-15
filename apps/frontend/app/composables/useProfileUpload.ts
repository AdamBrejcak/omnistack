import { ref } from "vue";
import { useApi, unwrap } from "./useApi";

export const useProfileUpload = () => {
  const { client } = useApi();
  const isUploading = ref(false);
  const error = ref<string | null>(null);

  const uploadProfileImage = async (file: File) => {
    isUploading.value = true;
    error.value = null;

    try {
      const fileExtension = file.name.split(".").pop() || "jpg";

      const res = await client.api.uploads["profile-image"].$post({
        json: {
          fileType: file.type,
          fileExtension,
          fileSize: file.size,
        },
      });
      const data = await unwrap(res);

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3.");
      }

      return data.publicUrl;
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