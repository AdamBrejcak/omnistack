import { hc } from "hono/client";
import { type Auth } from "firebase/auth";
import type { AppType } from "@omnistack/backend";
import type { ApiResponse } from "@omnistack/core/api";

export const useApi = () => {
  const { $firebaseAuth } = useNuxtApp();
  const config = useRuntimeConfig();

  const client = hc<AppType>(config.public.apiUrl, {
    headers: async (): Promise<Record<string, string>> => {
      const auth = $firebaseAuth as Auth;
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });

  return { client };
};

export const unwrap = async <T>(response: { json(): Promise<ApiResponse<T>> }): Promise<T> => {
  const body = await response.json();
  if (!body.success) {
    throw new Error(body.error.message);
  }
  return body.data;
};
