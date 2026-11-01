<script setup lang="ts">
import { computed, ref } from 'vue';
import { countries, printFormat } from 'iban-ts';
import { Search } from '@lucide/vue';
import { Input } from '@/components/ui/input';
import { countryName } from '@/lib/countryNames';
import { loadIban } from '@/store';
import Badge from './Badge.vue';
import StructureChips from './StructureChips.vue';

type Filter = 'all' | 'official' | 'sepa' | 'unofficial';
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'official', label: 'SWIFT registry' },
  { key: 'sepa', label: 'SEPA' },
  { key: 'unofficial', label: 'Not in registry' },
];

const query = ref('');
const filter = ref<Filter>('all');

const rows = Object.values(countries)
  .map((spec) => ({ spec, name: countryName(spec.countryCode) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  return rows.filter(({ spec, name }) => {
    if (filter.value === 'official' && !spec.official) return false;
    if (filter.value === 'sepa' && !spec.sepa) return false;
    if (filter.value === 'unofficial' && spec.official) return false;
    return !q || name.toLowerCase().includes(q) || spec.countryCode.toLowerCase().includes(q);
  });
});

const counts = {
  all: rows.length,
  official: rows.filter((r) => r.spec.official).length,
  sepa: rows.filter((r) => r.spec.sepa).length,
  unofficial: rows.filter((r) => !r.spec.official).length,
};
</script>

<template>
  <section id="countries" class="scroll-mt-6">
    <h2 class="text-xl font-semibold">Every supported country</h2>
    <p class="mt-1 max-w-prose text-ink-2">
      {{ counts.official }} entries from the SWIFT IBAN Registry (release 103, September 2026) and
      {{ counts.unofficial }}
      countries that use the IBAN format without being registered. Click an example to open it in the validator.
    </p>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative sm:max-w-xs sm:flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2" />
        <Input
          v-model="query"
          type="search"
          placeholder="Filter by name or code"
          class="pl-9"
          aria-label="Filter countries"
        />
      </div>
      <div class="flex gap-1 rounded-md border border-line p-1" role="group" aria-label="Show">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          :aria-pressed="filter === f.key"
          :class="[
            'rounded-sm px-2.5 py-1 text-sm transition-colors',
            filter === f.key ? 'bg-ink text-paper' : 'hover:bg-paper-2',
          ]"
          @click="filter = f.key"
        >
          {{ f.label }} <span class="text-xs opacity-70">{{ counts[f.key] }}</span>
        </button>
      </div>
    </div>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-line-strong text-left text-ink-2">
            <th scope="col" class="py-2 pr-4 font-medium">Country</th>
            <th scope="col" class="py-2 pr-4 font-medium">Length</th>
            <th scope="col" class="py-2 pr-4 font-medium">Layout</th>
            <th scope="col" class="py-2 pr-4 font-medium">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{ spec, name } in visible" :key="spec.countryCode" class="border-b border-line align-top">
            <td class="py-2.5 pr-4">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span class="font-mono text-xs text-ink-2">{{ spec.countryCode }}</span>
                <span class="font-medium">{{ name }}</span>
                <Badge v-if="!spec.official">Not in registry</Badge>
                <Badge v-if="spec.sepa" tone="valid">SEPA</Badge>
              </div>
            </td>
            <td class="py-2.5 pr-4 font-mono">{{ spec.length }}</td>
            <td class="py-2.5 pr-4"><StructureChips :spec="spec" /></td>
            <td class="py-2.5 pr-4">
              <button
                type="button"
                class="rounded-sm font-mono text-left whitespace-nowrap text-accent hover:underline"
                @click="loadIban(printFormat(spec.example))"
              >
                {{ printFormat(spec.example) }}
              </button>
            </td>
          </tr>
          <tr v-if="visible.length === 0">
            <td colspan="4" class="py-8 text-center text-ink-2">No country matches “{{ query }}”.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
