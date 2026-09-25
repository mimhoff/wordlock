import { describe, expect, it } from 'vitest';
import blocklist from '../../scripts/wordlist-blocklist.json';
import { ANSWERS, isValidWord } from './dictionary';

const blocked = Object.values(blocklist.blocked).flat();
const notAnswers = Object.values(blocklist.notAnswers).flat();

describe('word list blocklist', () => {
  it('rejects blocked words as guesses', () => {
    expect(blocked.filter(isValidWord)).toEqual([]);
  });

  it('never picks blocked or unsuitable words as answers', () => {
    const answers = new Set(ANSWERS);
    expect([...blocked, ...notAnswers].filter((w) => answers.has(w))).toEqual([]);
  });

  it('keeps "not an answer" words valid as guesses, when they are in the dictionary', () => {
    // Spot-check ordinary words with a secondary meaning; players may mean the ordinary one.
    for (const w of ['pansy', 'lynch', 'slave', 'prick']) expect(isValidWord(w)).toBe(true);
  });
});
