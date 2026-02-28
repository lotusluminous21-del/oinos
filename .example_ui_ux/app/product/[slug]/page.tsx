import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductDetail } from './_components/product-detail';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
    include: { category: true },
  });

  // Get compatible products if any
  let compatibleProducts: any[] = [];
  if (product.compatibleWith && product.compatibleWith.length > 0) {
    compatibleProducts = await prisma.product.findMany({
      where: {
        slug: { in: product.compatibleWith },
      },
      include: { category: true },
    });
  }

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      compatibleProducts={compatibleProducts}
    />
  );
}
