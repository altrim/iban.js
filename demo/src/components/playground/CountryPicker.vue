<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  useFilter,
} from 'reka-ui';
import { Check, ChevronsUpDown } from '@lucide/vue';
import { countries } from 'iban-ts';
import { countryName } from '@/lib/countryNames';

const model = defineModel<string>({ default: '' });
defineProps<{ id?: string }>();

const options = Object.keys(countries)
  .map((code) => ({ code, name: countryName(code), official: countries[code]!.official }))
  .sort((a, b) => a.name.localeCompare(b.name));

const searchTerm = ref('');
const { contains } = useFilter({ sensitivity: 'base' });
const label = (code: string): string => (code ? `${countryName(code)} (${code})` : '');

const filtered = computed(() => {
  const term = searchTerm.value.trim();
  // When the list opens, the input still shows the selected label; treat that as "no filter".
  if (!term || term === label(model.value)) return options;
  return options.filter((o) => contains(o.name, term) || contains(o.code, term));
});
</script>

<template>
  <ComboboxRoot v-model="model" :ignore-filter="true" class="relative">
    <ComboboxAnchor
      class="flex h-10 w-full items-center rounded-md border border-line-strong bg-paper pl-3 pr-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent"
    >
      <ComboboxInput
        :id="id"
        v-model="searchTerm"
        :display-value="label"
        placeholder="Search a country or code"
        class="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-2/70"
        autocomplete="off"
      />
      <ComboboxTrigger
        class="flex size-8 items-center justify-center rounded text-ink-2 hover:text-ink"
        aria-label="Open country list"
      >
        <ChevronsUpDown class="size-4" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        :side-offset="4"
        class="z-50 w-(--reka-combobox-trigger-width) overflow-hidden rounded-md border border-line bg-paper shadow-lg shadow-ink/10 data-[state=open]:animate-in data-[state=open]:fade-in-0"
      >
        <ComboboxViewport class="max-h-72 overflow-y-auto p-1">
          <ComboboxEmpty class="px-3 py-6 text-center text-sm text-ink-2">No country matches.</ComboboxEmpty>
          <ComboboxItem
            v-for="option in filtered"
            :key="option.code"
            :value="option.code"
            class="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-paper-2 data-[disabled]:opacity-50"
          >
            <span class="w-7 font-mono text-xs text-ink-2">{{ option.code }}</span>
            <span class="flex-1 truncate">{{ option.name }}</span>
            <span v-if="!option.official" class="text-xs text-ink-2">not in registry</span>
            <ComboboxItemIndicator><Check class="size-4 text-accent" /></ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
