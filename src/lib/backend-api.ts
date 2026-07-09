import "server-only";

export type BackendRequestOptions = RequestInit & {
  authToken?: string;
};

export class BackendApiError extends Error {
  status: number;
  payload: unknown;
  code?: string;

  constructor(
    message: string,
    options: { status: number; payload: unknown; code?: string },
  ) {
    super(message);
    this.name = "BackendApiError";
    this.status = options.status;
    this.payload = options.payload;
    this.code = options.code;
  }
}

const API_BASE =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
  "http://localhost:8000";

function joinUrl(pathname: string): string {
  const normalizedBase = API_BASE.replace(/\/$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedBase}${normalizedPath}`;
}

function extractFirstErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  if (typeof record.detail === "string" && record.detail.trim()) {
    return record.detail;
  }

  for (const [field, value] of Object.entries(record)) {
    if (typeof value === "string" && value.trim()) {
      return `${field}: ${value}`;
    }

    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
      return `${field}: ${value[0]}`;
    }

    const nested = extractFirstErrorMessage(value);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function extractErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.code === "string") {
    return record.code;
  }
  if (typeof record.error === "string") {
    return record.error;
  }
  return extractErrorCode(record.data);
}

export async function backendRequest<TPayload>(
  pathname: string,
  options: BackendRequestOptions = {},
): Promise<TPayload> {
  const { authToken, headers, ...requestOptions } = options;
  const response = await fetch(joinUrl(pathname), {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      extractFirstErrorMessage(payload) ||
      `Request failed with status ${response.status}`;
    throw new BackendApiError(message, {
      status: response.status,
      payload,
      code: extractErrorCode(payload),
    });
  }

  return payload as TPayload;
}
