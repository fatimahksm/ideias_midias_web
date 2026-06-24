import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {resolveMediaUrl} from './resolve-media-url';

const ORIGINAL_ENV = {...process.env};

describe('resolveMediaUrl', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  afterEach(() => {
    process.env = {...ORIGINAL_ENV};
  });

  it('returns an empty string for empty input', () => {
    expect(resolveMediaUrl(null)).toBe('');
    expect(resolveMediaUrl('   ')).toBe('');
  });

  it('leaves absolute and inline urls untouched', () => {
    expect(resolveMediaUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png'
    );
    expect(resolveMediaUrl('data:image/png;base64,xxx')).toBe(
      'data:image/png;base64,xxx'
    );
  });

  it('prefixes relative urls with the backend root', () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.example.com/';
    expect(resolveMediaUrl('/uploads/media/a.png')).toBe(
      'https://api.example.com/uploads/media/a.png'
    );
  });

  it('derives the server root from the api base url by stripping /api', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/api';
    expect(resolveMediaUrl('uploads/a.png')).toBe(
      'https://api.example.com/uploads/a.png'
    );
  });

  it('returns the relative path unchanged when no server root is configured', () => {
    expect(resolveMediaUrl('/uploads/a.png')).toBe('/uploads/a.png');
  });
});
