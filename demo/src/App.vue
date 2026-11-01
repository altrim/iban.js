<script setup lang="ts">
import { onMounted } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { Moon, Sun } from '@lucide/vue';
import { countries } from 'iban-ts';
import pkg from 'iban-ts/package.json';
import { Button } from '@/components/ui/button';
import BuildSection from '@/components/playground/BuildSection.vue';
import FormatSection from '@/components/playground/FormatSection.vue';
import RegistrySection from '@/components/playground/RegistrySection.vue';
import ValidateSection from '@/components/playground/ValidateSection.vue';
import GuidePage from '@/components/guide/GuidePage.vue';
import { navigate, page, scrollToTarget } from '@/router';

const isDark = useDark();
const toggleDark = useToggle(isDark);
const countryCount = Object.keys(countries).length;

const sections = [
  { id: 'validate', label: 'Validate' },
  { id: 'build', label: 'Build from BBAN' },
  { id: 'format', label: 'Format' },
  { id: 'countries', label: 'Countries' },
];

onMounted(scrollToTarget);
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-8 sm:px-8 sm:py-12">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="font-mono text-2xl font-semibold tracking-tight">
          iban-ts <span class="text-ink-2">{{ pkg.version }}</span>
        </h1>
        <p class="mt-2 max-w-prose text-ink-2">
          A zero-dependency TypeScript library that validates, builds and formats International Bank Account Numbers for
          {{ countryCount }} countries and territories. Everything on this page runs in your browser with the published
          package.
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleDark()"
      >
        <Sun v-if="isDark" />
        <Moon v-else />
      </Button>
    </header>

    <nav class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line text-sm" aria-label="Pages">
      <a
        href="#/"
        :class="[
          '-mb-px border-b-2 px-0.5 pb-2 font-medium',
          page === 'playground' ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink',
        ]"
        :aria-current="page === 'playground' ? 'page' : undefined"
        >Playground</a
      >
      <a
        href="#/guide"
        :class="[
          '-mb-px border-b-2 px-0.5 pb-2 font-medium',
          page === 'guide' ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink',
        ]"
        :aria-current="page === 'guide' ? 'page' : undefined"
        >Usage guide</a
      >
      <template v-if="page === 'playground'">
        <span class="hidden text-line-strong sm:inline" aria-hidden="true">|</span>
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#/#${s.id}`"
          class="pb-2 text-ink-2 hover:text-ink"
          @click.prevent="navigate('playground', s.id)"
          >{{ s.label }}</a
        >
      </template>
    </nav>

    <main class="mt-10">
      <div v-if="page === 'playground'" class="flex flex-col gap-14">
        <ValidateSection />
        <hr class="border-line-strong" />
        <BuildSection />
        <hr class="border-line-strong" />
        <FormatSection />
        <hr class="border-line-strong" />
        <RegistrySection />
      </div>
      <GuidePage v-else />
    </main>

    <footer class="mt-16 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-6 text-sm text-ink-2">
      <a href="https://www.npmjs.com/package/iban-ts" target="_blank" rel="noopener" class="hover:text-ink"
        >npm install iban-ts</a
      >
      <a href="https://github.com/altrim/iban.js" target="_blank" rel="noopener" class="hover:text-ink"
        >Source on GitHub</a
      >
      <a
        href="https://github.com/altrim/iban.js/blob/master/CHANGELOG.md"
        target="_blank"
        rel="noopener"
        class="hover:text-ink"
        >Changelog</a
      >
      <span class="ml-auto">MIT license</span>
    </footer>
  </div>
</template>
