"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function ProductsPage() {
  return (
    <CategoryStorefront
      categoryName="All"
      title="All Products & Categories"
      subtitle="Explore our entire catalog across fashion, mobiles, electronics, footwear, beauty and more."
      badgeColor="bg-orange-100 text-orange-700"
      bannerGradient="from-orange-500/10 via-amber-500/5 to-transparent"
      subCategories={[
        "Fashion",
        "Mobiles",
        "Electronics",
        "Footwear",
        "Bags",
        "Beauty",
        "Kids",
        "Grocery",
      ]}
    />
  );
}
