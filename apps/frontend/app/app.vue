<template>
  <div>
    <NuxtPage />
    <Toaster position="top-right" theme="dark" richColors />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>
