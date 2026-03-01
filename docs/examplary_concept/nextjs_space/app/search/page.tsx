import { prisma } from '@/lib/db';
import { SearchContent } from './_components/search-content';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || '';
  
  let products: any[] = [];
  if (query) {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
      include: { category: true },
    });
  }

  return <SearchContent query={query} products={products} />;
}
