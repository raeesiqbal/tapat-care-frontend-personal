const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:8000";

export function joinPublicBackendUrl(pathname: string) {
  const normalizedBase = PUBLIC_API_BASE.replace(/\/$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${normalizedBase}${normalizedPath}`;
}
