"use client";

import React, { use } from "react";
import CategoryStorefront from "@/components/storefront/CategoryStorefront";

const CATEGORY_META = {
  fashion: {
    categoryName: "Fashion",
    title: "Fashion & Apparel Store",
    subtitle: "Discover trending ethnic wear, kurtis, sarees, menswear, jeans and western styles.",
    badgeColor: "bg-orange-100 text-orange-700",
    bannerGradient: "from-orange-500/10 via-amber-500/5 to-transparent",
    subCategories: [
      "Women Kurtis & Sets",
      "Sarees & Lehengas",
      "Ethnic Wear",
      "Western Tops & Dresses",
      "Men Shirts & T-Shirts",
      "Men Jeans & Trousers",
    ],
  },
  mobiles: {
    categoryName: "Mobiles",
    title: "Mobiles & Smart Devices",
    subtitle: "Shop top 5G smartphones, iPhones, flagship devices, chargers, and mobile covers.",
    badgeColor: "bg-blue-100 text-blue-700",
    bannerGradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    subCategories: [
      "5G Smartphones",
      "iPhones & Flagships",
      "Budget Smartphones",
      "Mobile Covers & Cases",
      "Fast Chargers & Cables",
      "Power Banks",
    ],
  },
  electronics: {
    categoryName: "Electronics",
    title: "Electronics & Audio Hub",
    subtitle: "High performance laptops, smartwatches, true wireless earbuds, speakers, and gadgets.",
    badgeColor: "bg-indigo-100 text-indigo-700",
    bannerGradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    subCategories: [
      "Laptops & MacBooks",
      "TWS Earbuds & Headphones",
      "Bluetooth Speakers",
      "Smartwatches",
      "Computer Accessories",
      "Smart TVs & Appliances",
    ],
  },
  footwear: {
    categoryName: "Footwear",
    title: "Footwear & Shoes Collection",
    subtitle: "Sneakers, running sports shoes, formal shoes, ethnic sandals, heels, and daily slippers.",
    badgeColor: "bg-emerald-100 text-emerald-700",
    bannerGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    subCategories: [
      "Men Sports & Running Shoes",
      "Casual Sneakers",
      "Formal Shoes",
      "Women Heels & Flats",
      "Sandals & Flip-Flops",
    ],
  },
  bags: {
    categoryName: "Bags",
    title: "Bags & Travel Luggage",
    subtitle: "Trendy women handbags, sling bags, laptop backpacks, travel trolley duffles, and wallets.",
    badgeColor: "bg-amber-100 text-amber-800",
    bannerGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    subCategories: [
      "Women Handbags & Totes",
      "Sling & Clutch Bags",
      "Laptop Backpacks",
      "Travel Trolleys & Duffles",
      "Men Wallets & Belts",
    ],
  },
  beauty: {
    categoryName: "Beauty",
    title: "Beauty & Personal Care",
    subtitle: "Top skincare serums, makeup kits, lipsticks, hair care oils, perfumes, and fragrances.",
    badgeColor: "bg-pink-100 text-pink-700",
    bannerGradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    subCategories: [
      "Makeup & Lipsticks",
      "Face Wash & Serums",
      "Sunscreen & Moisturizers",
      "Hair Oils & Shampoos",
      "Perfumes & Fragrances",
    ],
  },
  kids: {
    categoryName: "Kids",
    title: "Kids Fashion & Baby Toys",
    subtitle: "Cute kids apparel sets, baby care essentials, action figures, toys, and school accessories.",
    badgeColor: "bg-purple-100 text-purple-700",
    bannerGradient: "from-purple-500/10 via-pink-500/5 to-transparent",
    subCategories: [
      "Boys Clothing Sets",
      "Girls Frocks & Dresses",
      "Toys & Action Figures",
      "Baby Care Essentials",
      "School Bags & Bottles",
    ],
  },
  grocery: {
    categoryName: "Grocery",
    title: "Daily Grocery & Staples",
    subtitle: "Premium dry fruits, cooking oils, organic spices, daily snacks, tea, and beverages.",
    badgeColor: "bg-lime-100 text-lime-800",
    bannerGradient: "from-lime-500/10 via-emerald-500/5 to-transparent",
    subCategories: [
      "Dry Fruits & Nuts",
      "Cooking Oils & Ghee",
      "Spices & Masalas",
      "Snacks & Biscuits",
      "Tea, Coffee & Beverages",
    ],
  },
};

export default function CategoryDynamicPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const rawCategory = params?.category ? decodeURIComponent(params.category) : "Fashion";
  const cleanCat = rawCategory.toLowerCase().trim();

  const meta = CATEGORY_META[cleanCat] || {
    categoryName: rawCategory ? rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1) : "Collection",
    title: `${rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1)} Collection`,
    subtitle: `Explore trending products and verified deals in ${rawCategory}.`,
    badgeColor: "bg-orange-100 text-orange-700",
    bannerGradient: "from-orange-500/10 via-amber-500/5 to-transparent",
    subCategories: [],
  };

  return (
    <CategoryStorefront
      categoryName={meta.categoryName}
      title={meta.title}
      subtitle={meta.subtitle}
      badgeColor={meta.badgeColor}
      bannerGradient={meta.bannerGradient}
      subCategories={meta.subCategories}
    />
  );
}
