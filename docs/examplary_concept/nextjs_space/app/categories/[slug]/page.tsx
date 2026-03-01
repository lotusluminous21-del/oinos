import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CategoryProductsContent } from './_components/category-products-content';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function CategoryProductsPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        orderBy: { name: 'asc' },
      }
    }
  });

  if (!category) {
    notFound();
  }

  const allCategories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  return <CategoryProductsContent category={category} allCategories={allCategories} />;
}
