import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageUpdates: Record<string, string> = {
  'scratch-repair-kit': 'https://m.media-amazon.com/images/I/81a5wpZrX5L.jpg',
  'mini-spray-gun': 'https://www.autobodytoolmart.com/images/prods/popup/devilbiss-802405-startingline-detial-gun.jpg',
  '2k-clear-coat-matte': 'https://m.media-amazon.com/images/I/716awUNGooL.jpg',
  'masking-paper-roll': 'https://m.media-amazon.com/images/I/51l424mAOiL.jpg',
  'sanding-block-kit': 'https://m.media-amazon.com/images/I/811VRuDuBmL.jpg',
  'base-coat-pearl-white': 'https://www.thecoatingstore.com/wp-content/uploads/2023/02/COATS-SlikBase-Super-Bright-White-1-paint-1600x.jpg',
  'base-coat-candy-red': 'https://paintforcars.com/wp-content/uploads/2018/10/Candy-Apple-Red-Auto-Paint-6.jpg',
};

async function main() {
  for (const [slug, image] of Object.entries(imageUpdates)) {
    await prisma.product.update({
      where: { slug },
      data: { image },
    });
    console.log(`Updated image for: ${slug}`);
  }
  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
