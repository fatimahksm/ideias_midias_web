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

function fallbackIcon() {
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

export default async function Icon() {
  const site = await getSiteSettings();
  const logoUrl = resolveLogoUrl(site?.logoUrl);

  // No client logo configured yet: show a neutral branded mark, never the
  // framework default favicon.
  if (!logoUrl) {
    return fallbackIcon();
  }

  // Render the client logo. If the remote image can't be fetched/decoded the
  // ImageResponse render throws; catch it so we fall back to the branded mark
  // instead of letting the browser drop back to the framework default icon.
  try {
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
  } catch {
    return fallbackIcon();
  }
}