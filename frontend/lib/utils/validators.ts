import { z } from "zod";
import { VALIDATION, POST_TYPES, POST_STATUS } from "@/lib/constants";

// ============= Auth Validation Schemas =============

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(VALIDATION.EMAIL_MAX, `Email must be less than ${VALIDATION.EMAIL_MAX} characters`),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN, `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`)
    .max(VALIDATION.PASSWORD_MAX, `Password must be less than ${VALIDATION.PASSWORD_MAX} characters`),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.USER_NAME_MIN, `Name must be at least ${VALIDATION.USER_NAME_MIN} characters`)
    .max(VALIDATION.USER_NAME_MAX, `Name must be less than ${VALIDATION.USER_NAME_MAX} characters`)
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(VALIDATION.EMAIL_MAX, `Email must be less than ${VALIDATION.EMAIL_MAX} characters`),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN, `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`)
    .max(VALIDATION.PASSWORD_MAX, `Password must be less than ${VALIDATION.PASSWORD_MAX} characters`),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============= Post Validation Schemas =============

export const createPostSchema = z.object({
  title: z
    .string()
    .min(VALIDATION.POST_TITLE_MIN, `Title must be at least ${VALIDATION.POST_TITLE_MIN} characters`)
    .max(VALIDATION.POST_TITLE_MAX, `Title must be less than ${VALIDATION.POST_TITLE_MAX} characters`),
  type: z.enum([POST_TYPES.BLOG, POST_TYPES.CASE_STUDY], {
    required_error: "Post type is required",
  }),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(VALIDATION.POST_TITLE_MIN, `Title must be at least ${VALIDATION.POST_TITLE_MIN} characters`)
    .max(VALIDATION.POST_TITLE_MAX, `Title must be less than ${VALIDATION.POST_TITLE_MAX} characters`)
    .optional(),
  content: z.any().optional(),
  status: z.enum([POST_STATUS.DRAFT, POST_STATUS.PUBLISHED]).optional(),
});

export type UpdatePostFormData = z.infer<typeof updatePostSchema>;

// ============= Invite Validation Schemas =============

export const createInviteSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  inviteeEmail: z
    .string()
    .email("Invalid email address")
    .max(VALIDATION.EMAIL_MAX, `Email must be less than ${VALIDATION.EMAIL_MAX} characters`)
    .optional(),
});

export type CreateInviteFormData = z.infer<typeof createInviteSchema>;

// ============= AI Generation Validation Schemas =============

export const aiGenerateSchema = z.object({
  brief: z
    .string()
    .min(10, "Brief must be at least 10 characters")
    .max(1000, "Brief must be less than 1000 characters"),
  tone: z.enum(["professional", "casual", "technical"]).optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
});

export type AIGenerateFormData = z.infer<typeof aiGenerateSchema>;

// ============= Validation Helper Functions =============

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

/**
 * Check if password is strong enough
 */
export function isStrongPassword(password: string): {
  isStrong: boolean;
  feedback: string[];
} {
  const feedback: string[] = [];

  if (password.length < VALIDATION.PASSWORD_MIN) {
    feedback.push(`At least ${VALIDATION.PASSWORD_MIN} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push("One uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    feedback.push("One lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    feedback.push("One number");
  }

  return {
    isStrong: feedback.length === 0,
    feedback,
  };
}

/**
 * Calculate password strength (0-100)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= VALIDATION.PASSWORD_MIN) strength += 25;
  if (password.length >= 10) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;

  return Math.min(strength, 100);
}

