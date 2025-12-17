import { get, post } from "./client";
import type {
  AIGenerateInput,
  AIGenerateResponse,
  AIModelsResponse,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * AI API functions
 */
export const aiApi = {
  /**
   * Generate AI content
   */
  generate: async (data: AIGenerateInput): Promise<AIGenerateResponse> => {
    return post<AIGenerateResponse, AIGenerateInput>(
      API_ENDPOINTS.AI_GENERATE,
      data
    );
  },

  /**
   * Get available AI models
   */
  getModels: async (): Promise<AIModelsResponse> => {
    return get<AIModelsResponse>(API_ENDPOINTS.AI_MODELS);
  },
};

