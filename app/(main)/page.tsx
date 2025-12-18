"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import api from "@/lib/api";
import { Product } from "@/lib/types/product";
import CategoryNav from "@/components/layout/CategoryNav";
import { Collection } from "@/lib/types/collection";
const ProductSection = lazy(() => import("@/components/home/ProductSection"));
const CategoryBanner = lazy(() => import("@/components/home/CategoryBanner"));
const TopCarousel = lazy(() => import("@/components/home/TopCarousel"));
const FlashDealsBanner = lazy(
  () => import("@/components/home/FlashDealsBanner")
);





export default function HomePageClient() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCollections();
    fetchCategories();
  }, []);

  /* ================= FETCH COLLECTIONS ================= */

  const fetchCollections = async () => {
    try {
      const res = await api.get("/collections");

      const data: Collection[] = res.data.data ?? res.data;

      // ✅ IMPORTANT: sort by position
      const sorted = data
        .filter((c) => c.isActive)
        .sort((a, b) => a.position - b.position);

      setCollections(sorted);
    } catch (err) {
      console.error("Failed to load collections", err);
    }
  };

  /* ================= FETCH CATEGORIES ================= */
<h1>sdaasdasdasd</h1>
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.slice(0, 6));
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <CategoryNav />

      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
        <TopCarousel />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
        <CategoryBanner categories={categories} />
      </Suspense>
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100" />}>
        <FlashDealsBanner />
      </Suspense>

      
      {collections.map((collection) => (
        <Suspense
          key={collection._id}
          fallback={<div className="h-96 animate-pulse bg-gray-100" />}
        >
          <ProductSection
            title={collection.name}
            subtitle={collection.description || ""}
            products={collection.products.filter(
  (p): p is Product => typeof p === "object" && p !== null
)}
            viewAllLink={`/collections/${collection.slug}`}
          />
        </Suspense>
      ))}
    </>
  );
}
