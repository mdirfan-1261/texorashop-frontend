
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import ProductGallery from "@/components/product-detail/ProductGallery";
import ProductPricing from "@/components/product-detail/ProductPricing";
import ProductVariants from "@/components/product-detail/ProductVariants";
import SimilarProducts from "@/components/product-detail/SimilarProducts";
import ProductHighlights from "@/components/product-detail/ProductHighlights";
import ProductSellerCard from "@/components/product-detail/ProductSellerCard";
import ProductActions from "@/components/product-detail/ProductActions";
import MobileStickyBar from "@/components/product-detail/MobileStickyBar";
import ProductTrustBadges from "@/components/product-detail/ProductTrustBadges";
import ProductReviewsSection from "@/components/product-detail/ProductReviewsSection";
import RelatedProductsSection from "@/components/product-detail/RelatedProductsSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const productIdOrSlug = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const productUrl = `${API_BASE}/products/${encodeURIComponent(
          productIdOrSlug
        )}`;

        console.log("PRODUCT DETAIL URL:", productUrl);

        let res = await fetch(productUrl, {
          cache: "no-store",
        });

        if (!res.ok) {
          const listRes = await fetch(`${API_BASE}/products`, {
            cache: "no-store",
          });

          if (!listRes.ok) {
            throw new Error("Unable to fetch products");
          }

          const listData = await listRes.json();

          // Supports both array response and { products: [] } response
          const all = Array.isArray(listData)
            ? listData
            : Array.isArray(listData.products)
              ? listData.products
              : [];

          const clean = productIdOrSlug.toLowerCase();

          const found = all.find(
            (p) =>
              p._id === productIdOrSlug ||
              p.slug?.toLowerCase() === clean ||
              p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean
          );

          if (!found) {
            throw new Error("Product not found");
          }

          setProduct(found);

          if (found.sizes?.length > 0) {
            setSelectedSize(found.sizes[0]);
          }

          if (found.colors?.length > 0) {
            setSelectedColor(found.colors[0]);
          }

          setActiveImage(found.images?.[0] || found.image || "");
          return;
        }

        const data = await res.json();

        // Supports both direct product and { product: {} } response
        const productData = data.product || data;

        if (!productData || !productData._id) {
          throw new Error("Invalid product response");
        }

        setProduct(productData);

        if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }

        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        setActiveImage(
          productData.images?.[0] || productData.image || ""
        );
      } catch (err) {
        console.error("Product Detail Fetch Error:", err);
        setError("Product not found or unavailable.");
      } finally {
        setLoading(false);
      }
    }

    if (productIdOrSlug) {
      loadProduct();
    }
  }, [productIdOrSlug]);

  /* Loading Skeleton */
  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#f8fafc] dark:bg-slate-950"
        aria-busy="true"
      >
        <div className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-4">
            <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800 sm:w-40" />
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 py-3 sm:px-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12">
          <div className="space-y-2.5 lg:col-span-5">
            <div className="aspect-[4/5] w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 sm:aspect-square" />

            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 lg:col-span-7">
            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-1/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-28 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        <span className="sr-only">Loading Product Details...</span>
      </div>
    );
  }

  /* Product Not Found */
  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800 sm:max-w-sm sm:p-6">
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            Product Not Found
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            The product you are looking for might have been moved or removed.
          </p>

          <Link
            href="/products"
            className="mt-3.5 inline-flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Explore All Products
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          product.image ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        ];

  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-slate-800 dark:bg-slate-950 dark:text-slate-100 md:pb-10">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto whitespace-nowrap px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 sm:px-4 sm:text-xs [scrollbar-width:none]">
          <Link
            href="/"
            className="shrink-0 transition-colors hover:text-orange-600"
          >
            Home
          </Link>

          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />

          <Link
            href={`/products?category=${encodeURIComponent(
              product.category || "All"
            )}`}
            className="shrink-0 capitalize transition-colors hover:text-orange-600"
          >
            {product.category || "Shop"}
          </Link>

          {product.subCategory && (
            <span className="hidden shrink-0 items-center gap-1 sm:inline-flex">
              <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
              <span>{product.subCategory}</span>
            </span>
          )}

          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />

          <span
            aria-current="page"
            className="min-w-0 truncate font-semibold text-slate-800 dark:text-slate-100"
          >
            {product.title}
          </span>
        </div>
      </nav>

      {/* Main Product Content */}
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 md:py-5">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12 lg:gap-6">
          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-3 md:sticky md:top-16 lg:col-span-5">
            <ProductGallery
              images={galleryImages}
              title={product.title}
              discountPercent={discountPercent}
            />

            <SimilarProducts
              currentProductId={product._id}
              images={galleryImages}
              activeImage={activeImage}
              onSelectImage={setActiveImage}
            />

            <div className="hidden md:block">
              <ProductActions
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="min-w-0 space-y-3 lg:col-span-7">
            <ProductPricing
              title={product.title}
              brand={product.brand}
              category={product.category}
              subCategory={product.subCategory}
              price={product.price}
              mrp={product.mrp}
              stock={product.stock}
              rating={product.rating || "4.2"}
              ratingsCount={product.reviews || 109}
              reviewsCount={
                product.reviewsList?.length || product.reviews || 4
              }
            />

            <ProductVariants
              sizes={product.sizes}
              colors={product.colors}
              basePrice={product.price}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            <ProductHighlights
              title={product.title}
              description={product.description}
              specifications={product.specifications || {}}
              category={product.category}
            />

            <ProductSellerCard
              sellerName={product.brand || "Swoz Trader"}
              rating={product.rating || "3.9"}
              ratingsCount={product.ratingsCount || 961}
              productsCount={60}
              category={product.category}
            />

            <ProductTrustBadges />
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="mt-4 md:mt-6">
          <ProductReviewsSection
            productId={product._id}
            productSlug={product.slug}
            rating={product.rating || "4.2"}
            ratingsCount={
              product.reviews || product.ratingsCount || 109
            }
            reviewsCount={
              product.reviews || product.reviewsCount || 4
            }
            initialReviews={product.reviewsList || []}
            initialBreakdown={product.ratingsBreakdown}
          />
        </div>

        {/* Related Products */}
        <div className="mt-4 md:mt-6">
          <RelatedProductsSection
            category={product.category}
            subCategory={product.subCategory}
            currentProductId={product._id}
          />
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <MobileStickyBar
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />
    </div>
  );
}
