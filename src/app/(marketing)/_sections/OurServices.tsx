import { getMarketingServicesPayload } from "@/lib/marketing-services";

import { OurServicesClient } from "@/app/(marketing)/_sections/OurServicesClient";

export async function OurServices() {
  const payload = await getMarketingServicesPayload();
  const initialTab = payload.tabs[0];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tapat Care Services",
    itemListElement: payload.tabs.map((tab, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: tab,
        description: payload.data[tab]?.description || "Home care support service",
      },
    })),
  };

  return (
    <>
      <OurServicesClient tabs={payload.tabs} data={payload.data} initialTab={initialTab} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
