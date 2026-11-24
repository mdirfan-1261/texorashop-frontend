"use client";

import CategoryStorefront from "@/components/storefront/CategoryStorefront";

export default function FootwearPage() {
  return (
    <CategoryStorefront
      categoryName="Footwear"
      title="Footwear & Sneakers"
      subtitle="Comfortable running shoes, casual sneakers, formal leather shoes, heels & flats."
      badgeColor="bg-amber-100 text-amber-700"
      bannerGradient="from-amber-500/10 via-orange-500/5 to-transparent"
      subCategories={[
        "Men Sports & Running Shoes",
        "Casual Sneakers",
        "Women Heels & Flats",
        "Formal Shoes",
        "Sandals & Flip-Flops",
      ]}
    />
  );
}