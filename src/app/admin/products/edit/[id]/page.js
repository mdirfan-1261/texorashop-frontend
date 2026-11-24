"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Save,
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Texora Choice");
  const [category, setCategory] = useState("Fashion");
  const [subCategory, setSubCategory] = useState("General");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [discountPct, setDiscountPct] = useState("0");
  const [stock, setStock] = useState("25");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [sizes, setSizes] = useState([]);
  const [colorsInput, setColorsInput] = useState("");
  const [fabric, setFabric] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [warranty, setWarranty] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [weight, setWeight] = useState("");

  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/products/${productId}`
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Product not found");
        }

        const loadedPrice = Number(data.price || 0);
        const loadedMrp = Number(data.mrp || data.price || 0);
        const initialPct =
          loadedMrp > loadedPrice && loadedPrice > 0
            ? Math.round(((loadedMrp - loadedPrice) / loadedMrp) * 100)
            : 0;

        setTitle(data.title || data.name || "");
        setBrand(data.brand || "Texora Choice");
        setCategory(data.category || "Fashion");
        setSubCategory(data.subCategory || "General");
        setPrice(String(loadedPrice));
        setMrp(String(loadedMrp));
        setDiscountPct(String(initialPct));
        setStock(String(data.stock ?? 25));
        setDescription(data.description || "");
        setImages(Array.isArray(data.images) ? data.images : []);
        setSizes(Array.isArray(data.sizes) ? data.sizes : []);
        setColorsInput(
          Array.isArray(data.colors) ? data.colors.join(", ") : ""
        );
        setFabric(data.specifications?.fabric || "");
        setRam(data.specifications?.ram || "");
        setStorage(data.specifications?.storage || "");
        setWarranty(data.specifications?.warranty || "");
        setAgeGroup(data.specifications?.ageGroup || "");
        setWeight(data.specifications?.weight || "");
        setIsBestSeller(Boolean(data.isBestSeller));
        setIsNewArrival(
          data.isNewArrival !== undefined ? Boolean(data.isNewArrival) : true
        );
        setIsSpecialOffer(Boolean(data.isSpecialOffer));
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Selling Price changes -> auto update Discount %
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

  // MRP changes -> recalculate Selling Price if Discount % is set
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

  // Discount % changes -> calculate Selling Price from MRP
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

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleSize = (sz) => {
    setSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const saved = localStorage.getItem("texora_admin");
      const token = saved ? JSON.parse(saved).token : "";

      // Auto-migrate old base64 photos to Cloudinary (one time per product)
      const finalImages = [];
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:")) {
          const small = await compressImage(await (await fetch(img)).blob());
          finalImages.push(await uploadImage(small));
        } else {
          finalImages.push(img);
        }
      }

      const payload = {
        title: title.trim(),
        brand: brand.trim(),
        category,
        subCategory,
        price: Number(price),
        mrp: Number(mrp || price),
        stock: Number(stock),
        description: description.trim(),
        images: finalImages,
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

      const res = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      router.push(`/admin/products/${category.toLowerCase()}`);
    } catch (err) {
      setError(err.message || "Error updating product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-500">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <Link
            href={`/admin/products/${category.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {category} Store
          </Link>
          <h1 className="mt-1 text-xl font-black text-slate-900">
            Edit Product Rate, Discount %, Stock & Photos
          </h1>
          <p className="text-xs text-slate-500">
            Changes will immediately update across your live TexoraShop store.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-600">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* 1. Category & Title */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Layers className="h-4 w-4 text-orange-500" /> 1. Category & Product
            Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Main Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  setSubCategory(
                    CATEGORY_CONFIG[newCat]?.subCategories[0] || "General"
                  );
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
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
                Subcategory
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
              >
                {!(CATEGORY_CONFIG[category]?.subCategories || []).includes(
                  subCategory
                ) && <option value={subCategory}>{subCategory}</option>}
                {(CATEGORY_CONFIG[category]?.subCategories || []).map((sub) => (
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
              Product Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* 2. MRP, Editable Discount %, Selling Rate & Stock */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Tag className="h-4 w-4 text-orange-500" /> 2. Update MRP, Discount
            % & Selling Rate
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Enter Original MRP and Discount % to auto-calculate Selling Price,
            or type Selling Price directly.
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
                Discount (% OFF) *
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
                Stock Quantity *
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

          <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-3.5 text-xs font-bold text-slate-700">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              New Arrival
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Best Seller
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isSpecialOffer}
                onChange={(e) => setIsSpecialOffer(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Special Offer
            </label>
          </div>
        </div>

        {/* 3. Category Attributes */}
        <div className="rounded-2xl border border-orange-200/80 bg-orange-50/30 p-5 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900">
            3. {category} Specifications
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(category === "Fashion" ||
              category === "Footwear" ||
              category === "Kids") && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Sizes
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

            {category === "Fashion" && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Fabric
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </div>
            )}

            {(category === "Mobiles" || category === "Electronics") && (
              <>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                    RAM
                  </label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                    Storage
                  </label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                    Warranty
                  </label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </>
            )}

            {category === "Kids" && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Age Group
                </label>
                <input
                  type="text"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </div>
            )}

            {(category === "Grocery" || category === "Beauty") && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                  Weight / Pack Size
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase">
                Colors (Comma separated)
              </label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Photos */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
            <ImageIcon className="h-4 w-4 text-orange-500" /> 4. Product Photos
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/40 p-5 text-center transition hover:bg-orange-50">
              <Upload className="h-6 w-6 text-orange-500" />
              <span className="mt-1 text-xs font-bold text-slate-800">
                {uploading
                  ? uploadStatus || "Uploading..."
                  : "Upload New Photo"}
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

            <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase">
                Add Image URL
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div
                  key={`${index}-${String(img).slice(0, 30)}`}
                  className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
                >
                  <img
                    src={img}
                    alt={`Product photo ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-1 right-1 rounded-md bg-rose-600 p-1 text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/products/${category.toLowerCase()}`}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}