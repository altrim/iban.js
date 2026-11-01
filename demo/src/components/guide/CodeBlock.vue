<script setup lang="ts">
import { computed } from 'vue';
import { highlight } from '@/lib/highlight';
import CopyButton from '@/components/playground/CopyButton.vue';

const props = defineProps<{ code: string; lang?: string }>();
const html = computed(() => highlight(props.code.trim()));
</script>

<template>
  <div class="group relative">
    <pre
      class="overflow-x-auto rounded-md border border-line bg-paper-2/60 p-4 font-mono text-[13px] leading-relaxed"
    ><code v-html="html" /></pre>
    <div
      class="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
    >
      <CopyButton :text="code.trim()" label="code" />
    </div>
  </div>
</template>
