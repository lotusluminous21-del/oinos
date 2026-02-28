import { getProduct } from '@/lib/shopify/client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RelatedProducts } from '@/components/shop/related-products';
import ProductDisplay from '@/components/product/ProductDisplay';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const product = await getProduct(decodedSlug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: product.seo.title || product.title,
        description: product.seo.description || product.description,
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const product = await getProduct(decodedSlug);

    if (!product) {
        return notFound();
    }

    const variants = product.variants.edges.map(e => e.node);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Macro-background Environment - Deep, fluid, abstract blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[150px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]" />
            </div>

            {/* Main Content Wrapper - Sweeping negative space */}
            <main className="relative z-10 pt-32 pb-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
                {/* Embedded Client Component handling the interactive "Pill" geometry and state */}
                <ProductDisplay product={product} variants={variants} />

                {/* Related Products - Reusing existing but wrapped in heavy padding */}
                <div className="mt-32 pt-16 relative">
                    {/* Visual Separator */}
                    <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <RelatedProducts id={product.id} />
                </div>
            </main>
        </div>
    );
}
