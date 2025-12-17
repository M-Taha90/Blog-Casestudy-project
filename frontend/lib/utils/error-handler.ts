import { toast } from "sonner";
import { APIError } from "@/lib/api/client";

/**
 * Parse and format error messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Show error toast notification
 */
export function showErrorToast(error: unknown, title?: string) {
  const message = getErrorMessage(error);
  toast.error(title || "Error", {
    description: message,
  });
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
  });
}

/**
 * Show info toast notification
 */
export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
  });
}

/**
 * Show loading toast notification
 */
export function showLoadingToast(message: string) {
  return toast.loading(message);
}

/**
 * Dismiss a toast by ID
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Handle promise with toast notifications
 */
export function handlePromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  }
): Promise<T> {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) =>
      typeof messages.success === "function"
        ? messages.success(data)
        : messages.success,
    error: (error) => {
      if (messages.error) {
        return typeof messages.error === "function"
          ? messages.error(error)
          : messages.error;
      }
      return getErrorMessage(error);
    },
  });
}

