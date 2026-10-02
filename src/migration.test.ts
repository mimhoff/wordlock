import { beforeEach, describe, expect, it } from 'vitest';
import { dailyNumber } from './game/puzzle';
import { displayedStreak, recordResult } from './game/stats';
import { convertLegacyStats, migrateLegacyData } from './migration';
import { load } from './platform/storage';

const V2_STATS = {
  gamesPlayed: 12,
  gamesWon: 10,
  currentStreak: 4,
  maxStreak: 6,
  guessDistribution: [0, 1, 3, 2, 2, 1, 1, 0],
  lastGameDate: '20260924',
  lastGameGuessCount: 3,
};

describe('convertLegacyStats', () => {
  it('maps v2 fields and turns the last played date into a puzzle number', () => {
    expect(convertLegacyStats(V2_STATS)).toEqual({
      played: 12,
      won: 10,
      cleanWins: 10,
      currentStreak: 4,
      maxStreak: 6,
      distribution: [0, 1, 3, 2, 2, 1, 1, 0],
      lastDaily: dailyNumber('2026-09-24'),
    });
  });

  it('keeps a streak alive only if the last v2 game was yesterday', () => {
    const stats = convertLegacyStats(V2_STATS);
    expect(displayedStreak(stats, dailyNumber('2026-09-25'))).toBe(4);
    expect(displayedStreak(stats, dailyNumber('2026-09-27'))).toBe(0);
    expect(recordResult(stats, { won: true, guesses: 2, dailyNumber: dailyNumber('2026-09-25') }).currentStreak).toBe(5);
  });

  it('tolerates missing or malformed fields', () => {
    expect(convertLegacyStats({ guessDistribution: [1, 2] })).toEqual({
      played: 0,
      won: 0,
      cleanWins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [1, 2, 0, 0, 0, 0, 0, 0],
      lastDaily: undefined,
    });
  });
});

describe('migrateLegacyData', () => {
  beforeEach(() => localStorage.clear());

  it('imports v2 stats, theme and first-visit flag once', () => {
    localStorage.setItem('stats', JSON.stringify(V2_STATS));
    localStorage.setItem('theme', JSON.stringify('light'));
    localStorage.setItem('hasVisited', 'true');
    migrateLegacyData();
    expect(load('stats:daily', null)).toMatchObject({ played: 12, currentStreak: 4 });
    expect(load('settings', null)).toEqual({ theme: 'light' });
    expect(load('seenHelp', false)).toBe(true);
    // v2 data is left untouched so a rollback still works.
    expect(localStorage.getItem('stats')).not.toBeNull();

    // A second run must not overwrite stats earned since.
    localStorage.setItem('wordlock:stats:daily', JSON.stringify({ played: 99 }));
    migrateLegacyData();
    expect(load('stats:daily', null)).toEqual({ played: 99 });
  });

  it('keeps v2 players on the dark theme they always saw, even when v2 saved it as "{}"', () => {
    localStorage.setItem('stats', JSON.stringify(V2_STATS));
    localStorage.setItem('theme', '{}');
    migrateLegacyData();
    expect(load('settings', null)).toEqual({ theme: 'dark' });
  });

  it('does nothing for new players', () => {
    migrateLegacyData();
    expect(load('stats:daily', null)).toBeNull();
    expect(load('settings', null)).toBeNull();
  });
});

describe('recordResult', () => {
  it('counts each daily puzzle only once', () => {
    const stats = convertLegacyStats({ ...V2_STATS, lastGameDate: '20260925' });
    expect(recordResult(stats, { won: true, guesses: 3, dailyNumber: dailyNumber('2026-09-25') })).toBe(stats);
  });
});
