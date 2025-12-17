'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/search?q=${query}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-xl font-bold mb-4">
        Search results for “{query}”
      </h1>

      {loading && <p>Searching...</p>}

      {!loading && products.length === 0 && (
        <p>No products found</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="border rounded-xl p-3 hover:shadow"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg"
            />
            <h3 className="mt-2 font-medium">{product.name}</h3>
            <p className="text-primary font-bold">₹{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
