import { ALLOWED_GUESSES } from './words/allowed';
import { ANSWERS } from './words/answers';

export { ANSWERS };

const VALID = new Set<string>([...ANSWERS, ...ALLOWED_GUESSES]);

export function isValidWord(word: string): boolean {
  return VALID.has(word.toLowerCase());
}
