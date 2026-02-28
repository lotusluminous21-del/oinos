interface PageProps {
    params: { slug: string };
}

export default function CategoryProductsPage({ params }: PageProps) {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Category: {params.slug}</h1>
            <p>Placeholder for category products listing.</p>
        </div>
    );
}
