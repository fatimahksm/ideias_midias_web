import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

type RemotePattern = {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname: string;
};

function toRemotePattern(value?: string | null): RemotePattern | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const normalized = trimmed.replace(/\/api\/?$/, '');
    const url = new URL(normalized);

    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: '/**'
    };
  } catch {
    return null;
  }
}

const isProduction = process.env.NODE_ENV === 'production';

const dynamicPatterns = [
  toRemotePattern(process.env.NEXT_PUBLIC_BACKEND_URL),
  toRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL)
].filter(Boolean) as RemotePattern[];

const localPatterns: RemotePattern[] = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '8080',
    pathname: '/**'
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '8080',
    pathname: '/**'
  }
];

// Media is served directly from Cloudflare R2's public dev URL
// (pub-<hash>.r2.dev), not proxied through the backend, so it needs its
// own allowlist entry regardless of which bucket is configured.
const r2Patterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: '*.r2.dev',
    pathname: '/**'
  }
];

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: !isProduction,
    remotePatterns: [
      ...localPatterns,
      ...dynamicPatterns,
      ...r2Patterns
    ],
    formats: ['image/webp', 'image/avif']
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);