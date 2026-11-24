"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function ElectronicsPage() {
  return (
    <CategoryStorefront
      categoryName="Electronics"
      title="Electronics & Audio"
      subtitle="High-performance laptops, noise-cancelling earbuds, smartwatches & home audio."
      badgeColor="bg-purple-100 text-purple-700"
      bannerGradient="from-purple-500/10 via-indigo-500/5 to-transparent"
      subCategories={[
        "Laptops & MacBooks",
        "TWS Earbuds & Headphones",
        "Smartwatches",
        "Bluetooth Speakers",
        "Computer Accessories",
        "Smart TVs & Appliances",
      ]}
    />
  );
}