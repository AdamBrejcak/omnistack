<template>
  <UButton
    :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
    color="neutral"
    variant="ghost"
    aria-label="Toggle color mode"
    class="cursor-pointer"
    @click="toggleColorMode"
  />
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
