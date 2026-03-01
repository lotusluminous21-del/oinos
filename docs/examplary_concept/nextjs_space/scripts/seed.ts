import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Primers', slug: 'primers', description: 'Surface preparation primers for metal, plastic and universal use', icon: 'spray-can', order: 1 },
  { name: 'Base Coats', slug: 'base-coats', description: 'Color base coats in metallic and solid finishes', icon: 'paintbrush', order: 2 },
  { name: 'Clear Coats', slug: 'clear-coats', description: 'Protective clear finishes in 1K and 2K formulations', icon: 'sparkles', order: 3 },
  { name: 'Abrasives', slug: 'abrasives', description: 'Sandpaper and sanding materials for surface prep', icon: 'layers', order: 4 },
  { name: 'Masking', slug: 'masking', description: 'Masking tape and protective materials', icon: 'scissors', order: 5 },
  { name: 'Equipment', slug: 'equipment', description: 'Spray guns and professional application tools', icon: 'tool', order: 6 },
  { name: 'Additives', slug: 'additives', description: 'Thinners, hardeners and other additives', icon: 'flask', order: 7 },
  { name: 'Touch Up', slug: 'touch-up', description: 'Touch up pens and small repair kits', icon: 'pen-tool', order: 8 },
];

const products = [
  // Primers
  { name: 'Metal Primer Spray 400ml', slug: 'metal-primer-spray', description: 'High-adhesion primer specifically formulated for bare metal surfaces. Provides excellent corrosion protection and creates a strong bonding layer for subsequent coats.', price: 12.90, categorySlug: 'primers', brand: 'ProSpray', sku: 'PRM-MTL-400', image: 'https://cdn.abacus.ai/images/ca037ec1-871f-443d-a2b8-b2deb730192a.png', expertTip: 'Apply in thin, even coats. Allow 10-15 minutes between coats. Best results when surface temperature is between 15-25°C.', tags: ['metal', 'spray', 'corrosion-protection'], compatibleWith: ['2k-clear-coat', 'base-coat-silver', 'base-coat-black'] },
  { name: 'Universal Primer Gray 1L', slug: 'universal-primer-gray', description: 'Versatile gray primer suitable for most automotive surfaces. Excellent filling properties for minor imperfections and scratches.', price: 24.50, categorySlug: 'primers', brand: 'AutoFinish', sku: 'PRM-UNI-1L', image: 'https://cdn.abacus.ai/images/9cc14ab1-6f99-413b-83e7-a877d6daf519.png', expertTip: 'Sand with P400-P600 before applying topcoat. Can be applied over existing paint or bare metal.', tags: ['universal', 'filler', 'gray'], compatibleWith: ['2k-clear-coat', 'base-coat-silver', '1k-clear-coat'] },
  { name: 'Plastic Primer Spray 400ml', slug: 'plastic-primer-spray', description: 'Specialized adhesion promoter for plastic bumpers, mirrors and trim pieces. Essential for proper paint adhesion on plastic surfaces.', price: 14.90, categorySlug: 'primers', brand: 'ProSpray', sku: 'PRM-PLS-400', image: 'https://cdn.abacus.ai/images/871e0b3f-c33d-4e9d-99ad-b102c2e884a6.png', expertTip: 'Clean plastic thoroughly with plastic cleaner before application. Apply very thin coat - over-application causes adhesion issues.', tags: ['plastic', 'bumper', 'adhesion'], compatibleWith: ['base-coat-silver', 'base-coat-black', '1k-clear-coat'] },
  { name: 'Rust Converter Spray 400ml', slug: 'rust-converter-spray', description: 'Chemically converts rust to a stable compound and provides primer coat in one step. Ideal for treating rusted surfaces before painting.', price: 16.90, categorySlug: 'primers', brand: 'RustStop', sku: 'RST-CNV-400', image: 'https://cdn.abacus.ai/images/6f45e53b-e94f-479b-817f-3a23a6701393.png', expertTip: 'Remove loose rust with wire brush first. Works best on tightly adhered rust. Allow 24h before topcoating.', tags: ['rust', 'converter', 'treatment'], compatibleWith: ['metal-primer-spray', 'universal-primer-gray'] },
  
  // Base Coats
  { name: 'Metallic Silver Base Coat 1L', slug: 'base-coat-silver', description: 'Premium metallic silver base coat with excellent coverage and metallic flake distribution. Ready to spray formulation.', price: 42.00, categorySlug: 'base-coats', brand: 'ColorMaster', sku: 'BSC-SLV-1L', image: 'https://cdn.abacus.ai/images/1b884a85-5a3c-426e-9fbb-8a17106e1f23.png', expertTip: 'Stir thoroughly to distribute metallic particles evenly. Apply 2-3 medium wet coats with 10min flash time between coats.', tags: ['metallic', 'silver', 'basecoat'], compatibleWith: ['2k-clear-coat', '1k-clear-coat'] },
  { name: 'Solid Black Base Coat 1L', slug: 'base-coat-black', description: 'Deep jet black base coat with excellent hiding power. Perfect for full panel respray or touch-up work.', price: 36.00, categorySlug: 'base-coats', brand: 'ColorMaster', sku: 'BSC-BLK-1L', image: 'https://cdn.abacus.ai/images/5acd9f9d-242d-4e2b-b38f-97bbc69eab23.png', expertTip: 'Black shows every imperfection - ensure surface prep is perfect. Apply 2-3 light to medium coats.', tags: ['solid', 'black', 'basecoat'], compatibleWith: ['2k-clear-coat', '1k-clear-coat'] },
  { name: 'Pearl White Base Coat 1L', slug: 'base-coat-pearl-white', description: 'Elegant pearl white base coat with subtle pearl effect. Creates stunning depth and dimension.', price: 48.00, categorySlug: 'base-coats', brand: 'ColorMaster', sku: 'BSC-PRL-1L', image: 'https://cdn.abacus.ai/images/1b884a85-5a3c-426e-9fbb-8a17106e1f23.png', expertTip: 'Pearl whites require 3-4 coats for full coverage. Consistent spray distance is crucial for even pearl distribution.', tags: ['pearl', 'white', 'basecoat'], compatibleWith: ['2k-clear-coat'] },
  { name: 'Candy Red Base Coat 1L', slug: 'base-coat-candy-red', description: 'Vibrant candy red base coat for a deep, rich finish. Requires silver or gold base for best effect.', price: 52.00, categorySlug: 'base-coats', brand: 'ColorMaster', sku: 'BSC-CRD-1L', image: 'https://cdn.abacus.ai/images/5acd9f9d-242d-4e2b-b38f-97bbc69eab23.png', expertTip: 'Always apply over silver base for best color depth. Number of coats affects intensity - test on sample panel first.', tags: ['candy', 'red', 'basecoat'], compatibleWith: ['2k-clear-coat', 'base-coat-silver'] },
  
  // Clear Coats
  { name: '2K Clear Coat Gloss 1L', slug: '2k-clear-coat', description: 'Professional grade 2-component clear coat with exceptional gloss, durability and UV protection. Industry standard for automotive refinishing.', price: 38.00, categorySlug: 'clear-coats', brand: 'ProFinish', sku: 'CLR-2K-1L', image: 'https://cdn.abacus.ai/images/f9700e10-39c8-4545-973b-1acb2444eb98.png', expertTip: 'Mix 2:1 with hardener. Pot life is approximately 4 hours. Apply 2-3 wet coats. Can be wet sanded and polished after 24h.', tags: ['2k', 'gloss', 'clearcoat', 'professional'], compatibleWith: ['2k-hardener'] },
  { name: '1K Clear Coat Gloss 1L', slug: '1k-clear-coat', description: 'Single component clear coat ideal for small repairs and touch-ups. Easy to use with good gloss retention.', price: 22.00, categorySlug: 'clear-coats', brand: 'EasySpray', sku: 'CLR-1K-1L', image: 'https://cdn.abacus.ai/images/a661f26f-822a-4fc1-b425-ca7c4f55c0fb.png', expertTip: 'No mixing required. Great for spot repairs but less durable than 2K. Best for protected areas.', tags: ['1k', 'gloss', 'clearcoat', 'easy'], compatibleWith: [] },
  { name: '2K Matte Clear Coat 1L', slug: '2k-clear-coat-matte', description: 'Premium 2K clear coat with satin matte finish. Perfect for modern stealth looks and custom projects.', price: 44.00, categorySlug: 'clear-coats', brand: 'ProFinish', sku: 'CLR-2KM-1L', image: 'https://cdn.abacus.ai/images/f9700e10-39c8-4545-973b-1acb2444eb98.png', expertTip: 'Cannot be polished - any imperfections will show. Ensure dust-free environment. Mix 2:1 with standard 2K hardener.', tags: ['2k', 'matte', 'clearcoat', 'custom'], compatibleWith: ['2k-hardener'] },
  
  // Abrasives
  { name: 'Sandpaper Variety Pack P80-P2000', slug: 'sandpaper-variety', description: 'Complete assortment of automotive sandpaper grades from P80 to P2000. Includes wet/dry sheets for all prep stages.', price: 18.90, categorySlug: 'abrasives', brand: 'SandMaster', sku: 'SND-VAR-PK', image: 'https://cdn.abacus.ai/images/936c9e32-898f-489f-b75d-43d735a12c90.png', expertTip: 'P80-P180 for rust/old paint removal, P320-P400 for primer prep, P600-P800 for color sanding, P1500-P2000 for final polish.', tags: ['sandpaper', 'variety', 'wet-dry'], compatibleWith: [] },
  { name: 'Sanding Block Kit', slug: 'sanding-block-kit', description: 'Set of 3 flexible sanding blocks for flat and curved surfaces. Ergonomic design reduces fatigue.', price: 14.50, categorySlug: 'abrasives', brand: 'SandMaster', sku: 'SND-BLK-KT', image: 'https://cdn.abacus.ai/images/936c9e32-898f-489f-b75d-43d735a12c90.png', expertTip: 'Use soft block for curves, hard block for flat panels. Always sand in straight lines, never circular.', tags: ['sanding', 'block', 'kit'], compatibleWith: ['sandpaper-variety'] },
  
  // Masking
  { name: 'Blue Masking Tape 50mm x 50m', slug: 'blue-masking-tape', description: 'Professional grade blue masking tape with clean release up to 7 days. UV resistant for outdoor work.', price: 8.50, categorySlug: 'masking', brand: 'MaskPro', sku: 'MSK-BLU-50', image: 'https://cdn.abacus.ai/images/f55c3d82-f130-49f5-8508-914861dfbf93.png', expertTip: 'Remove tape while clear coat is still tacky for cleanest edges. Press edges firmly to prevent bleed-through.', tags: ['tape', 'blue', 'masking'], compatibleWith: [] },
  { name: 'Masking Paper Roll 300mm x 200m', slug: 'masking-paper-roll', description: 'High-density masking paper that resists paint bleed-through. Essential for protecting large areas.', price: 16.00, categorySlug: 'masking', brand: 'MaskPro', sku: 'MSK-PAP-300', image: 'https://cdn.abacus.ai/images/f55c3d82-f130-49f5-8508-914861dfbf93.png', expertTip: 'Use with masking tape dispenser for faster application. Double layer for 2K products.', tags: ['paper', 'masking', 'protection'], compatibleWith: ['blue-masking-tape'] },
  
  // Equipment
  { name: 'HVLP Spray Gun Professional', slug: 'hvlp-spray-gun', description: 'High volume low pressure spray gun with 1.3mm and 1.7mm nozzles. Stainless steel construction for durability.', price: 145.00, categorySlug: 'equipment', brand: 'SprayTech', sku: 'EQP-HVLP-PRO', image: 'https://cdn.abacus.ai/images/c2a5434d-34d6-487a-ab08-d19d5cc889aa.png', expertTip: 'Use 1.3mm for base coats and clear, 1.7mm for primers. Clean immediately after use. Requires 10-12 CFM compressor.', tags: ['spray-gun', 'hvlp', 'professional'], compatibleWith: [] },
  { name: 'Mini Detail Spray Gun', slug: 'mini-spray-gun', description: 'Compact spray gun perfect for small repairs and tight spaces. 0.8mm nozzle for precise application.', price: 65.00, categorySlug: 'equipment', brand: 'SprayTech', sku: 'EQP-MINI-SG', image: 'https://cdn.abacus.ai/images/c2a5434d-34d6-487a-ab08-d19d5cc889aa.png', expertTip: 'Ideal for spot repairs and touch-ups. Requires less air volume than full-size guns.', tags: ['spray-gun', 'mini', 'detail'], compatibleWith: [] },
  
  // Additives
  { name: 'Automotive Thinner 1L', slug: 'automotive-thinner', description: 'Universal automotive thinner for thinning base coats and cleaning equipment. Balanced evaporation rate.', price: 12.00, categorySlug: 'additives', brand: 'ChemPro', sku: 'ADD-THN-1L', image: 'https://cdn.abacus.ai/images/ad5901cd-bb7c-48fa-9407-60085bc0e6d2.png', expertTip: 'Add 10-15% to base coat for spray application. Use slow thinner in hot weather, fast thinner in cold.', tags: ['thinner', 'solvent', 'cleaning'], compatibleWith: ['base-coat-silver', 'base-coat-black'] },
  { name: '2K Hardener Standard 500ml', slug: '2k-hardener', description: 'Standard hardener for 2K clear coats and primers. 2:1 mixing ratio. Normal drying speed.', price: 18.00, categorySlug: 'additives', brand: 'ChemPro', sku: 'ADD-HRD-500', image: 'https://cdn.abacus.ai/images/d8f35c9b-7c61-4d77-a9e4-2e283ce6c27c.png', expertTip: 'Always measure accurately. Pot life is 4-6 hours at 20°C. Store away from moisture.', tags: ['hardener', '2k', 'activator'], compatibleWith: ['2k-clear-coat', '2k-clear-coat-matte'] },
  { name: 'Polishing Compound Fine 500g', slug: 'polishing-compound', description: 'Fine cut polishing compound for removing orange peel and achieving showroom shine.', price: 22.00, categorySlug: 'additives', brand: 'GlossPro', sku: 'ADD-POL-500', image: 'https://cdn.abacus.ai/images/55addc7c-6942-41b2-8167-8f3e566a86ef.png', expertTip: 'Use after wet sanding with P2000. Work in small sections. Follow with finishing polish for best results.', tags: ['polish', 'compound', 'finishing'], compatibleWith: [] },
  
  // Touch Up
  { name: 'Touch Up Paint Pen Universal', slug: 'touch-up-pen', description: 'Precision touch-up pen with brush and felt tip applicators. Perfect for stone chips and minor scratches.', price: 14.90, categorySlug: 'touch-up', brand: 'QuickFix', sku: 'TCH-PEN-UNI', image: 'https://cdn.abacus.ai/images/89378151-1cde-4e7d-b1e6-49abb2d50ea8.png', expertTip: 'Clean area with wax remover first. Apply thin layers, building up slowly. Can be polished after 7 days.', tags: ['touch-up', 'pen', 'chip-repair'], compatibleWith: [] },
  { name: 'Scratch Repair Kit Complete', slug: 'scratch-repair-kit', description: 'All-in-one kit for minor scratch repair including filler, primer, color and clear in convenient pen format.', price: 29.90, categorySlug: 'touch-up', brand: 'QuickFix', sku: 'TCH-KIT-CMP', image: 'https://cdn.abacus.ai/images/89378151-1cde-4e7d-b1e6-49abb2d50ea8.png', expertTip: 'For scratches that catch your fingernail. Fill, prime, color, clear in that order. Allow each layer to dry.', tags: ['scratch', 'repair', 'kit'], compatibleWith: [] },
];

const projectTemplates = [
  {
    title: 'Car Scratch Repair',
    slug: 'car-scratch-repair',
    description: 'Fix scratches on your car body panels like a professional. This guide covers everything from surface assessment to final polish.',
    keywords: ['scratch', 'scratched', 'chip', 'chipped', 'mark', 'scuff'],
    difficulty: 'medium',
    timeEstimate: '2-4 hours',
    steps: [
      {
        stepNumber: 1,
        title: 'Assess and Clean the Damage',
        description: 'Clean the scratched area thoroughly with wax and grease remover. Determine if the scratch has penetrated to bare metal or just the clear coat.',
        proTips: ['Run your fingernail across the scratch - if it catches, the scratch needs filling', 'Clean in straight lines, not circles, to avoid creating swirl marks'],
        products: ['automotive-thinner', 'sandpaper-variety']
      },
      {
        stepNumber: 2,
        title: 'Sand and Prepare Surface',
        description: 'Sand the damaged area with appropriate grit sandpaper. Start with P400 for deep scratches, P800 for light scratches. Feather the edges of existing paint.',
        proTips: ['Always sand in the direction of the panel lines', 'Use a sanding block for flat surfaces, hand-sand curves', 'Wet sand to reduce dust and get smoother finish'],
        products: ['sandpaper-variety', 'sanding-block-kit']
      },
      {
        stepNumber: 3,
        title: 'Mask Surrounding Area',
        description: 'Apply masking tape and paper to protect surrounding panels and trim from overspray.',
        proTips: ['Mask at least 30cm beyond the repair area', 'Use plastic sheeting for large coverage areas', 'Press tape edges firmly to prevent paint bleed'],
        products: ['blue-masking-tape', 'masking-paper-roll']
      },
      {
        stepNumber: 4,
        title: 'Apply Primer',
        description: 'Apply 2-3 thin coats of primer to the repair area. Allow 10-15 minutes between coats.',
        proTips: ['Build up thin coats rather than one thick coat', 'Primer should cover slightly beyond the sanded area', 'Sand primer with P600 when dry for smooth base'],
        products: ['universal-primer-gray', 'metal-primer-spray']
      },
      {
        stepNumber: 5,
        title: 'Apply Base Coat',
        description: 'Apply your matching base coat color in 2-3 medium coats. Blend into surrounding paintwork.',
        proTips: ['Keep spray gun moving to avoid runs', 'Flash time between coats is crucial for metallics', 'Build color gradually for best blend'],
        products: ['base-coat-silver', 'base-coat-black', 'automotive-thinner']
      },
      {
        stepNumber: 6,
        title: 'Apply Clear Coat',
        description: 'Apply 2-3 coats of clear coat for protection and gloss. Allow proper flash time between coats.',
        proTips: ['2K clear provides best durability', 'Remove masking tape while clear is still tacky', 'Allow 24-48 hours before wet sanding or polishing'],
        products: ['2k-clear-coat', '2k-hardener', '1k-clear-coat']
      },
      {
        stepNumber: 7,
        title: 'Polish and Finish',
        description: 'After clear coat has cured, wet sand any orange peel with P2000 and polish to a high gloss.',
        proTips: ['Keep surface wet when wet sanding', 'Work in small sections when polishing', 'Use finishing polish after compound for showroom shine'],
        products: ['polishing-compound', 'sandpaper-variety']
      }
    ]
  },
  {
    title: 'Bumper Repaint',
    slug: 'bumper-repaint',
    description: 'Complete guide to repainting plastic bumpers. Special techniques for plastic adhesion and flexibility.',
    keywords: ['bumper', 'fender', 'plastic', 'repaint', 'respray'],
    difficulty: 'medium',
    timeEstimate: '3-5 hours',
    steps: [
      {
        stepNumber: 1,
        title: 'Remove and Clean Bumper',
        description: 'Remove bumper if possible for best results. Clean thoroughly with plastic cleaner to remove all wax, silicone and contaminants.',
        proTips: ['Removal allows spraying all edges properly', 'Use specific plastic cleaner, not regular degreasers', 'Clean inside of bumper to remove road grime'],
        products: ['automotive-thinner']
      },
      {
        stepNumber: 2,
        title: 'Sand the Surface',
        description: 'Sand entire bumper with P400-P600 grit to create mechanical adhesion. Focus on glossy areas.',
        proTips: ['Plastic needs good scuff for paint adhesion', 'Use grey scuff pad for textured areas', 'Rinse and dry before proceeding'],
        products: ['sandpaper-variety', 'sanding-block-kit']
      },
      {
        stepNumber: 3,
        title: 'Apply Plastic Primer',
        description: 'Apply adhesion promoter/plastic primer in thin coats. This is ESSENTIAL for paint to stick to plastic.',
        proTips: ['Very thin coats - thick application causes poor adhesion', 'Allow 10-15 minutes before topcoating', 'Do not sand plastic primer'],
        products: ['plastic-primer-spray']
      },
      {
        stepNumber: 4,
        title: 'Apply Color Coats',
        description: 'Apply 3-4 coats of your base coat color, allowing proper flash time between coats.',
        proTips: ['Flexible plastic needs more coats for durability', 'Maintain consistent spray distance', 'Check for coverage in indirect light'],
        products: ['base-coat-black', 'base-coat-silver', 'automotive-thinner']
      },
      {
        stepNumber: 5,
        title: 'Apply Clear Coat',
        description: 'Apply 2-3 coats of flexible clear coat designed for plastic parts.',
        proTips: ['Use flex additive in 2K clear for plastic parts', 'Build up gloss with multiple thin coats', 'Allow full cure before reinstalling'],
        products: ['2k-clear-coat', '2k-hardener']
      }
    ]
  },
  {
    title: 'Rust Treatment',
    slug: 'rust-treatment',
    description: 'Stop rust in its tracks and prepare rusted surfaces for painting. Essential for lasting repairs.',
    keywords: ['rust', 'rusted', 'rusty', 'oxidized', 'corrosion'],
    difficulty: 'hard',
    timeEstimate: '4-6 hours',
    steps: [
      {
        stepNumber: 1,
        title: 'Remove Loose Rust',
        description: 'Use wire brush, scraper or power tool to remove all loose, flaky rust. Get down to solid material.',
        proTips: ['Wear safety glasses and mask', 'Remove ALL loose rust - this is critical', 'Check for rust perforation (holes)'],
        products: ['sandpaper-variety']
      },
      {
        stepNumber: 2,
        title: 'Apply Rust Converter',
        description: 'Apply rust converter to remaining rust. This chemically converts rust to stable iron phosphate.',
        proTips: ['Apply to rust only, not bare metal', 'One thick coat is better than multiple thin coats', 'Surface will turn black when conversion is complete'],
        products: ['rust-converter-spray']
      },
      {
        stepNumber: 3,
        title: 'Apply Etch Primer',
        description: 'Once rust converter is dry (24h), apply etch/metal primer for maximum adhesion to the treated surface.',
        proTips: ['Etch primer provides chemical bond to metal', 'Apply 2 thin coats', 'Can be topcoated after 30 minutes'],
        products: ['metal-primer-spray']
      },
      {
        stepNumber: 4,
        title: 'Apply Filler Primer',
        description: 'Apply high-build primer to fill any pitting left by the rust. Sand smooth when dry.',
        proTips: ['Multiple coats may be needed for deep pitting', 'Sand with P320-P400 between coats', 'Block sand for flattest results'],
        products: ['universal-primer-gray', 'sandpaper-variety', 'sanding-block-kit']
      },
      {
        stepNumber: 5,
        title: 'Apply Color and Clear',
        description: 'Mask surrounding areas and apply base coat and clear coat following standard procedures.',
        proTips: ['Rust repairs need extra clear coat protection', 'Consider rust inhibiting clear coat', 'Regular waxing prolongs repair life'],
        products: ['base-coat-black', '2k-clear-coat', '2k-hardener', 'blue-masking-tape']
      }
    ]
  },
  {
    title: 'Metal Surface Painting',
    slug: 'metal-surface-painting',
    description: 'Comprehensive guide to painting bare metal surfaces including gates, railings and structural steel.',
    keywords: ['metal', 'steel', 'iron', 'gate', 'railing', 'structural'],
    difficulty: 'easy',
    timeEstimate: '2-3 hours',
    steps: [
      {
        stepNumber: 1,
        title: 'Clean and Degrease',
        description: 'Remove all grease, oil and contaminants from the metal surface using appropriate cleaners.',
        proTips: ['New metal often has protective oil coating', 'Solvent wipe followed by water rinse', 'Allow to dry completely'],
        products: ['automotive-thinner']
      },
      {
        stepNumber: 2,
        title: 'Remove Old Paint or Rust',
        description: 'Sand or wire brush to remove any existing coatings or surface rust.',
        proTips: ['Power tools speed up large areas', 'Hand sand corners and details', 'Wear appropriate PPE'],
        products: ['sandpaper-variety']
      },
      {
        stepNumber: 3,
        title: 'Apply Metal Primer',
        description: 'Apply rust-inhibiting metal primer to all bare metal areas. 2 coats recommended.',
        proTips: ['Primer is your rust protection - don\'t skip it', 'Spray primer gives best coverage on complex shapes', 'Allow proper drying between coats'],
        products: ['metal-primer-spray', 'universal-primer-gray']
      },
      {
        stepNumber: 4,
        title: 'Apply Topcoat',
        description: 'Apply your chosen topcoat color in 2-3 coats for durable, attractive finish.',
        proTips: ['Enamel paints offer good durability for metal', 'Light coats prevent runs on vertical surfaces', 'Touch up any missed spots'],
        products: ['base-coat-black', 'base-coat-silver']
      }
    ]
  }
];

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.stepProduct.deleteMany();
  await prisma.projectStep.deleteMany();
  await prisma.projectTemplate.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.activeProject.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Cleared existing data');

  // Create categories
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = created.id;
    console.log(`Created category: ${cat.name}`);
  }

  // Create products
  const createdProducts: Record<string, string> = {};
  for (const prod of products) {
    const { categorySlug, ...productData } = prod;
    const created = await prisma.product.create({
      data: {
        ...productData,
        categoryId: createdCategories[categorySlug],
      },
    });
    createdProducts[prod.slug] = created.id;
    console.log(`Created product: ${prod.name}`);
  }

  // Create project templates with steps and product recommendations
  for (const template of projectTemplates) {
    const { steps, ...templateData } = template;
    const createdTemplate = await prisma.projectTemplate.create({
      data: templateData,
    });
    console.log(`Created template: ${template.title}`);

    for (const step of steps) {
      const { products: stepProducts, ...stepData } = step;
      const createdStep = await prisma.projectStep.create({
        data: {
          ...stepData,
          templateId: createdTemplate.id,
        },
      });
      console.log(`  Created step ${step.stepNumber}: ${step.title}`);

      // Create step product associations
      for (const productSlug of stepProducts) {
        if (createdProducts[productSlug]) {
          await prisma.stepProduct.create({
            data: {
              stepId: createdStep.id,
              productId: createdProducts[productSlug],
              isRequired: stepProducts.indexOf(productSlug) === 0,
            },
          });
        }
      }
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
