<script setup lang="ts">
import { computed } from 'vue';
import type { Specification } from 'iban-ts';
import { blocksOf, type SegmentKind } from '@/lib/iban';

const props = defineProps<{ spec: Specification }>();
const blocks = computed(() => blocksOf(props.spec));

const colors: Record<SegmentKind, string> = {
  country: 'border-seg-country text-seg-country',
  check: 'border-seg-check text-seg-check',
  a: 'border-seg-a text-seg-a',
  b: 'border-seg-b text-seg-b',
  c: 'border-seg-c text-seg-c',
  d: 'border-seg-d text-seg-d',
};
</script>

<template>
  <span class="inline-flex flex-wrap gap-1.5">
    <span class="rounded-sm border px-1.5 py-0.5 font-mono text-xs border-seg-country text-seg-country">{{
      spec.countryCode
    }}</span>
    <span class="rounded-sm border px-1.5 py-0.5 font-mono text-xs border-seg-check text-seg-check">2 digits</span>
    <span
      v-for="(block, index) in blocks"
      :key="index"
      :class="['rounded-sm border px-1.5 py-0.5 font-mono text-xs', colors[block.kind]]"
      >{{ block.description }}</span
    >
  </span>
</template>
