import { prisma } from '@/lib/db';
import { CategoriesContent } from './_components/categories-content';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { products: true } }
    }
  });

  return <CategoriesContent categories={categories} />;
}
