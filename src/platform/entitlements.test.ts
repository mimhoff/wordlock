import { beforeEach, describe, expect, it } from 'vitest';
import { isPremium, onPremiumChange, setPremium } from './entitlements';

describe('entitlements', () => {
  beforeEach(() => localStorage.clear());

  it('is free until a purchase sets premium, and remembers it', () => {
    expect(isPremium()).toBe(false);
    setPremium(true);
    expect(isPremium()).toBe(true);
    expect(localStorage.getItem('wordlock:premium')).toBe('true');
  });

  it('notifies listeners only when the state actually changes', () => {
    const seen: boolean[] = [];
    const off = onPremiumChange((p) => seen.push(p));
    setPremium(true);
    setPremium(true); // no change, no notification
    setPremium(false);
    off();
    setPremium(true); // unsubscribed
    expect(seen).toEqual([true, false]);
  });
});
