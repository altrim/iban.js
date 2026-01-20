<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isValid, isValidBBAN, fromBBAN, toBBAN, printFormat, electronicFormat, countries } from 'iban-ts';
import { CheckCircle2, XCircle, ArrowRightLeft, Copy, Check, Moon, Sun } from 'lucide-vue-next';

const countryNames: Record<string, string> = {
  AD: 'Andorra',
  AE: 'United Arab Emirates',
  AL: 'Albania',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BA: 'Bosnia and Herzegovina',
  BE: 'Belgium',
  BG: 'Bulgaria',
  BH: 'Bahrain',
  BI: 'Burundi',
  BJ: 'Benin',
  BL: 'Saint Barthelemy',
  BR: 'Brazil',
  BF: 'Burkina Faso',
  BY: 'Belarus',
  CH: 'Switzerland',
  CI: "Cote d'Ivoire",
  CM: 'Cameroon',
  CR: 'Costa Rica',
  CV: 'Cape Verde',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DE: 'Germany',
  DK: 'Denmark',
  DO: 'Dominican Republic',
  DZ: 'Algeria',
  EE: 'Estonia',
  EG: 'Egypt',
  ES: 'Spain',
  FI: 'Finland',
  FO: 'Faroe Islands',
  FR: 'France',
  GB: 'United Kingdom',
  GE: 'Georgia',
  GF: 'French Guiana',
  GI: 'Gibraltar',
  GL: 'Greenland',
  GP: 'Guadeloupe',
  GR: 'Greece',
  GT: 'Guatemala',
  HR: 'Croatia',
  HU: 'Hungary',
  IE: 'Ireland',
  IL: 'Israel',
  IQ: 'Iraq',
  IR: 'Iran',
  IS: 'Iceland',
  IT: 'Italy',
  JO: 'Jordan',
  KW: 'Kuwait',
  KZ: 'Kazakhstan',
  LB: 'Lebanon',
  LC: 'Saint Lucia',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LV: 'Latvia',
  MC: 'Monaco',
  MD: 'Moldova',
  ME: 'Montenegro',
  MF: 'Saint Martin',
  MG: 'Madagascar',
  MK: 'North Macedonia',
  ML: 'Mali',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MT: 'Malta',
  MU: 'Mauritius',
  MZ: 'Mozambique',
  NC: 'New Caledonia',
  NL: 'Netherlands',
  NO: 'Norway',
  PF: 'French Polynesia',
  PK: 'Pakistan',
  PL: 'Poland',
  PM: 'Saint Pierre and Miquelon',
  PS: 'Palestine',
  PT: 'Portugal',
  QA: 'Qatar',
  RE: 'Reunion',
  RO: 'Romania',
  RS: 'Serbia',
  SA: 'Saudi Arabia',
  SC: 'Seychelles',
  SE: 'Sweden',
  SI: 'Slovenia',
  SK: 'Slovakia',
  SM: 'San Marino',
  SN: 'Senegal',
  ST: 'Sao Tome and Principe',
  SV: 'El Salvador',
  TF: 'French Southern Territories',
  TL: 'Timor-Leste',
  TN: 'Tunisia',
  TR: 'Turkey',
  UA: 'Ukraine',
  VA: 'Vatican City',
  VG: 'British Virgin Islands',
  WF: 'Wallis and Futuna',
  XK: 'Kosovo',
  YT: 'Mayotte',
  AO: 'Angola',
};

// Only include countries that have IBAN support
const supportedCountries = computed(() => {
  return Object.keys(countries)
    .map((code) => ({
      code,
      name: countryNames[code] || code,
      spec: countries[code],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const selectedCountry = ref('');
const inputValue = ref('');
const copied = ref(false);
const isDark = ref(false);
const mode = ref<'iban' | 'bban'>('iban');

// Detect system preference
if (typeof window !== 'undefined') {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  }
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
};

const detectedCountry = computed(() => {
  if (mode.value === 'iban' && inputValue.value.length >= 2) {
    const code = inputValue.value.replace(/\s/g, '').substring(0, 2).toUpperCase();
    if (countries[code]) {
      return code;
    }
  }
  return null;
});

const effectiveCountry = computed(() => detectedCountry.value || selectedCountry.value);

const countrySpec = computed(() => {
  if (effectiveCountry.value) {
    return countries[effectiveCountry.value];
  }
  return null;
});

const validationResult = computed(() => {
  const value = inputValue.value.trim();
  if (!value) return null;

  if (mode.value === 'iban') {
    const valid = isValid(value);
    return {
      valid,
      type: 'IBAN',
      formatted: valid ? printFormat(value) : null,
      electronic: valid ? electronicFormat(value) : null,
      bban: valid ? toBBAN(value) : null,
    };
  } else {
    if (!selectedCountry.value) return null;
    const valid = isValidBBAN(selectedCountry.value, value);
    let generatedIban = null;
    if (valid) {
      try {
        generatedIban = fromBBAN(selectedCountry.value, value);
      } catch {
        // ignore
      }
    }
    return {
      valid,
      type: 'BBAN',
      formatted: null,
      electronic: null,
      iban: generatedIban,
      ibanFormatted: generatedIban ? printFormat(generatedIban) : null,
    };
  }
});

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const useExample = () => {
  if (countrySpec.value) {
    if (mode.value === 'iban') {
      inputValue.value = printFormat(countrySpec.value.example);
    } else {
      const bban = toBBAN(countrySpec.value.example, '');
      if (bban) {
        inputValue.value = bban;
      }
    }
  }
};

const switchMode = () => {
  mode.value = mode.value === 'iban' ? 'bban' : 'iban';
  inputValue.value = '';
};

// Auto-detect country from IBAN input
watch(detectedCountry, (newCountry) => {
  if (newCountry && mode.value === 'iban') {
    selectedCountry.value = newCountry;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">IBAN Validator</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Powered by <code class="text-sm bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">iban-ts</code></p>
        </div>
        <Button variant="ghost" size="icon" @click="toggleDarkMode" class="rounded-full">
          <Sun v-if="isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>
      </div>

      <!-- Main Card -->
      <Card class="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
        <CardHeader class="pb-4">
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-xl">{{ mode === 'iban' ? 'Validate IBAN' : 'Convert BBAN to IBAN' }}</CardTitle>
              <CardDescription class="mt-1">
                {{ mode === 'iban' ? 'Enter an IBAN to validate and format' : 'Enter a BBAN to generate an IBAN' }}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="switchMode" class="gap-2">
              <ArrowRightLeft class="h-4 w-4" />
              {{ mode === 'iban' ? 'BBAN Mode' : 'IBAN Mode' }}
            </Button>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Country Selector (always visible in BBAN mode, optional in IBAN mode) -->
          <div class="space-y-2">
            <Label>Country {{ mode === 'iban' ? '(auto-detected from IBAN)' : '' }}</Label>
            <Select v-model="selectedCountry">
              <SelectTrigger>
                <SelectValue :placeholder="mode === 'iban' ? 'Auto-detect or select' : 'Select country'">
                  <span v-if="effectiveCountry">
                    {{ countryNames[effectiveCountry] || effectiveCountry }}
                    <span class="text-slate-400 ml-1">({{ effectiveCountry }})</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup class="max-h-[300px] overflow-y-auto">
                  <SelectItem
                    v-for="country in supportedCountries"
                    :key="country.code"
                    :value="country.code"
                  >
                    {{ country.name }} ({{ country.code }})
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <!-- Country Info -->
          <div v-if="countrySpec" class="flex gap-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
            <div>
              <span class="font-medium">Length:</span> {{ countrySpec.length }} characters
            </div>
            <div class="border-l border-slate-200 dark:border-slate-700 pl-4">
              <span class="font-medium">Example:</span>
              <button @click="useExample" class="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs">
                {{ printFormat(countrySpec.example) }}
              </button>
            </div>
          </div>

          <!-- Input -->
          <div class="space-y-2">
            <Label :for="mode">{{ mode === 'iban' ? 'IBAN' : 'BBAN' }}</Label>
            <div class="relative">
              <Input
                :id="mode"
                v-model="inputValue"
                :placeholder="mode === 'iban' ? 'e.g. DE89 3704 0044 0532 0130 00' : 'Enter BBAN'"
                class="font-mono text-lg pr-10 h-12"
                :class="{
                  'border-green-500 focus-visible:ring-green-500': validationResult?.valid,
                  'border-red-500 focus-visible:ring-red-500': validationResult && !validationResult.valid,
                }"
              />
              <div v-if="validationResult" class="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 v-if="validationResult.valid" class="h-5 w-5 text-green-500" />
                <XCircle v-else class="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          <!-- Results -->
          <div v-if="validationResult" class="space-y-4">
            <!-- Status -->
            <div
              class="rounded-lg p-4"
              :class="validationResult.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'"
            >
              <div class="flex items-center gap-2">
                <CheckCircle2 v-if="validationResult.valid" class="h-5 w-5 text-green-600 dark:text-green-400" />
                <XCircle v-else class="h-5 w-5 text-red-600 dark:text-red-400" />
                <span class="font-medium" :class="validationResult.valid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
                  {{ validationResult.valid ? `Valid ${validationResult.type}` : `Invalid ${validationResult.type}` }}
                </span>
              </div>
            </div>

            <!-- IBAN Mode Results -->
            <template v-if="validationResult.valid && mode === 'iban'">
              <div class="space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label class="text-xs text-slate-500 dark:text-slate-400">Print Format</Label>
                    <p class="font-mono text-sm mt-0.5">{{ validationResult.formatted }}</p>
                  </div>
                  <Button variant="ghost" size="icon" class="h-8 w-8" @click="copyToClipboard(validationResult.formatted!)">
                    <Check v-if="copied" class="h-4 w-4 text-green-500" />
                    <Copy v-else class="h-4 w-4" />
                  </Button>
                </div>
                <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <Label class="text-xs text-slate-500 dark:text-slate-400">Electronic Format</Label>
                  <p class="font-mono text-sm mt-0.5">{{ validationResult.electronic }}</p>
                </div>
                <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <Label class="text-xs text-slate-500 dark:text-slate-400">BBAN</Label>
                  <p class="font-mono text-sm mt-0.5">{{ validationResult.bban }}</p>
                </div>
              </div>
            </template>

            <!-- BBAN Mode Results -->
            <template v-if="validationResult.valid && mode === 'bban' && validationResult.iban">
              <div class="space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <Label class="text-xs text-slate-500 dark:text-slate-400">Generated IBAN</Label>
                    <p class="font-mono text-sm mt-0.5">{{ validationResult.ibanFormatted }}</p>
                  </div>
                  <Button variant="ghost" size="icon" class="h-8 w-8" @click="copyToClipboard(validationResult.iban!)">
                    <Check v-if="copied" class="h-4 w-4 text-green-500" />
                    <Copy v-else class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </template>
          </div>
        </CardContent>
      </Card>

      <!-- Stats -->
      <div class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Supporting <span class="font-semibold text-slate-700 dark:text-slate-300">{{ supportedCountries.length }}</span> countries and territories
      </div>

      <!-- Footer -->
      <footer class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <a href="https://github.com/altrim/iban.js" target="_blank" rel="noopener" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          View on GitHub
        </a>
        <span class="mx-2">|</span>
        <a href="https://www.npmjs.com/package/iban-ts" target="_blank" rel="noopener" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          npm
        </a>
      </footer>
    </div>
  </div>
</template>
