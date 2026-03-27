import {ImageResponse} from 'next/og';

export const size = {
  width: 32,
  height: 32
};

export const contentType = 'image/png';

async function getSiteSettings() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

  if (!apiBase) return null;

  try {
    const response = await fetch(`${apiBase}/api/public/site-settings`, {
      cache: 'no-store'
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

function resolveLogoUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const root =
    process.env.NEXT_PUBLIC_API_BASE_URL
      ?.replace(/\/api$/, '')
      .replace(/\/$/, '') ?? '';

  if (!root) return null;

  return `${root}${url.startsWith('/') ? url : `/${url}`}`;
}

export default async function Icon() {
  const site = await getSiteSettings();
  const logoUrl = resolveLogoUrl(site?.logoUrl);

  if (!logoUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 700,
            borderRadius: 8
          }}
        >
          IM
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        <img
          src={logoUrl}
          alt="Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    ),
    size
  );
}