import { timeAgo } from './timeAgo';

describe('timeAgo', () => {
  test('returns seconds for differences less than a minute', () => {
    const now = new Date();
    const secondsAgo = new Date(now.getTime() - 15 * 1000);
    expect(timeAgo(secondsAgo.toISOString())).toBe('15s ago');
  });

  test('returns minutes for differences less than an hour', () => {
    const now = new Date();
    const minutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(timeAgo(minutesAgo.toISOString())).toBe('5m ago');
  });

  test('returns hours for differences less than a day', () => {
    const now = new Date();
    const hoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(timeAgo(hoursAgo.toISOString())).toBe('3h ago');
  });

  test('returns days for differences less than a month', () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    expect(timeAgo(daysAgo.toISOString())).toBe('10d ago');
  });

  test('returns months for differences less than a year', () => {
    const now = new Date();
    const monthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
    expect(timeAgo(monthsAgo.toISOString())).toBe('3m ago');
  });

  test('returns years for differences greater than or equal to a year', () => {
    const now = new Date();
    const yearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(timeAgo(yearsAgo.toISOString())).toBe('2y ago');
  });
});