import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

function toRemotePattern(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const normalized = trimmed.replace(/\/api\/?$/, '');
    const url = new URL(normalized);

    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/**'
    };
  } catch {
    return null;
  }
}

const dynamicPatterns = [
  toRemotePattern(process.env.NEXT_PUBLIC_BACKEND_URL),
  toRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL)
].filter(Boolean) as Array<{
  protocol: 'http' | 'https';
  hostname: string;
  port: string;
  pathname: string;
}>;

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
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
      },
      ...dynamicPatterns
    ]
  }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);