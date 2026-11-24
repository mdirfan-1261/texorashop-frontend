"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function BeautyPage() {
  return (
    <CategoryStorefront
      categoryName="Beauty"
      title="Beauty & Skincare"
      subtitle="Premium makeup essentials, glowing skin serums, sunscreens & authentic fragrances."
      badgeColor="bg-emerald-100 text-emerald-700"
      bannerGradient="from-emerald-500/10 via-teal-500/5 to-transparent"
      subCategories={[
        "Makeup & Lipsticks",
        "Face Wash & Serums",
        "Sunscreen & Moisturizers",
        "Hair Oils & Shampoos",
        "Perfumes & Fragrances",
      ]}
    />
  );
}