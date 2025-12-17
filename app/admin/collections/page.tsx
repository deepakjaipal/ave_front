'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Collection } from "@/lib/types/collection";

/* ================= COMPONENT ================= */

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  /* ================= FETCH ================= */

  const fetchCollections = async () => {
    try {
      const res = await api.get("/collections");
      setCollections(res.data.data ?? res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load collections");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      setLoadingId(id);
      await api.delete(`/collections/${id}`);
      setCollections(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete collection");
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Collections</h1>

        <Link
          href="/admin/collections/new"
          className="bg-[#00567b] hover:bg-[#00445f] text-white px-4 py-2 rounded-lg shadow  transition"
        >
          + Create Collection
        </Link>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100 text-gray-700 font-medium uppercase text-sm">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Display Position</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {collections.map((c) => (
              <tr
                key={c._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-800">{c.name}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-gray-700">{c.products.length}</td>
                <td className="p-3 text-gray-700">{c.position}</td>
                <td className="p-3 space-x-2 flex items-center">
                  <Link
                    href={`/admin/collections/${c._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={loadingId === c._id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {loadingId === c._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}

            {collections.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500 font-medium"
                >
                  No collections found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
