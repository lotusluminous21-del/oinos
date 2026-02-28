import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CategoryContent } from './_components/category-content';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const allCategories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  return <CategoryContent category={category} allCategories={allCategories} />;
}
