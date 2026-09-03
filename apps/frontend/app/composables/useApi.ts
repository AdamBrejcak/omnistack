import { type Auth } from "firebase/auth";
import type { NitroFetchOptions } from "nitropack";

export const useApi = () => {
  const { $firebaseAuth } = useNuxtApp();
  const config = useRuntimeConfig();

  const fetchWithAuth = async <T = unknown>(
    endpoint: string,
    options?: NitroFetchOptions<any>
  ): Promise<T> => {
    const auth = $firebaseAuth as Auth;
    const user = auth?.currentUser;

    const token = user ? await user.getIdToken() : null;

    const headers = {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return $fetch<T>(`${config.public.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });
  };

  return { fetchWithAuth };
};