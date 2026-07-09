import "server-only";

import { cookies, headers } from "next/headers";
import { ONBOARDING_ACCESS_TOKEN_COOKIE } from "./constants";

function cookieValueFromHeader(cookieHeader: string, name: string) {
  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!cookie) {
    return "";
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

export async function getOnboardingAccessToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ONBOARDING_ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    return token;
  }

  const headerStore = await headers();
  return cookieValueFromHeader(
    headerStore.get("cookie") || "",
    ONBOARDING_ACCESS_TOKEN_COOKIE,
  );
}
