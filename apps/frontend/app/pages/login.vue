<template>
  <div class="min-h-screen flex items-center justify-center bg-default p-4">
    <UCard class="w-full max-w-md" :ui="{ body: 'gap-6 flex flex-col' }">
      <template #header>
        <div class="text-center">
          <div
            class="mx-auto mb-4 w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-inverted shadow-lg shadow-primary/30"
          >
            O
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-highlighted">
            {{ isSignUp ? "Create an account" : "Welcome back" }}
          </h1>
          <p class="text-sm text-muted mt-2">
            {{
              isSignUp
                ? "Enter your details to get started with OmniStack"
                : "Sign in to access your dashboard"
            }}
          </p>
        </div>
      </template>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="errorMessage"
      />

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleSubmit">
        <UFormField v-if="isSignUp" label="Full name" name="name">
          <UInput v-model="state.name" placeholder="John Doe" class="w-full" />
        </UFormField>

        <UFormField label="Email address" name="email">
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="username"
            placeholder="name@email.com"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          class="cursor-pointer"
        >
          {{ isSignUp ? "Create account" : "Sign in" }}
        </UButton>
      </UForm>

      <USeparator label="Or continue with" />

      <UButton
        block
        size="lg"
        color="neutral"
        variant="outline"
        :loading="loading"
        class="cursor-pointer"
        @click="handleGoogleLogin"
      >
        <template #leading>
          <svg class="size-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </template>
        Google
      </UButton>

      <template #footer>
        <p class="text-center text-sm text-muted">
          {{ isSignUp ? "Already have an account?" : "Don't have an account?" }}
          <UButton
            variant="link"
            color="primary"
            class="p-0 cursor-pointer"
            @click="() => { isSignUp = !isSignUp }"
          >
            {{ isSignUp ? "Sign in" : "Create account" }}
          </UButton>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useNuxtApp } from "nuxt/app";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

const { $firebaseAuth } = useNuxtApp();
const { client } = useApi();
const router = useRouter();
const toast = useToast();

const isSignUp = ref(false);

const schema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  password: undefined,
});

const loading = ref(false);
const errorMessage = ref("");

const getAuthInstance = (): Auth => {
  const auth = $firebaseAuth as Auth;
  if (!auth) {
    throw new Error(
      "Firebase Auth is not initialized. Please check your environment variables.",
    );
  }
  return auth;
};

const syncUserWithBackend = async (displayName?: string | null) => {
  const res = await client.api.user.sync.$post({
    json: {
      name: displayName || state.name || "User",
    },
  });
  await unwrap(res);
};

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const auth = getAuthInstance();
    const { email, password, name } = event.data;

    if (isSignUp.value) {
      await createUserWithEmailAndPassword(auth, email, password);
      await syncUserWithBackend(name);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }

    router.push("/");
  } catch (err: any) {
    console.error("Auth Error:", err);
    errorMessage.value =
      err?.message || "An error occurred during authentication.";
    toast.add({
      title: "Authentication failed",
      description: errorMessage.value,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    await syncUserWithBackend(credential.user.displayName);

    router.push("/");
  } catch (err: any) {
    console.error("Google Auth Error:", err);
    errorMessage.value = err?.message || "Google sign-in failed.";
    toast.add({
      title: "Google sign-in failed",
      description: errorMessage.value,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
