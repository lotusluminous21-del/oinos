
import { getProducts } from '@/lib/shopify/client';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
    title: 'Products',
    description: 'All products',
};

export default async function ProductsPage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const { q: searchValue } = (searchParams || {}) as { [key: string]: string };
    const products = await getProducts({ query: searchValue });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    {searchValue ? `Search: ${searchValue}` : 'All Products'}
                </h1>
                <form action="/products" method="get" className="flex gap-2">
                    <input
                        type="text"
                        name="q"
                        placeholder="Search products..."
                        defaultValue={searchValue}
                        className="border rounded px-3 py-2"
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded">Search</button>
                </form>
            </div>

            {!products.length ? (
                <div>No products found.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.handle}`}
                            className="group block border p-4 rounded-lg hover:borderColor-neutral-400 transition-colors"
                        >
                            <div className="aspect-[4/3] sm:aspect-square relative overflow-hidden bg-white/50 rounded-md mb-4 flex items-center justify-center p-4">
                                {product.featuredImage ? (
                                    <Image
                                        src={product.featuredImage.url}
                                        alt={product.featuredImage.altText || product.title}
                                        fill
                                        className="object-contain group-hover:scale-105 transition-transform mix-blend-multiply"
                                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{product.title}</h3>
                            <div className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                                {product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
