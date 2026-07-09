import type {
  ApiEnvelope,
  ServiceCategoryDto,
  SkillsAvailabilityServiceOption,
} from "@tapat-care/api-contracts";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:8000";

function getBackendUrl(pathname: string) {
  const normalizedBase = API_BASE.replace(/\/$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${normalizedBase}${normalizedPath}`;
}

async function fetchApiList<TItem>(pathname: string, errorMessage: string) {
  const response = await fetch(getBackendUrl(pathname), { cache: "no-store" });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const result = (await response.json()) as ApiEnvelope<TItem[]>;

  return result.data ?? [];
}

function addCategoryNamesToServices(
  services: SkillsAvailabilityServiceOption[],
  categories: ServiceCategoryDto[],
) {
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return services.map((service) => ({
    ...service,
    service_category_name:
      service.service_category_name ||
      (service.service_category !== undefined
        ? categoryNameById.get(service.service_category)
        : undefined),
  }));
}

export async function getServices() {
  const [services, categories] = await Promise.all([
    fetchApiList<SkillsAvailabilityServiceOption>(
      "/api/services/services/",
      "Failed to fetch services",
    ),
    fetchApiList<ServiceCategoryDto>(
      "/api/services/categories/",
      "Failed to fetch service categories",
    ),
  ]);

  return addCategoryNamesToServices(services, categories);
}
