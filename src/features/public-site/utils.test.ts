import {describe, expect, it} from 'vitest';
import {
  buildMapsUrl,
  getLocalizedValue,
  isEmbeddableVideoUrl,
  toEmbeddableVideoUrl
} from './utils';

describe('getLocalizedValue', () => {
  it('prefers the requested locale', () => {
    expect(getLocalizedValue('pt', 'Olá', 'Hello')).toBe('Olá');
    expect(getLocalizedValue('en', 'Olá', 'Hello')).toBe('Hello');
  });

  it('falls back to the other locale when the requested one is empty', () => {
    expect(getLocalizedValue('pt', '   ', 'Hello')).toBe('Hello');
    expect(getLocalizedValue('en', 'Olá', null)).toBe('Olá');
  });

  it('returns an empty string when nothing is available', () => {
    expect(getLocalizedValue('en', null, undefined)).toBe('');
  });
});

describe('buildMapsUrl', () => {
  it('uses coordinates when present', () => {
    expect(
      buildMapsUrl('en', {locationLat: -23.5, locationLng: -46.6})
    ).toBe('https://www.google.com/maps?q=-23.5,-46.6');
  });

  it('falls back to an encoded address search', () => {
    expect(
      buildMapsUrl('en', {addressEn: 'Av. Paulista, São Paulo'})
    ).toBe(
      'https://www.google.com/maps/search/?api=1&query=Av.%20Paulista%2C%20S%C3%A3o%20Paulo'
    );
  });

  it('returns null when there is no location at all', () => {
    expect(buildMapsUrl('en', {})).toBeNull();
  });
});

describe('toEmbeddableVideoUrl', () => {
  it('converts youtu.be short links', () => {
    expect(toEmbeddableVideoUrl('https://youtu.be/abc123')).toBe(
      'https://www.youtube.com/embed/abc123'
    );
  });

  it('converts youtube watch links', () => {
    expect(toEmbeddableVideoUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123'
    );
  });

  it('converts vimeo links', () => {
    expect(toEmbeddableVideoUrl('https://vimeo.com/123456789')).toBe(
      'https://player.vimeo.com/video/123456789'
    );
  });

  it('returns null for unsupported or invalid urls', () => {
    expect(toEmbeddableVideoUrl('https://example.com/video')).toBeNull();
    expect(toEmbeddableVideoUrl('not a url')).toBeNull();
    expect(toEmbeddableVideoUrl(null)).toBeNull();
  });
});

describe('isEmbeddableVideoUrl', () => {
  it('reflects whether a url can be embedded', () => {
    expect(isEmbeddableVideoUrl('https://youtu.be/abc123')).toBe(true);
    expect(isEmbeddableVideoUrl('https://example.com')).toBe(false);
  });
});
