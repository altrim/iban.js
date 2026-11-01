<script setup lang="ts">
import { chapters } from './examples';
import CodeBlock from './CodeBlock.vue';

const output = (run: () => unknown): string => {
  try {
    const value = run();
    return value === undefined ? 'undefined' : JSON.stringify(value, null, 2);
  } catch (error) {
    return `throws ${(error as Error).name}: ${(error as Error).message}`;
  }
};
</script>

<template>
  <div class="grid grid-cols-1 gap-10 lg:grid-cols-[12rem_minmax(0,1fr)]">
    <nav class="hidden lg:block" aria-label="Guide chapters">
      <ol class="sticky top-8 flex flex-col gap-1 text-sm">
        <li v-for="chapter in chapters" :key="chapter.id">
          <a
            :href="`#/guide/${chapter.id}`"
            class="block rounded-sm px-2 py-1 text-ink-2 hover:bg-paper-2 hover:text-ink"
          >
            {{ chapter.title }}
          </a>
        </li>
      </ol>
    </nav>

    <div class="flex flex-col gap-14">
      <section v-for="chapter in chapters" :id="`guide-${chapter.id}`" :key="chapter.id" class="scroll-mt-6">
        <h2 class="text-xl font-semibold">{{ chapter.title }}</h2>
        <p class="mt-1 max-w-prose text-ink-2">{{ chapter.intro }}</p>

        <div class="mt-6 flex flex-col gap-8">
          <article v-for="example in chapter.examples" :key="example.title">
            <h3 class="font-medium">{{ example.title }}</h3>
            <p class="mt-0.5 max-w-prose text-sm text-ink-2">{{ example.note }}</p>
            <div class="mt-3">
              <CodeBlock :code="example.code" />
            </div>
            <div
              v-if="example.run"
              class="mt-2 flex items-start gap-2 rounded-md border border-dashed border-line px-3 py-2 font-mono text-[13px]"
            >
              <span class="shrink-0 text-ink-2" aria-label="Result">→</span>
              <pre class="whitespace-pre-wrap break-all text-ink">{{ output(example.run) }}</pre>
            </div>
          </article>
        </div>
      </section>

      <p class="border-t border-line pt-6 text-sm text-ink-2">
        Every result above is computed live by the published package, not pasted in.
      </p>
    </div>
  </div>
</template>
