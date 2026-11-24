"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function GroceryPage() {
  return (
    <CategoryStorefront
      categoryName="Grocery"
      title="Daily Grocery & Staples"
      subtitle="Pure desi ghee, premium dry fruits, organic spices, snacks & fresh beverages."
      badgeColor="bg-green-100 text-green-700"
      bannerGradient="from-green-500/10 via-emerald-500/5 to-transparent"
      subCategories={[
        "Dry Fruits & Nuts",
        "Cooking Oils & Ghee",
        "Spices & Masalas",
        "Snacks & Biscuits",
        "Tea, Coffee & Beverages",
      ]}
    />
  );
}