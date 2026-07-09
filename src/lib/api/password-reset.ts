import "server-only";

import { backendRequest } from "../backend-api";

export function requestPasswordReset(email: string) {
  return backendRequest<{ message: string }>("/api/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
}

export function validateResetToken(token: string) {
  return backendRequest<{ valid: boolean }>(
    "/api/password-reset/validate_token/",
    {
      method: "POST",
      body: JSON.stringify({ token }),
      cache: "no-store",
    },
  );
}

export function confirmPasswordReset(token: string, password: string) {
  return backendRequest<{ message: string }>("/api/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify({
      token,
      password,
    }),
    cache: "no-store",
  });
}
