'use client';

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Check, Loader2, Search } from "lucide-react";

/* ================= TYPES ================= */

interface Product {
  _id: string;
  name: string;
}

interface CollectionFormState {
  name: string;
  slug: string;
  description: string;
  products: string[];
  isActive: boolean;
  position: number;
}

interface Props {
  id?: string;
}

/* ================= COMPONENT ================= */

export default function CollectionForm({ id }: Props) {
  const [form, setForm] = useState<CollectionFormState>({
    name: "",
    slug: "",
    description: "",
    products: [],
    isActive: true,
    position: 0,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= AUTO SLUG ================= */
  useEffect(() => {
    if (!id && form.name) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  }, [form.name, id]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchProducts();
    if (id) fetchCollection();
  }, [id]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || res.data || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCollection = async () => {
    try {
      const res = await api.get("/collections/admin/" + id);
      const data = res.data;
      setForm({
        name: data.name ?? "",
        slug: data.slug ?? "",
        description: data.description ?? "",
        products: Array.isArray(data.products)
          ? data.products.map((p: any) => (typeof p === "string" ? p : p._id))
          : [],
        isActive: data.isActive ?? true,
        position: data.position ?? 0,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load collection");
    }
  };

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= SUBMIT ================= */
  const submitHandler = async () => {
    setLoading(true);
    try {
      if (!form.name.trim()) {
        setError("Collection name is required");
        setLoading(false);
        return;
      }

      const slug =
        form.slug ||
        form.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const payload = { ...form, slug };

      if (id) {
        await api.put(`/collections/${id}`, payload);
      } else {
        await api.post("/collections", payload);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
          <div className="bg-[#00567b] px-8 py-6">
            <h1 className="text-2xl font-bold text-white">
              {id ? "Edit Collection" : "Create New Collection"}
            </h1>
            <p className="text-blue-100 mt-1">
              {id
                ? "Update your collection details"
                : "Add a new collection to organize your products"}
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-6">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">
              Collection saved successfully!
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-6">
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Collection Details */}
          <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3">
              Collection Details
            </h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Collection Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Summer Collection"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Slug
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                value={form.slug}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Automatically generated from collection name
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your collection..."
                rows={6}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Active & Position */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                <span className="text-gray-700 font-medium">Active</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Display Position
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Column - Products */}
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <div className="flex items-center justify-between border-b pb-3 mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Select Products
              </h2>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {form.products.length} selected
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto p-2 space-y-2">
              {loadingProducts ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery ? "No products found" : "No products available"}
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <label
                    key={p._id}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      checked={form.products.includes(p._id)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          products: e.target.checked
                            ? [...prev.products, p._id]
                            : prev.products.filter((id) => id !== p._id),
                        }))
                      }
                    />
                    <span className="text-gray-800 font-medium">{p.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            className="w-full bg-[#00567b] hover:bg-[#00445f] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            onClick={submitHandler}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {loading ? "Saving..." : "Save Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}