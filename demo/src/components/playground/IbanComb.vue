<script setup lang="ts">
import { computed } from 'vue';
import { segmentsOf, type SegmentKind } from '@/lib/iban';

const props = withDefaults(
  defineProps<{
    value: string;
    legend?: boolean;
    size?: 'md' | 'lg';
    invalid?: boolean;
  }>(),
  { legend: false, size: 'lg', invalid: false }
);

const segments = computed(() => segmentsOf(props.value));

const colors: Record<SegmentKind, string> = {
  country: 'text-seg-country border-seg-country',
  check: 'text-seg-check border-seg-check',
  a: 'text-seg-a border-seg-a',
  b: 'text-seg-b border-seg-b',
  c: 'text-seg-c border-seg-c',
  d: 'text-seg-d border-seg-d',
};

const cell = computed(() =>
  props.size === 'lg' ? 'h-11 w-7 text-xl sm:h-12 sm:w-8 sm:text-2xl' : 'h-8 w-5 text-sm sm:w-6 sm:text-base'
);
</script>

<template>
  <div class="flex flex-wrap items-end gap-x-3 gap-y-3" :aria-label="value">
    <div v-for="(segment, index) in segments" :key="index" class="flex flex-col gap-1.5">
      <div class="flex">
        <span
          v-for="(char, charIndex) in segment.text"
          :key="charIndex"
          :class="[
            'inline-flex items-center justify-center border-b-2 bg-paper-2/60 font-mono font-medium transition-colors',
            cell,
            invalid ? 'text-invalid border-invalid' : colors[segment.kind],
          ]"
          >{{ char }}</span
        >
      </div>
      <div v-if="legend" class="text-xs leading-tight text-ink-2">
        <span class="font-medium text-ink">{{ segment.label }}</span>
        <span class="block">{{ segment.description }}</span>
      </div>
    </div>
  </div>
</template>
