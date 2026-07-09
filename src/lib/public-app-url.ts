import {
  buildPublicAppUrl as buildSharedPublicAppUrl,
  buildPublicLoginUrl as buildSharedPublicLoginUrl,
  type OriginRequest,
} from "@tapat-care/navigation";

const publicAppEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_APP_ORIGIN: process.env.PUBLIC_APP_ORIGIN,
  NEXT_PUBLIC_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_PUBLIC_APP_ORIGIN,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

export function buildPublicAppUrl(
  pathname: string,
  request?: OriginRequest,
) {
  return buildSharedPublicAppUrl(pathname, {
    env: publicAppEnv,
    request,
  });
}

export function buildPublicLoginUrl(
  nextPath: string,
  request?: OriginRequest,
) {
  return buildSharedPublicLoginUrl(nextPath, {
    env: publicAppEnv,
    request,
  });
}
