"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function KidsPage() {
  return (
    <CategoryStorefront
      categoryName="Kids"
      title="Kids & Baby Essentials"
      subtitle="Cute kids apparel, fun toys, action figures, baby skincare & school essentials."
      badgeColor="bg-yellow-100 text-yellow-800"
      bannerGradient="from-yellow-500/10 via-amber-500/5 to-transparent"
      subCategories={[
        "Boys Clothing Sets",
        "Girls Frocks & Dresses",
        "Toys & Action Figures",
        "Baby Care Essentials",
        "School Bags & Bottles",
      ]}
    />
  );
}