"use client";

import CategoryStoreManager from "@/components/admin/CategoryStoreManager";

export default function AdminMobilesStorePage() {
  return (
    <CategoryStoreManager
      categoryName="Mobiles"
      title="Mobiles & Smartphones Store"
      subtitle="Manage 5G Smartphones, iPhones, Android Phones, RAM/Storage, Discount % and Stock."
      badgeColor="bg-blue-100 text-blue-700"
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