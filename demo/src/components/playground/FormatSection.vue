<script setup lang="ts">
import { computed, ref } from 'vue';
import { electronicFormat, printFormat } from 'iban-ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ibanInput } from '@/store';
import CopyButton from './CopyButton.vue';

const separators = [
  { key: 'space', label: 'Space', value: ' ' },
  { key: 'dash', label: 'Dash', value: '-' },
  { key: 'dot', label: 'Dot', value: '.' },
  { key: 'none', label: 'None', value: '' },
] as const;

const separatorKey = ref<(typeof separators)[number]['key']>('space');
const groupSize = ref(4);

const separator = computed(() => separators.find((s) => s.key === separatorKey.value)?.value ?? ' ');
const electronic = computed(() => electronicFormat(ibanInput.value));
const printed = computed(() =>
  electronic.value ? printFormat(electronic.value, separator.value, groupSize.value) : ''
);
</script>

<template>
  <section id="format" class="scroll-mt-6">
    <h2 class="text-xl font-semibold">Format for print or storage</h2>
    <p class="mt-1 max-w-prose text-ink-2">
      Uses the IBAN from the validator above. Print format groups characters for people; electronic format strips
      everything for storage and APIs.
    </p>

    <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <fieldset class="flex flex-col gap-2">
        <legend class="text-sm font-medium">Separator</legend>
        <div class="flex gap-1 rounded-md border border-line p-1">
          <label
            v-for="s in separators"
            :key="s.key"
            :class="[
              'flex-1 cursor-pointer rounded-sm px-2 py-1.5 text-center text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent',
              separatorKey === s.key ? 'bg-ink text-paper' : 'hover:bg-paper-2',
            ]"
          >
            <input v-model="separatorKey" type="radio" name="separator" :value="s.key" class="sr-only" />
            {{ s.label }}
          </label>
        </div>
      </fieldset>

      <div class="flex flex-col gap-2">
        <Label for="group-size">Group size: {{ groupSize }}</Label>
        <Input
          id="group-size"
          v-model.number="groupSize"
          type="range"
          min="1"
          max="8"
          step="1"
          class="h-10 accent-accent px-0 border-0 bg-transparent"
        />
      </div>
    </div>

    <dl class="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-[max-content_1fr]">
      <dt class="text-sm text-ink-2">Print format</dt>
      <dd class="flex items-center gap-2 font-mono">
        <span class="break-all">{{ printed || '—' }}</span>
        <CopyButton v-if="printed" :text="printed" label="print format" />
      </dd>
      <dt class="text-sm text-ink-2">Electronic format</dt>
      <dd class="flex items-center gap-2 font-mono">
        <span class="break-all">{{ electronic || '—' }}</span>
        <CopyButton v-if="electronic" :text="electronic" label="electronic format" />
      </dd>
    </dl>

    <pre
      class="mt-6 overflow-x-auto rounded-md border border-line bg-paper-2/60 p-4 font-mono text-sm leading-relaxed"
    ><code>printFormat({{ JSON.stringify(electronic) }}, {{ JSON.stringify(separator) }}, {{ groupSize }})
<span class="text-ink-2">// {{ JSON.stringify(printed) }}</span></code></pre>
  </section>
</template>
