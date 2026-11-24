"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function BagsPage() {
  return (
    <CategoryStorefront
      categoryName="Bags"
      title="Bags, Backpacks & Luggage"
      subtitle="Designer handbags, waterproof laptop backpacks, duffles & travel trolleys."
      badgeColor="bg-rose-100 text-rose-700"
      bannerGradient="from-rose-500/10 via-pink-500/5 to-transparent"
      subCategories={[
        "Women Handbags & Totes",
        "Laptop Backpacks",
        "Travel Trolleys & Duffles",
        "Sling & Clutch Bags",
        "Men Wallets & Belts",
      ]}
    />
  );
}