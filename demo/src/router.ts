import { computed, ref } from 'vue';

export type Page = 'playground' | 'guide';

/** Hash routes: "#/" is the playground, "#/guide" the usage guide. "#/guide/<chapter>" scrolls to a chapter. */
const hash = ref(window.location.hash);
window.addEventListener('hashchange', () => {
  hash.value = window.location.hash;
  scrollToTarget();
});

export const page = computed<Page>(() => (hash.value.startsWith('#/guide') ? 'guide' : 'playground'));

export function navigate(to: Page, section?: string): void {
  const next = to === 'guide' ? `#/guide${section ? `/${section}` : ''}` : `#/${section ? `#${section}` : ''}`;
  if (window.location.hash === next) {
    scrollToTarget();
  } else {
    window.location.hash = next;
  }
}

/** Scrolls to the element implied by the current hash, after the page has rendered. */
export function scrollToTarget(): void {
  const h = window.location.hash;
  const guide = /^#\/guide\/([\w-]+)/.exec(h);
  const play = /^#\/#([\w-]+)/.exec(h);
  const id = guide ? `guide-${guide[1]}` : play ? play[1] : undefined;
  requestAnimationFrame(() => {
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0 });
    }
  });
}
