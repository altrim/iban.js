<script setup lang="ts">
import { computed, ref } from 'vue';
import { countries, electronicFormat, fromBBAN, isValidBBAN, printFormat, toBBAN } from 'iban-ts';
import { CircleCheck, CircleX } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countryName } from '@/lib/countryNames';
import { loadIban } from '@/store';
import CopyButton from './CopyButton.vue';
import CountryPicker from './CountryPicker.vue';
import IbanComb from './IbanComb.vue';
import StructureChips from './StructureChips.vue';

const code = ref('NL');
const bban = ref('ABNA0417164300');

const spec = computed(() => countries[code.value]);
const electronic = computed(() => electronicFormat(bban.value));
const valid = computed(() => Boolean(spec.value) && isValidBBAN(code.value, bban.value));
const iban = computed(() => (valid.value ? fromBBAN(code.value, bban.value) : ''));

const hint = computed(() => {
  if (!spec.value || !bban.value) return '';
  const expected = spec.value.length - 4;
  if (electronic.value.length !== expected) {
    return `${countryName(code.value)} BBANs are ${expected} characters; this one has ${electronic.value.length}.`;
  }
  return valid.value ? '' : `Some characters are in the wrong place for the ${countryName(code.value)} layout.`;
});

const useExample = (): void => {
  if (spec.value) bban.value = toBBAN(spec.value.example, '') ?? '';
};
</script>

<template>
  <section id="build" class="scroll-mt-6">
    <h2 class="text-xl font-semibold">Build an IBAN from a BBAN</h2>
    <p class="mt-1 max-w-prose text-ink-2">
      Pick a country and enter the national account number. The check digits are computed for you.
    </p>

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div class="flex flex-col gap-2">
        <Label for="build-country">Country</Label>
        <CountryPicker id="build-country" v-model="code" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="build-bban">BBAN</Label>
        <Input
          id="build-bban"
          v-model="bban"
          class="font-mono"
          spellcheck="false"
          autocapitalize="characters"
          :placeholder="spec ? `${spec.length - 4} characters` : 'Choose a country first'"
          :aria-invalid="bban ? !valid : undefined"
        />
      </div>
    </div>

    <div v-if="spec" class="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-2">
      <span>Layout for {{ countryName(code) }}:</span>
      <StructureChips :spec="spec" />
      <Button variant="link" size="sm" class="h-auto p-0" @click="useExample">Use the example BBAN</Button>
    </div>

    <div v-if="bban" class="mt-6">
      <p v-if="valid" class="flex items-center gap-2 text-sm font-medium text-valid">
        <CircleCheck class="size-4" /> Valid BBAN
      </p>
      <p v-else class="flex items-center gap-2 text-sm font-medium text-invalid">
        <CircleX class="size-4 shrink-0" /> {{ hint || 'Invalid BBAN' }}
      </p>

      <div v-if="iban" class="mt-4 flex flex-col gap-4">
        <div class="overflow-x-auto pb-1"><IbanComb :value="iban" size="md" /></div>
        <div class="flex flex-wrap items-center gap-2 font-mono">
          <span>{{ printFormat(iban) }}</span>
          <CopyButton :text="printFormat(iban)" label="IBAN" />
          <Button variant="link" size="sm" class="h-auto p-0 font-sans" @click="loadIban(printFormat(iban))">
            Open in the validator
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
