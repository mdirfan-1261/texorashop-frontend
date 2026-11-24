"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Tag,
  Layers,
  Percent,
  Image as ImageIcon,
} from "lucide-react";
import { compressImage } from "@/lib/compressImage";
import { uploadImage } from "@/lib/uploadImage";

const CATEGORY_CONFIG = {
  Fashion: {
    subCategories: [
      "Women Kurtis & Sets",
      "Sarees & Lehengas",
      "Western Tops & Dresses",
      "Men Shirts & T-Shirts",
      "Men Jeans & Trousers",
      "Ethnic Wear",
    ],
    defaultSizes: ["S", "M", "L", "XL", "XXL"],
  },
  Mobiles: {
    subCategories: [
      "5G Smartphones",
      "iPhones & Flagships",
      "Budget Smartphones",
      "Mobile Covers & Cases",
      "Fast Chargers & Cables",
      "Power Banks",
    ],
    defaultSizes: [],
  },
  Electronics: {
    subCategories: [
      "Laptops & MacBooks",
      "TWS Earbuds & Headphones",
      "Smartwatches",
      "Bluetooth Speakers",
      "Computer Accessories",
      "Smart TVs & Appliances",
    ],
    defaultSizes: [],
  },
  Footwear: {
    subCategories: [
      "Men Sports & Running Shoes",
      "Casual Sneakers",
      "Women Heels & Flats",
      "Formal Shoes",
      "Sandals & Flip-Flops",
    ],
    defaultSizes: ["6", "7", "8", "9", "10"],
  },
  Bags: {
    subCategories: [
      "Women Handbags & Totes",
      "Laptop Backpacks",
      "Travel Trolleys & Duffles",
      "Sling & Clutch Bags",
      "Men Wallets & Belts",
    ],
    defaultSizes: [],
  },
  Beauty: {
    subCategories: [
      "Makeup & Lipsticks",
      "Face Wash & Serums",
      "Sunscreen & Moisturizers",
      "Hair Oils & Shampoos",
      "Perfumes & Fragrances",
    ],
    defaultSizes: [],
  },
  Kids: {
    subCategories: [
      "Boys Clothing Sets",
      "Girls Frocks & Dresses",
      "Toys & Action Figures",
      "Baby Care Essentials",
      "School Bags & Bottles",
    ],
    defaultSizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-10 Yrs"],
  },
  Grocery: {
    subCategories: [
      "Dry Fruits & Nuts",
      "Cooking Oils & Ghee",
      "Spices & Masalas",
      "Snacks & Biscuits",
      "Tea, Coffee & Beverages",
    ],
    defaultSizes: [],
  },
};

function AddProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "Fashion";

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Texora Choice");
  const [category, setCategory] = useState(
    CATEGORY_CONFIG[initialCat] ? initialCat : "Fashion"
  );
  const [subCategory, setSubCategory] = useState(
    CATEGORY_CONFIG[initialCat]?.subCategories[0] || "Women Kurtis & Sets"
  );
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [discountPct, setDiscountPct] = useState("0");
  const [stock, setStock] = useState("30");
  const [description, setDescription] = useState("");

  // Images (Cloudinary URLs only)
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Category-specific attributes
  const [sizes, setSizes] = useState(
    CATEGORY_CONFIG[initialCat]?.defaultSizes || []
  );
  const [colorsInput, setColorsInput] = useState("Black, Orange, Blue");
  const [fabric, setFabric] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [warranty, setWarranty] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [weight, setWeight] = useState("");

  // Storefront flags
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const config = CATEGORY_CONFIG[category];
    if (config) {
      setSubCategory(config.subCategories[0]);
      setSizes(config.defaultSizes);
    }
  }, [category]);

  // Selling price changed -> update discount %
  const handlePriceChange = (val) => {
    setPrice(val);
    const numPrice = Number(val);
    const numMrp = Number(mrp);
    if (numMrp > numPrice && numPrice > 0) {
      setDiscountPct(String(Math.round(((numMrp - numPrice) / numMrp) * 100)));
    } else {
      setDiscountPct("0");
    }
  };

  // MRP changed -> if discount % is set, recalculate selling price
  const handleMrpChange = (val) => {
    setMrp(val);
    const numMrp = Number(val);
    const numPrice = Number(price);
    const numPct = Number(discountPct);

    if (numMrp > 0 && numPct > 0 && numPct < 100) {
      setPrice(String(Math.round(numMrp - (numMrp * numPct) / 100)));
    } else if (numMrp > numPrice && numPrice > 0) {
      setDiscountPct(String(Math.round(((numMrp - numPrice) / numMrp) * 100)));
    }
  };

  // Discount % changed -> calculate selling price from MRP (or MRP from price)
  const handleDiscountChange = (val) => {
    const cleanPct = Math.min(95, Math.max(0, Number(val || 0)));
    setDiscountPct(val === "" ? "" : String(cleanPct));

    const numMrp = Number(mrp);
    const numPrice = Number(price);

    if (numMrp > 0) {
      setPrice(
        String(Math.max(1, Math.round(numMrp - (numMrp * cleanPct) / 100)))
      );
    } else if (numPrice > 0 && cleanPct > 0 && cleanPct < 95) {
      setMrp(String(Math.round(numPrice / (1 - cleanPct / 100))));
    }
  };

  // Compress (~100 KB) -> upload to Cloudinary -> keep only the URL
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadStatus(`Uploading photo ${i + 1} of ${files.length}...`);
        const small = await compressImage(files[i]);
        const url = await uploadImage(small);
        setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      setError(err.message || "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleSize = (sizeVal) => {
    setSizes((prev) =>
      prev.includes(sizeVal)
        ? prev.filter((s) => s !== sizeVal)
        : [...prev, sizeVal]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !price) {
      setError("Please enter Product Title and Selling Price.");
      return;
    }

    setSubmitting(true);
    try {
      const saved = localStorage.getItem("texora_admin");
      const token = saved ? JSON.parse(saved).token : "";

      const payload = {
        title: title.trim(),
        brand: brand.trim() || "Texora Choice",
        category,
        subCategory,
        price: Number(price),
        mrp: Number(mrp || Math.round(Number(price) * 1.35)),
        stock: Number(stock || 25),
        description:
          description.trim() ||
          `Buy ${title.trim()} online at best price on TexoraShop.`,
        images:
          images.length > 0
            ? images
            : [
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
              ],
        sizes,
        colors: colorsInput
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        specifications: {
          fabric,
          ram,
          storage,
          warranty,
          ageGroup,
          weight,
        },
        isBestSeller,
        isNewArrival,
        isSpecialOffer,
      };

      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      router.push(`/admin/products/${category.toLowerCase()}`);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Categories Hub
          </Link>
          <h1 className="mt-1 text-xl font-black text-slate-900">
            Add New Product to {category} Store
          </h1>
          <p className="text-xs text-slate-500">
            Upload photos, set selling price & MRP, and fill {category}-specific
            details.
          </p>
        </div>

        
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Category & Basic Information */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Layers className="h-4 w-4 text-orange-500" /> 1. Select Store
            Category & Product Title
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Main Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
              >
                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} Store
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Subcategory *
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
              >
                {CATEGORY_CONFIG[category]?.subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Texora Choice, Samsung, Nike"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${category} product full title...`}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
              Product Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write key highlights, material, quality & package details..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* 2. MRP, Discount %, Selling Price & Stock */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Tag className="h-4 w-4 text-orange-500" /> 2. MRP, Discount % &
            Selling Rate
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Enter MRP and Discount % to auto-calculate Selling Price, or type
            Selling Price directly.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Original MRP (₹) *
              </label>
              <input
                type="number"
                min="1"
                value={mrp}
                onChange={(e) => handleMrpChange(e.target.value)}
                placeholder="e.g. 1000"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-emerald-700 uppercase">
                Discount (% OFF)
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="0"
                  max="95"
                  value={discountPct}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50/60 py-2 pr-8 pl-3 text-xs font-black text-emerald-700 outline-none focus:border-emerald-600 focus:bg-white"
                />
                <Percent className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-orange-600 uppercase">
                Final Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="e.g. 700"
                className="mt-1 w-full rounded-xl border border-orange-300 bg-orange-50/40 px-3 py-2 text-xs font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Available Stock *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Quick 1-Click Discount Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2.5">
            <span className="text-[11px] font-bold text-slate-500">
              Quick Apply Discount:
            </span>
            {[10, 20, 30, 40, 50, 60, 70].map((pct) => (
              <button
                type="button"
                key={pct}
                onClick={() => handleDiscountChange(String(pct))}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                  Number(discountPct) === pct
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                {pct}% OFF
              </button>
            ))}
            {Number(mrp) > Number(price) && Number(price) > 0 && (
              <span className="ml-auto text-[11px] font-bold text-emerald-700">
                Customer Saves: ₹
                {(Number(mrp) - Number(price)).toLocaleString("en-IN")} (
                {discountPct || 0}% OFF)
              </span>
            )}
          </div>

          {/* Storefront Section Checkboxes */}
          <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-3.5 text-xs font-bold text-slate-700">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Show in New Arrivals
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Mark as Best Seller
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isSpecialOffer}
                onChange={(e) => setIsSpecialOffer(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Include in Special Offers
            </label>
          </div>
        </div>

        {/* 3. Category-Specific Dynamic Fields */}
        <div className="rounded-2xl border border-orange-200/80 bg-orange-50/30 p-5 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900">
            3. {category}-Specific Attributes
          </h2>
          <p className="text-xs text-slate-500">
            Custom specifications tailored for the {category} category
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Sizes for Fashion, Footwear, Kids */}
            {(category === "Fashion" ||
              category === "Footwear" ||
              category === "Kids") && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Available Sizes (Click to toggle)
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {(
                    CATEGORY_CONFIG[category]?.defaultSizes || [
                      "S",
                      "M",
                      "L",
                      "XL",
                    ]
                  ).map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${
                        sizes.includes(sz)
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fabric for Fashion */}
            {category === "Fashion" && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Pure Cotton, Banarasi Silk, Rayon"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* RAM, Storage, Warranty for Mobiles & Electronics */}
            {(category === "Mobiles" || category === "Electronics") && (
              <>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                    RAM / Memory
                  </label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    placeholder="e.g. 8 GB RAM / 16 GB Unified"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                    Internal Storage
                  </label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="e.g. 128 GB / 256 GB SSD"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                    Brand Warranty
                  </label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year Manufacturer Warranty"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>
              </>
            )}

            {/* Age Group for Kids */}
            {category === "Kids" && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Recommended Age Group
                </label>
                <input
                  type="text"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  placeholder="e.g. 3 to 8 Years"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Weight / Volume for Grocery & Beauty */}
            {(category === "Grocery" || category === "Beauty") && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Net Weight / Volume Pack
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 500g, 1 Kg Pack, 200 ml"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Colors for all categories */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Available Colors (Comma separated)
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                placeholder="e.g. Black, Orange, Royal Blue"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Product Photos Upload */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <ImageIcon className="h-4 w-4 text-orange-500" /> 4. Product Photos
            (Upload from Computer or Paste URL)
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* File Upload Box */}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/40 p-5 text-center transition hover:bg-orange-50">
              <Upload className="h-6 w-6 text-orange-500" />
              <span className="mt-1.5 text-xs font-bold text-slate-800">
                {uploading
                  ? uploadStatus || "Uploading..."
                  : "Click to Upload Product Photo"}
              </span>
              <span className="text-[10px] text-slate-500">
                Auto compressed to ~100 KB and stored on Cloudinary CDN
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Direct Image URL Input */}
            <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase">
                Or Paste Direct Image URL
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Preview Gallery */}
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
                >
                  <img
                    src={img}
                    alt={`Product preview ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-1 right-1 rounded-md bg-rose-600 p-1 text-white opacity-90 hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? "Publishing Product..." : `Publish to ${category} Store`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddNewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-bold text-slate-400">
          Loading Product Creator...
        </div>
      }
    >
      <AddProductFormContent />
    </Suspense>
  );
}