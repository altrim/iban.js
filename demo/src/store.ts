import { nextTick, ref } from 'vue';

/** The IBAN shown in the validator. Shared so other sections can load an example into it. */
export const ibanInput = ref('DE89 3704 0044 0532 0130 00');

export async function loadIban(iban: string): Promise<void> {
  ibanInput.value = iban;
  await nextTick();
  document.getElementById('validate')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('iban-input')?.focus({ preventScroll: true });
}
