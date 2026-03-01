import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductDetailContent } from './_components/product-detail-content';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Get compatible products
  const compatibleProducts = product.compatibleWith.length > 0 
    ? await prisma.product.findMany({
        where: { slug: { in: product.compatibleWith } },
        include: { category: true },
        take: 4,
      })
    : [];

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id },
      slug: { notIn: product.compatibleWith },
    },
    include: { category: true },
    take: 4,
  });

  return (
    <ProductDetailContent 
      product={product} 
      compatibleProducts={compatibleProducts}
      relatedProducts={relatedProducts}
    />
  );
}
