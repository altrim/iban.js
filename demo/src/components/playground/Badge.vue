<script setup lang="ts">
defineProps<{ tone?: 'neutral' | 'accent' | 'valid' }>();
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium',
      tone === 'accent'
        ? 'bg-accent/10 text-accent'
        : tone === 'valid'
          ? 'bg-valid-bg text-valid'
          : 'bg-paper-2 text-ink-2',
    ]"
  >
    <slot />
  </span>
</template>
