<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { Check, Copy } from '@lucide/vue';
import { Button } from '@/components/ui/button';

const props = defineProps<{ text: string; label?: string }>();
const { copy, copied, isSupported } = useClipboard({ copiedDuring: 1500 });
</script>

<template>
  <Button
    v-if="isSupported"
    variant="ghost"
    size="sm"
    :aria-label="copied ? 'Copied' : `Copy ${label ?? ''}`.trim()"
    @click="copy(props.text)"
  >
    <Check v-if="copied" class="text-valid" />
    <Copy v-else />
    <span>{{ copied ? 'Copied' : 'Copy' }}</span>
  </Button>
</template>
