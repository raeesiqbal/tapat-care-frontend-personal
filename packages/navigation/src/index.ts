export type NavigationEnv = {
  NODE_ENV?: string;
  PUBLIC_APP_ORIGIN?: string;
  NEXT_PUBLIC_PUBLIC_APP_ORIGIN?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export type HeaderReader = {
  get(name: string): string | null;
};

export type OriginRequest = {
  headers?: HeaderReader;
  url?: string;
  nextUrl?: {
    origin?: string;
  };
};

export type PublicAppUrlOptions = {
  env?: NavigationEnv;
  request?: OriginRequest;
  defaultOrigin?: string;
};

export const ONBOARDING_DRAFT_STORAGE_PREFIX = "tapat_onboarding_draft_v1";

const PRODUCTION_PUBLIC_APP_ORIGIN = "https://tapatcare.com";
const LOCAL_PUBLIC_APP_ORIGIN = "http://localhost:3000";

export function normalizeOrigin(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isLocalhostOrigin(origin: string) {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function firstHeaderValue(value?: string | null) {
  return value?.split(",")[0]?.trim() || "";
}

export function resolveForwardedOrigin(request?: OriginRequest) {
  const forwardedHost = firstHeaderValue(request?.headers?.get("x-forwarded-host"));
  if (!forwardedHost) {
    return null;
  }

  const forwardedProto =
    firstHeaderValue(request?.headers?.get("x-forwarded-proto")) || "https";

  return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
}

function resolveRequestOrigin(request?: OriginRequest) {
  const nextOrigin = normalizeOrigin(request?.nextUrl?.origin);
  if (nextOrigin) {
    return nextOrigin;
  }

  return normalizeOrigin(request?.url);
}

export function resolvePublicAppOrigin(options: PublicAppUrlOptions = {}) {
  const env = options.env || {};
  const isProduction = env.NODE_ENV === "production";
  const configuredOrigin = normalizeOrigin(
    env.PUBLIC_APP_ORIGIN ||
      env.NEXT_PUBLIC_PUBLIC_APP_ORIGIN ||
      env.NEXT_PUBLIC_SITE_URL,
  );

  if (
    configuredOrigin &&
    (!isProduction || !isLocalhostOrigin(configuredOrigin))
  ) {
    return configuredOrigin;
  }

  const forwardedOrigin = resolveForwardedOrigin(options.request);
  if (
    forwardedOrigin &&
    (!isProduction || !isLocalhostOrigin(forwardedOrigin))
  ) {
    return forwardedOrigin;
  }

  const requestOrigin = resolveRequestOrigin(options.request);
  if (requestOrigin && (!isProduction || !isLocalhostOrigin(requestOrigin))) {
    return requestOrigin;
  }

  const fallbackOrigin = normalizeOrigin(options.defaultOrigin);
  if (fallbackOrigin && (!isProduction || !isLocalhostOrigin(fallbackOrigin))) {
    return fallbackOrigin;
  }

  return isProduction ? PRODUCTION_PUBLIC_APP_ORIGIN : LOCAL_PUBLIC_APP_ORIGIN;
}

export function buildPublicAppUrl(
  pathname: string,
  options: PublicAppUrlOptions = {},
) {
  return new URL(pathname, resolvePublicAppOrigin(options)).toString();
}

export function buildPublicLoginUrl(
  nextPath: string,
  options: PublicAppUrlOptions = {},
) {
  const url = new URL("/login", resolvePublicAppOrigin(options));
  url.searchParams.set("next", nextPath);
  return url.toString();
}

function getBrowserSessionStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function clearOnboardingDraftSessionStorage(
  storage: Storage | undefined = getBrowserSessionStorage(),
) {
  if (!storage) {
    return 0;
  }

  const keysToRemove: string[] = [];

  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);

      if (key?.startsWith(`${ONBOARDING_DRAFT_STORAGE_PREFIX}:`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch {
    return 0;
  }

  return keysToRemove.length;
}

export function logoutWithOnboardingDraftCleanup(
  logoutHref = "/api/onboarding/logout",
) {
  clearOnboardingDraftSessionStorage();

  if (typeof window !== "undefined") {
    window.location.assign(logoutHref);
  }
}
