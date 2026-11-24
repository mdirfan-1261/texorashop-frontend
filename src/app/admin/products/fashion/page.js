"use client";

import CategoryStoreManager from "@/components/admin/CategoryStoreManager";

export default function AdminFashionStorePage() {
  return (
    <CategoryStoreManager
      categoryName="Fashion"
      title="Fashion & Ethnic Wear Store"
      subtitle="Manage Women Kurtis, Sarees, Men Shirts, Jeans, Sizes (S-XXL), Discount % and Stock."
      badgeColor="bg-orange-100 text-orange-700"
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