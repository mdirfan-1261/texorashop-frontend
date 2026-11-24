"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function FashionPage() {
  return (
    <CategoryStorefront
      categoryName="Fashion"
      title="Fashion & Ethnic Wear"
      subtitle="Discover trending Kurtis, Sarees, Lehengas, Shirts, Trousers & Designer collections."
      badgeColor="bg-pink-100 text-pink-700"
      bannerGradient="from-pink-500/10 via-rose-500/5 to-transparent"
      subCategories={[
        "Women Kurtis & Sets",
        "Sarees & Lehengas",
        "Western Tops & Dresses",
        "Men Shirts & T-Shirts",
        "Men Jeans & Trousers",
        "Ethnic Wear",
      ]}
    />
  );
}