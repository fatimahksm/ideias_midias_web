import {describe, expect, it} from 'vitest';
import {
  detectSocialPlatform,
  emptyToNull,
  getContactHref,
  getNextContactMethodSortOrder,
  normalizePhoneLikeValue
} from './utils';
import type {ContactMethodResponse} from './types';

describe('emptyToNull', () => {
  it('returns null for nullish or blank values', () => {
    expect(emptyToNull(null)).toBeNull();
    expect(emptyToNull(undefined)).toBeNull();
    expect(emptyToNull('   ')).toBeNull();
  });

  it('trims and returns meaningful values', () => {
    expect(emptyToNull('  hello  ')).toBe('hello');
  });
});

describe('getNextContactMethodSortOrder', () => {
  it('starts at 1 for an empty list', () => {
    expect(getNextContactMethodSortOrder([])).toBe(1);
  });

  it('returns one above the current maximum', () => {
    const items = [
      {sortOrder: 2},
      {sortOrder: 5},
      {sortOrder: 3}
    ] as ContactMethodResponse[];
    expect(getNextContactMethodSortOrder(items)).toBe(6);
  });
});

describe('normalizePhoneLikeValue', () => {
  it('removes all whitespace', () => {
    expect(normalizePhoneLikeValue('  +55 11 99999 9999 ')).toBe('+5511999999999');
  });
});

describe('detectSocialPlatform', () => {
  it('detects known platforms from a URL', () => {
    expect(detectSocialPlatform('https://instagram.com/foo')).toBe('instagram');
    expect(detectSocialPlatform('https://www.facebook.com/foo')).toBe('facebook');
    expect(detectSocialPlatform('https://linkedin.com/in/foo')).toBe('linkedin');
    expect(detectSocialPlatform('https://youtube.com/@foo')).toBe('youtube');
    expect(detectSocialPlatform('https://tiktok.com/@foo')).toBe('tiktok');
  });

  it('falls back to website for unknown hosts', () => {
    expect(detectSocialPlatform('https://example.com')).toBe('website');
  });
});

describe('getContactHref', () => {
  it('builds tel links for phones', () => {
    expect(getContactHref('PHONE', ' +55 11 9999 ')).toBe('tel:+55119999');
  });

  it('builds wa.me links for whatsapp and strips the leading +', () => {
    expect(getContactHref('WHATSAPP', '+55 11 99999 9999')).toBe(
      'https://wa.me/5511999999999'
    );
  });

  it('builds mailto links for email', () => {
    expect(getContactHref('EMAIL', 'hi@example.com')).toBe('mailto:hi@example.com');
  });

  it('keeps absolute social URLs and prefixes bare domains with https', () => {
    expect(getContactHref('SOCIAL', 'http://example.com')).toBe('http://example.com');
    expect(getContactHref('SOCIAL', 'example.com')).toBe('https://example.com');
  });

  it('returns null for blank values', () => {
    expect(getContactHref('PHONE', '   ')).toBeNull();
  });
});
