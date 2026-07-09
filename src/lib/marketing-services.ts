import "server-only";

export type MarketingServiceFeature = {
  icon: string;
  text: string;
};

export type MarketingServiceContent = {
  title: string;
  description: string;
  image: string;
  features: MarketingServiceFeature[];
};

export type MarketingServicesPayload = {
  tabs: string[];
  data: Record<string, MarketingServiceContent>;
};

type ApiListEnvelope = {
  data?: unknown;
  results?: unknown;
};

const API_BASE =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
  "http://127.0.0.1:8000";

const DEFAULT_IMAGE = "/assets/images/service.png";
const DEFAULT_FEATURE_ICON = "/assets/icons/tick.svg";
const FALLBACK_TAB = "Home Assistance";

function joinUrl(pathname: string): string {
  const normalizedBase = API_BASE.replace(/\/$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedBase}${normalizedPath}`;
}

function toRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object"
  );
}

function extractList(payload: unknown): Record<string, unknown>[] {
  const direct = toRecords(payload);
  if (direct.length > 0) {
    return direct;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const envelope = payload as ApiListEnvelope;
  const fromData = toRecords(envelope.data);
  if (fromData.length > 0) {
    return fromData;
  }

  const fromResults = toRecords(envelope.results);
  if (fromResults.length > 0) {
    return fromResults;
  }

  if (envelope.data && typeof envelope.data === "object") {
    const nested = envelope.data as ApiListEnvelope;
    const nestedData = toRecords(nested.data);
    if (nestedData.length > 0) {
      return nestedData;
    }

    const nestedResults = toRecords(nested.results);
    if (nestedResults.length > 0) {
      return nestedResults;
    }
  }

  return [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function fetchList(pathname: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(joinUrl(pathname), {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 3600,
      tags: ["services"],
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${pathname} (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  return extractList(payload);
}

export async function getMarketingServicesPayload(): Promise<MarketingServicesPayload> {
  try {
    const [categories, services] = await Promise.all([
      fetchList("/api/services/categories/"),
      fetchList("/api/services/services/"),
    ]);

    const categoryData = new Map<number, { name: string; description: string }>();
    for (const category of categories) {
      const id = asNumber(category.id);
      const name = asString(category.name);
      const description = asString(category.description);
      if (id !== null && name) {
        categoryData.set(id, { name, description });
      }
    }

    const grouped = new Map<
      string,
      { description: string; features: { text: string; icon: string }[] }
    >();

    for (const service of services) {
      const serviceName = asString(service.name);
      if (!serviceName) {
        continue;
      }

      const categoryNameFromService = asString(service.service_category_name);
      const categoryId = asNumber(service.service_category);
      const categoryFromId = categoryId !== null ? categoryData.get(categoryId) : undefined;
      const categoryName =
        categoryNameFromService || categoryFromId?.name || "Other services";

      const description = categoryFromId?.description || asString(service.description);
      const icon = asString(service.icon) || DEFAULT_FEATURE_ICON;
      const current = grouped.get(categoryName);

      if (!current) {
        grouped.set(categoryName, {
          description,
          features: [{ text: serviceName, icon }],
        });
        continue;
      }

      if (!current.description && description) {
        current.description = description;
      }
      current.features.push({ text: serviceName, icon });
    }

    if (grouped.size === 0) {
      return {
        tabs: [FALLBACK_TAB],
        data: {
          [FALLBACK_TAB]: {
            title: "Care services built around sincerity and trust",
            description:
              "Professional caregivers provide support tailored to your day-to-day needs.",
            image: DEFAULT_IMAGE,
            features: [
              {
                icon: DEFAULT_FEATURE_ICON,
                text: "Compassionate in-home support",
              },
            ],
          },
        },
      };
    }

    const tabs = Array.from(grouped.keys());
    const data: Record<string, MarketingServiceContent> = {};

    tabs.forEach((tab, index) => {
      const group = grouped.get(tab);
      const features = group?.features || [];

      data[tab] = {
        title: `${tab} Services`,
        description:
          group?.description ||
          "Personalized support designed for safety, dignity, and day-to-day comfort.",
        image: index === 0 ? "/assets/images/caregiver1.png" : DEFAULT_IMAGE,
        features:
          features.length > 0
            ? features
            : [{ icon: DEFAULT_FEATURE_ICON, text: `${tab} support plan` }],
      };
    });

    return { tabs, data };
  } catch {
    return {
      tabs: [FALLBACK_TAB],
      data: {
        [FALLBACK_TAB]: {
          title: "Care services built around sincerity and trust",
          description:
            "Professional caregivers provide support tailored to your day-to-day needs.",
          image: DEFAULT_IMAGE,
          features: [
            {
              icon: DEFAULT_FEATURE_ICON,
              text: "Compassionate in-home support",
            },
          ],
        },
      },
    };
  }
}
