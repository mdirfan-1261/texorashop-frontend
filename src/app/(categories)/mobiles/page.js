"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function MobilesPage() {
  return (
    <CategoryStorefront
      categoryName="Mobiles"
      title="Mobiles & Smart Gadgets"
      subtitle="Latest 5G smartphones, flagship devices, chargers, fast cables & durable cases."
      badgeColor="bg-blue-100 text-blue-700"
      bannerGradient="from-blue-500/10 via-cyan-500/5 to-transparent"
      subCategories={[
        "5G Smartphones",
        "iPhones & Flagships",
        "Budget Smartphones",
        "Mobile Covers & Cases",
        "Fast Chargers & Cables",
        "Power Banks",
      ]}
    />
  );
}