"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";

const CATEGORY_DATA = [
  {
    name: "All",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80",
    columns: [],
  },
  {
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Women Ethnic",
        items: ["Women Kurtis & Sets", "Sarees & Lehengas", "Ethnic Wear"],
      },
      {
        title: "Women Western",
        items: ["Western Tops & Dresses"],
      },
      {
        title: "Men's Wear",
        items: ["Men Shirts & T-Shirts", "Men Jeans & Trousers"],
      },
    ],
  },
  {
    name: "Mobiles",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Smartphones",
        items: ["5G Smartphones", "iPhones & Flagships", "Budget Smartphones"],
      },
      {
        title: "Accessories",
        items: ["Mobile Covers & Cases", "Fast Chargers & Cables", "Power Banks"],
      },
    ],
  },
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Laptops & Audio",
        items: ["Laptops & MacBooks", "TWS Earbuds & Headphones", "Bluetooth Speakers"],
      },
      {
        title: "Smart Devices",
        items: ["Smartwatches", "Computer Accessories", "Smart TVs & Appliances"],
      },
    ],
  },
  {
    name: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Men Footwear",
        items: ["Men Sports & Running Shoes", "Casual Sneakers", "Formal Shoes"],
      },
      {
        title: "Women & Daily",
        items: ["Women Heels & Flats", "Sandals & Flip-Flops"],
      },
    ],
  },
  {
    name: "Bags",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Women Bags",
        items: ["Women Handbags & Totes", "Sling & Clutch Bags"],
      },
      {
        title: "Travel & Daily",
        items: ["Laptop Backpacks", "Travel Trolleys & Duffles", "Men Wallets & Belts"],
      },
    ],
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Makeup & Face",
        items: ["Makeup & Lipsticks", "Face Wash & Serums", "Sunscreen & Moisturizers"],
      },
      {
        title: "Hair & Perfumes",
        items: ["Hair Oils & Shampoos", "Perfumes & Fragrances"],
      },
    ],
  },
  {
    name: "Kids",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Kids Fashion",
        items: ["Boys Clothing Sets", "Girls Frocks & Dresses"],
      },
      {
        title: "Baby & Toys",
        items: ["Toys & Action Figures", "Baby Care Essentials", "School Bags & Bottles"],
      },
    ],
  },
  {
    name: "Grocery",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&auto=format&fit=crop&q=80",
    columns: [
      {
        title: "Staples & Dry Fruits",
        items: ["Dry Fruits & Nuts", "Cooking Oils & Ghee", "Spices & Masalas"],
      },
      {
        title: "Daily Snacks",
        items: ["Snacks & Biscuits", "Tea, Coffee & Beverages"],
      },
    ],
  },
];

export default function CategoryStrip({ selectedCategory = "All", onSelectCategory }) {
  const [hoveredCat, setHoveredCat] = useState(null);
  const [returnDays, setReturnDays] = useState(7);
  const router = useRouter();

  useEffect(() => {
    function readSettings() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          const s = JSON.parse(saved);
          const days =
            s.returnWindowDays ||
            (s.badge3Label ? Number(s.badge3Label.match(/\d+/)?.[0]) : 7) ||
            7;
          setReturnDays(days);
        }
      } catch (e) {}
    }

    async function fetchSettings() {
      try {
        const res = await fetch("http://localhost:5000/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            const days =
              data.returnWindowDays ||
              (data.badge3Label ? Number(data.badge3Label.match(/\d+/)?.[0]) : 7) ||
              7;
            setReturnDays(days);
            localStorage.setItem("texora_store_settings", JSON.stringify(data));
          }
        }
      } catch (e) {}
    }

    readSettings();
    fetchSettings();

    window.addEventListener("texora_settings_updated", readSettings);
    window.addEventListener("storage", readSettings);
    return () => {
      window.removeEventListener("texora_settings_updated", readSettings);
      window.removeEventListener("storage", readSettings);
    };
  }, []);

    const handleCategoryClick = (catName) => {
    setHoveredCat(null);
    if (catName === "All") {
      if (onSelectCategory) onSelectCategory("All");
      router.push("/"); // 👈 Yahan "/" kar dijiye taaki yeh direct Homepage le jaaye
      return;
    }
    router.push(`/${catName.toLowerCase()}`);
  };

  const handleSubItemClick = (catName, subItem) => {
    setHoveredCat(null);
    router.push(`/${catName.toLowerCase()}?sub=${encodeURIComponent(subItem)}`);
  };

  const activeMegaData = CATEGORY_DATA.find((c) => c.name === hoveredCat);

  return (
    <div
      className="relative z-40 border-b border-gray-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-950"
      onMouseLeave={() => setHoveredCat(null)}
    >
      {/* Strip: compact on mobile, snap-scrolls horizontally */}
      <div className="no-scrollbar mx-auto flex max-w-7xl snap-x items-center gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5">
        {CATEGORY_DATA.map((c) => {
          const isActive = selectedCategory.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.name}
              onClick={() => handleCategoryClick(c.name)}
              onMouseEnter={() => c.columns.length > 0 && setHoveredCat(c.name)}
              aria-current={isActive ? "true" : undefined}
              aria-haspopup={c.columns.length > 0 ? "true" : undefined}
              className={`group relative flex min-w-[58px] shrink-0 cursor-pointer snap-start flex-col items-center gap-1 rounded-lg px-1 pb-1.5 pt-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:min-w-[68px] ${
                isActive
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-700 hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400"
              }`}
            >
              <div
                className={`relative h-11 w-11 overflow-hidden rounded-full border-[1.5px] p-0.5 transition duration-200 motion-reduce:transition-none group-hover:scale-105 sm:h-14 sm:w-14 ${
                  isActive
                    ? "border-orange-500 ring-2 ring-orange-200 dark:ring-orange-500/30"
                    : "border-orange-100 bg-orange-50/40 group-hover:border-orange-400 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width: 640px) 56px, 44px"
                  className="rounded-full object-cover"
                />
              </div>

              <div className="flex items-center gap-0.5 text-[11px] font-semibold leading-none sm:text-xs">
                <span>{c.name}</span>
                {c.columns.length > 0 && (
                  <ChevronDown
                    className={`hidden h-3 w-3 transition-transform duration-200 sm:block ${
                      hoveredCat === c.name ? "rotate-180 text-orange-600" : "text-gray-400"
                    }`}
                  />
                )}
              </div>

              {isActive && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Hover Mega Menu Dropdown (tablet/desktop only) */}
      {activeMegaData && activeMegaData.columns.length > 0 && (
        <div
          onMouseEnter={() => setHoveredCat(activeMegaData.name)}
          onMouseLeave={() => setHoveredCat(null)}
          className="absolute left-0 right-0 top-full hidden border-t border-gray-100 bg-white shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-1 duration-150 dark:border-slate-800 dark:bg-slate-950 md:block"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-4 px-6 py-4 lg:px-8">
            {activeMegaData.columns.map((col, idx) => (
              <div
                key={col.title}
                className={idx % 2 === 1 ? "rounded-xl bg-gray-50/70 p-2.5 dark:bg-slate-900/60" : "p-2.5"}
              >
                <h4 className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  {col.title}
                </h4>
                <ul className="space-y-1">
                  {col.items.map((subItem) => (
                    <li key={subItem}>
                      <button
                        onClick={() => handleSubItemClick(activeMegaData.name, subItem)}
                        className="w-full rounded-md py-0.5 text-left text-xs font-medium text-gray-600 transition hover:translate-x-0.5 hover:font-semibold hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-slate-300 dark:hover:text-orange-400"
                      >
                        {subItem}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 p-4 text-white shadow-sm ring-1 ring-inset ring-white/15">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                  <Sparkles className="h-3 w-3" /> Top Deals in {activeMegaData.name}
                </span>
                <h3 className="mt-1.5 text-base font-extrabold leading-tight">
                  Up to 70% OFF + Extra Free Delivery
                </h3>
                <p className="mt-0.5 text-[11px] text-white/80">
                  Verified sellers • {returnDays}-Day Easy Returns
                </p>
              </div>
              <button
                onClick={() => handleCategoryClick(activeMegaData.name)}
                className="mt-3 w-fit rounded-full bg-white px-3.5 py-1 text-[11px] font-bold text-orange-600 shadow-sm transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600"
              >
                Explore All {activeMegaData.name} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}