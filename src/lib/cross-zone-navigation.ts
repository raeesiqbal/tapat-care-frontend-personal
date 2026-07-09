export function isCrossZonePath(path: string) {
  return path === "/dashboard" || path.startsWith("/dashboard/");
}

export function getCrossZoneNavigationHref(path: string) {
  return path;
}
