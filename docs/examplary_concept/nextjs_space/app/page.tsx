import { prisma } from '@/lib/db';
import { HomeContent } from './_components/home-content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    take: 6,
    include: {
      _count: { select: { products: true } }
    }
  });

  const featuredProducts = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  return <HomeContent categories={categories} featuredProducts={featuredProducts} />;
}
