import { uploadFile } from "./client";
import type { UploadResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Uploads API functions
 */
export const uploadsApi = {
  /**
   * Upload an image file
   */
  uploadImage: async (
    file: File,
    postId?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (postId) {
      formData.append("postId", postId);
    }

    return uploadFile<UploadResponse>(
      API_ENDPOINTS.UPLOADS,
      formData,
      onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        : undefined
    );
  },
};

