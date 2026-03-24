function stripTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '');
}

function stripApiSuffix(value: string) {
  return value.replace(/\/api\/?$/, '');
}

function getServerRoot() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (backendUrl) {
    return stripTrailingSlashes(backendUrl);
  }

  if (apiBaseUrl) {
    return stripApiSuffix(stripTrailingSlashes(apiBaseUrl));
  }

  return '';
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const serverRoot = getServerRoot();

  if (!serverRoot) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${serverRoot}${trimmed}`;
  }

  return `${serverRoot}/${trimmed}`;
}