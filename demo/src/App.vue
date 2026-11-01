<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { Moon, Sun } from '@lucide/vue';
import { countries } from 'iban-ts';
import pkg from 'iban-ts/package.json';
import { Button } from '@/components/ui/button';
import BuildSection from '@/components/playground/BuildSection.vue';
import FormatSection from '@/components/playground/FormatSection.vue';
import RegistrySection from '@/components/playground/RegistrySection.vue';
import ValidateSection from '@/components/playground/ValidateSection.vue';

const isDark = useDark();
const toggleDark = useToggle(isDark);
const countryCount = Object.keys(countries).length;
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
        <nav class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a href="#validate" class="text-accent hover:underline">Validate</a>
          <a href="#build" class="text-accent hover:underline">Build from BBAN</a>
          <a href="#format" class="text-accent hover:underline">Format</a>
          <a href="#countries" class="text-accent hover:underline">Countries</a>
        </nav>
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

    <main class="mt-12 flex flex-col gap-14">
      <ValidateSection />
      <hr class="border-line-strong" />
      <BuildSection />
      <hr class="border-line-strong" />
      <FormatSection />
      <hr class="border-line-strong" />
      <RegistrySection />
    </main>

    <footer class="mt-16 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-6 text-sm text-ink-2">
      <a href="https://www.npmjs.com/package/iban-ts" target="_blank" rel="noopener" class="hover:text-ink"
        >npm install iban-ts</a
      >
      <a href="https://github.com/altrim/iban.js" target="_blank" rel="noopener" class="hover:text-ink"
        >Source on GitHub</a
      >
      <span class="ml-auto">MIT license</span>
    </footer>
  </div>
</template>
