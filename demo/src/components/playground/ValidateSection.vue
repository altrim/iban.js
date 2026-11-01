<script setup lang="ts">
import { computed } from 'vue';
import { countries, electronicFormat, printFormat, toBBAN } from 'iban-ts';
import { CircleCheck, CircleX, Eraser, Shuffle, Wrench } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countryName } from '@/lib/countryNames';
import { blocksOf, corrupt, explain } from '@/lib/iban';
import { ibanInput } from '@/store';
import Badge from './Badge.vue';
import CopyButton from './CopyButton.vue';
import IbanComb from './IbanComb.vue';
import StructureChips from './StructureChips.vue';

const verdict = computed(() => explain(ibanInput.value));
const spec = computed(() => ('spec' in verdict.value ? verdict.value.spec : undefined));
const name = computed(() => (spec.value ? countryName(spec.value.countryCode) : ''));

const message = computed(() => {
  const v = verdict.value;
  if (v.ok) return `Valid IBAN for ${name.value}.`;
  switch (v.reason) {
    case 'empty':
      return '';
    case 'country':
      return `No country uses the code ${v.code}.`;
    case 'length':
      return `${name.value} IBANs are ${v.spec.length} characters long; this one has ${v.actual}.`;
    case 'check-digits':
      return 'Characters 3 and 4 must be digits.';
    case 'structure':
      return `The account part does not match the ${name.value} layout: ${blocksOf(v.spec)
        .map((b) => b.description)
        .join(', ')}.`;
    case 'checksum':
      return 'The check digits do not match: at least one character is wrong.';
  }
});

const results = computed(() => {
  if (!verdict.value.ok) return undefined;
  const electronic = electronicFormat(ibanInput.value);
  return {
    print: printFormat(electronic),
    electronic,
    bban: toBBAN(electronic, ' ') ?? '',
  };
});

const officialExamples = Object.values(countries).filter((c) => c.official);

const useRandomExample = (): void => {
  const current = electronicFormat(ibanInput.value);
  let next = current;
  while (next === current) {
    next = officialExamples[Math.floor(Math.random() * officialExamples.length)]!.example;
  }
  ibanInput.value = printFormat(next);
};

const corruptIban = (): void => {
  ibanInput.value = printFormat(corrupt(ibanInput.value));
};
</script>

<template>
  <section id="validate" class="scroll-mt-6">
    <h2 class="text-xl font-semibold">Validate an IBAN</h2>
    <p class="mt-1 max-w-prose text-ink-2">
      Paste any IBAN. Spaces, dashes and lowercase letters are fine. The result updates as you type, and each part of
      the number is colored by what it means.
    </p>

    <div class="mt-6 flex flex-col gap-2">
      <Label for="iban-input">IBAN</Label>
      <Input
        id="iban-input"
        v-model="ibanInput"
        placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
        class="h-12 font-mono text-lg tracking-wide"
        spellcheck="false"
        autocapitalize="characters"
        :aria-invalid="verdict.ok ? undefined : verdict.reason !== 'empty'"
        :aria-describedby="message ? 'iban-verdict' : undefined"
      />
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" @click="useRandomExample"><Shuffle /> Random example</Button>
        <Button variant="outline" size="sm" :disabled="!verdict.ok" @click="corruptIban"
          ><Wrench /> Change one digit</Button
        >
        <Button variant="ghost" size="sm" :disabled="!ibanInput" @click="ibanInput = ''"><Eraser /> Clear</Button>
      </div>
    </div>

    <p
      v-if="message"
      id="iban-verdict"
      role="status"
      :class="[
        'mt-5 flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium',
        verdict.ok ? 'bg-valid-bg text-valid' : 'bg-invalid-bg text-invalid',
      ]"
    >
      <CircleCheck v-if="verdict.ok" class="mt-0.5 size-4 shrink-0" />
      <CircleX v-else class="mt-0.5 size-4 shrink-0" />
      <span>{{ message }}</span>
    </p>

    <div v-if="ibanInput" class="mt-6 overflow-x-auto pb-1">
      <IbanComb :value="ibanInput" :legend="true" :invalid="!verdict.ok" />
    </div>

    <dl
      v-if="spec"
      class="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-[max-content_1fr]"
    >
      <dt class="text-sm text-ink-2">Country</dt>
      <dd class="flex flex-wrap items-center gap-2">
        <span>{{ name }}</span>
        <span class="font-mono text-sm text-ink-2">{{ spec.countryCode }}</span>
        <Badge v-if="spec.official" tone="accent">SWIFT registry</Badge>
        <Badge v-else>Not in registry</Badge>
        <Badge v-if="spec.sepa" tone="valid">SEPA</Badge>
      </dd>

      <dt class="text-sm text-ink-2">Expected layout</dt>
      <dd class="flex flex-wrap items-center gap-2">
        <StructureChips :spec="spec" />
        <span class="text-sm text-ink-2">{{ spec.length }} characters</span>
      </dd>

      <template v-if="results">
        <dt class="text-sm text-ink-2">Print format</dt>
        <dd class="flex items-center gap-2 font-mono">
          <span>{{ results.print }}</span>
          <CopyButton :text="results.print" label="print format" />
        </dd>

        <dt class="text-sm text-ink-2">Electronic format</dt>
        <dd class="flex items-center gap-2 font-mono">
          <span class="break-all">{{ results.electronic }}</span>
          <CopyButton :text="results.electronic" label="electronic format" />
        </dd>

        <dt class="text-sm text-ink-2">BBAN</dt>
        <dd class="flex items-center gap-2 font-mono">
          <span>{{ results.bban }}</span>
          <CopyButton :text="results.bban" label="BBAN" />
        </dd>
      </template>
    </dl>
  </section>
</template>
