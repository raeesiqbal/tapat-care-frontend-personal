import {
  normalizePersonalDetailsZipLookupResponse,
  type PersonalDetailsZipDetailsPayload,
  type PersonalDetailsZipLookupResult,
} from "@tapat-care/api-contracts";

import { joinPublicBackendUrl } from "@/lib/public-backend-api";

export type ZipDetailsResult = PersonalDetailsZipLookupResult;

export async function lookupZipDetails(
  zip: string,
  signal?: AbortSignal,
): Promise<ZipDetailsResult> {
  const response = await fetch(joinPublicBackendUrl("/api/users/zip-details/"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ zip }),
    signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | PersonalDetailsZipDetailsPayload
    | null;

  return normalizePersonalDetailsZipLookupResponse(payload, response.ok);
}
