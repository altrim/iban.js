import { nextTick, ref } from 'vue';
import { navigate } from './router';

/** The IBAN shown in the validator. Shared so other sections can load an example into it. */
export const ibanInput = ref('DE89 3704 0044 0532 0130 00');

export async function loadIban(iban: string): Promise<void> {
  ibanInput.value = iban;
  navigate('playground', 'validate');
  await nextTick();
  document.getElementById('iban-input')?.focus({ preventScroll: true });
}
