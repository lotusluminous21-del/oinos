import type { Solution, SolutionStep, KnowledgeState, DamageDepth, MaterialType, ColorType } from './types';
import { getEffectiveValue, DEFAULTS } from './knowledge-state';
import { generateId } from './utils';

// Product catalog for solution generation
const PRODUCT_CATALOG = {
  // Preparation
  degreaser: {
    id: 'degreaser',
    slug: 'wax-grease-remover',
    name: 'Wax & Grease Remover',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200',
    reason: 'Essential for cleaning the surface before any paint work',
  },
  tackCloth: {
    id: 'tack-cloth',
    slug: 'tack-cloth-pack',
    name: 'Tack Cloth (Pack of 5)',
    price: 4.20,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    reason: 'Removes dust particles before painting',
  },

  // Sanding
  sandpaper320: {
    id: 'sandpaper-320',
    slug: 'sandpaper-320-grit',
    name: 'Sandpaper 320 Grit (5 sheets)',
    price: 6.80,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200',
    reason: 'For initial sanding and feathering edges',
  },
  sandpaper600: {
    id: 'sandpaper-600',
    slug: 'sandpaper-600-grit',
    name: 'Sandpaper 600 Grit (5 sheets)',
    price: 6.80,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200',
    reason: 'For smoothing before primer',
  },
  sandpaper1500: {
    id: 'sandpaper-1500',
    slug: 'sandpaper-1500-grit',
    name: 'Sandpaper 1500 Grit Wet (5 sheets)',
    price: 7.50,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200',
    reason: 'For wet sanding clear coat',
  },
  sandpaper2000: {
    id: 'sandpaper-2000',
    slug: 'sandpaper-2000-grit',
    name: 'Sandpaper 2000 Grit Wet (5 sheets)',
    price: 8.20,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200',
    reason: 'For final wet sanding before polish',
  },

  // Rust Treatment
  rustConverter: {
    id: 'rust-converter',
    slug: 'rust-converter-spray',
    name: 'Rust Converter Spray 400ml',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200',
    reason: 'Converts rust to a stable primer-ready surface',
  },
  rustInhibitor: {
    id: 'rust-inhibitor',
    slug: 'rust-inhibitor-primer',
    name: 'Rust Inhibiting Primer 400ml',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200',
    reason: 'Prevents rust from returning under new paint',
  },

  // Primers
  metalPrimer: {
    id: 'metal-primer',
    slug: 'metal-primer-aerosol',
    name: '2K Metal Primer Aerosol 400ml',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200',
    reason: 'High-build primer for bare metal surfaces',
  },
  plasticPrimer: {
    id: 'plastic-primer',
    slug: 'plastic-adhesion-promoter',
    name: 'Plastic Adhesion Promoter 400ml',
    price: 15.90,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200',
    reason: 'Essential for paint adhesion on plastic surfaces',
  },
  universalPrimer: {
    id: 'universal-primer',
    slug: 'universal-primer-filler',
    name: 'Universal Primer Filler 400ml',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200',
    reason: 'Fill minor imperfections and provide adhesion',
  },

  // Base Coats
  silverMetallicBase: {
    id: 'silver-metallic-base',
    slug: 'silver-metallic-base-coat',
    name: 'Silver Metallic Base Coat 400ml',
    price: 22.90,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200',
    reason: 'Color-matched metallic base coat',
  },
  whiteBase: {
    id: 'white-base',
    slug: 'solid-white-base-coat',
    name: 'Solid White Base Coat 400ml',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200',
    reason: 'Color-matched solid base coat',
  },
  blackBase: {
    id: 'black-base',
    slug: 'solid-black-base-coat',
    name: 'Solid Black Base Coat 400ml',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200',
    reason: 'Color-matched solid base coat',
  },
  genericBase: {
    id: 'generic-base',
    slug: 'custom-color-base-coat',
    name: 'Custom Color Base Coat 400ml',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200',
    reason: 'Can be mixed to match your exact color code',
  },

  // Clear Coats
  clearCoat2K: {
    id: 'clear-coat-2k',
    slug: '2k-clear-coat-aerosol',
    name: '2K Clear Coat Aerosol 400ml',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200',
    reason: 'Professional-grade clear for durability and gloss',
  },
  clearCoat1K: {
    id: 'clear-coat-1k',
    slug: '1k-clear-coat-aerosol',
    name: '1K Clear Coat Aerosol 400ml',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200',
    reason: 'Easy-to-use clear coat for small repairs',
  },

  // Finishing
  cuttingCompound: {
    id: 'cutting-compound',
    slug: 'cutting-compound',
    name: 'Cutting Compound 250ml',
    price: 11.90,
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=200',
    reason: 'Removes orange peel and levels the clear coat',
  },
  polishingCompound: {
    id: 'polishing-compound',
    slug: 'polishing-compound',
    name: 'Polishing Compound 250ml',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=200',
    reason: 'Final polish for high gloss finish',
  },
  scratchRemover: {
    id: 'scratch-remover',
    slug: 'scratch-remover-kit',
    name: 'Scratch Remover Kit',
    price: 15.90,
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=200',
    reason: 'For polishing out light surface scratches',
  },

  // Masking
  maskingTape: {
    id: 'masking-tape',
    slug: 'automotive-masking-tape',
    name: 'Automotive Masking Tape 25mm',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200',
    reason: 'Clean edges for professional results',
  },
  maskingPaper: {
    id: 'masking-paper',
    slug: 'masking-paper-roll',
    name: 'Masking Paper Roll',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200',
    reason: 'Protect surrounding areas from overspray',
  },
};

function getBaseCoatProduct(colorDescription?: string, colorType?: ColorType) {
  const color = colorDescription?.toLowerCase() || '';
  
  if (color.includes('silver') || color.includes('gray') || color.includes('grey')) {
    return PRODUCT_CATALOG.silverMetallicBase;
  }
  if (color.includes('white')) {
    return PRODUCT_CATALOG.whiteBase;
  }
  if (color.includes('black')) {
    return PRODUCT_CATALOG.blackBase;
  }
  
  return PRODUCT_CATALOG.genericBase;
}

export function generateSolution(state: KnowledgeState): Solution {
  const depth = getEffectiveValue<DamageDepth>(state, 'damageDepth') || 'throughClear';
  const material = getEffectiveValue<MaterialType>(state, 'material') || 'metal';
  const rustPresent = state.confirmed.rustPresent ?? state.inferred.rustPresent?.value ?? DEFAULTS.rustPresent;
  const colorType = getEffectiveValue<ColorType>(state, 'colorType') || DEFAULTS.colorType;
  const colorDescription = state.confirmed.colorDescription || state.inferred.colorDescription?.value || '';
  const size = state.confirmed.size || state.inferred.size?.value || DEFAULTS.size;
  const equipment = state.confirmed.equipment || DEFAULTS.equipment;

  const steps: SolutionStep[] = [];
  const assumptions: string[] = [];

  if (!state.confirmed.equipment) {
    assumptions.push('Using aerosol spray cans');
  }
  if (!state.confirmed.size && !state.inferred.size) {
    assumptions.push('Medium-sized damage area');
  }

  // SURFACE DAMAGE ONLY - Simple polishing
  if ((depth as string) === 'surface') {
    steps.push({
      order: 1,
      title: 'Clean & Assess',
      description: 'Clean the area thoroughly with wax and grease remover to see the true extent of the damage.',
      proTips: [
        'Work in good lighting to see all the scratches',
        'If scratches catch your fingernail, they may need paint, not just polish',
      ],
      duration: '10 mins',
      products: [
        { ...PRODUCT_CATALOG.degreaser, productId: PRODUCT_CATALOG.degreaser.id, productSlug: PRODUCT_CATALOG.degreaser.slug, isEssential: true, quantity: 1 },
      ],
    });

    steps.push({
      order: 2,
      title: 'Polish Out Scratches',
      description: 'Use cutting compound first to level the scratches, then polishing compound for gloss.',
      proTips: [
        'Work in small circular motions',
        'Use a microfiber cloth or polishing pad',
        "Don't apply too much pressure",
      ],
      duration: '20-30 mins',
      products: [
        { ...PRODUCT_CATALOG.scratchRemover, productId: PRODUCT_CATALOG.scratchRemover.id, productSlug: PRODUCT_CATALOG.scratchRemover.slug, isEssential: true, quantity: 1 },
      ],
    });

    const totalPrice = PRODUCT_CATALOG.degreaser.price + PRODUCT_CATALOG.scratchRemover.price;

    return {
      id: generateId(),
      title: 'Surface Scratch Repair',
      summary: {
        estimatedTime: '30-45 mins',
        difficulty: 'beginner',
        priceRange: { min: totalPrice - 5, max: totalPrice + 10 },
      },
      basedOn: { damageType: 'Surface scratches', damageDepth: 'Surface marks only', material, colorType, size, rustPresent: false, equipment },
      assumptions,
      steps,
      totalProducts: 2,
      totalPrice,
    };
  }

  // FULL REPAIR PATH
  // Step 1: Preparation
  steps.push({
    order: 1,
    title: 'Preparation',
    description: 'Clean the damaged area thoroughly with wax and grease remover. This removes contaminants that would prevent paint adhesion.',
    proTips: [
      'Clean a larger area than the damage - about 15cm beyond in all directions',
      'Let it dry completely before proceeding',
      'Work in a well-ventilated area',
    ],
    duration: '15 mins',
    products: [
      { ...PRODUCT_CATALOG.degreaser, productId: PRODUCT_CATALOG.degreaser.id, productSlug: PRODUCT_CATALOG.degreaser.slug, isEssential: true, quantity: 1 },
      { ...PRODUCT_CATALOG.tackCloth, productId: PRODUCT_CATALOG.tackCloth.id, productSlug: PRODUCT_CATALOG.tackCloth.slug, isEssential: true, quantity: 1 },
    ],
  });

  // Step 2: Rust Treatment (if needed)
  if (rustPresent) {
    steps.push({
      order: 2,
      title: 'Rust Treatment',
      description: 'Remove loose rust with sandpaper, then apply rust converter to stabilize remaining rust and prevent it from spreading.',
      proTips: [
        'Wear gloves - rust converter can stain',
        'Let it cure for the full recommended time (usually 24 hours)',
        'The treated area will turn black - this is normal',
      ],
      warnings: [
        "Don't skip this step! Rust will continue spreading under the new paint if not treated.",
      ],
      duration: '30 mins + 24hr cure',
      products: [
        { ...PRODUCT_CATALOG.sandpaper320, productId: PRODUCT_CATALOG.sandpaper320.id, productSlug: PRODUCT_CATALOG.sandpaper320.slug, isEssential: true, quantity: 1, reason: 'For removing loose rust and feathering edges' },
        { ...PRODUCT_CATALOG.rustConverter, productId: PRODUCT_CATALOG.rustConverter.id, productSlug: PRODUCT_CATALOG.rustConverter.slug, isEssential: true, quantity: 1 },
      ],
    });
  }

  // Step 3: Sanding
  const sandingStepNum = rustPresent ? 3 : 2;
  steps.push({
    order: sandingStepNum,
    title: 'Sanding',
    description: 'Sand the damaged area to create a smooth surface and feather the edges of the existing paint for seamless blending.',
    proTips: [
      'Start with coarser grit (320) and progress to finer (600)',
      'Feather the edges by sanding in a wider circle than the damage',
      'Use a sanding block for flat surfaces',
    ],
    duration: '30-45 mins',
    products: rustPresent ? [
      { ...PRODUCT_CATALOG.sandpaper600, productId: PRODUCT_CATALOG.sandpaper600.id, productSlug: PRODUCT_CATALOG.sandpaper600.slug, isEssential: true, quantity: 1 },
    ] : [
      { ...PRODUCT_CATALOG.sandpaper320, productId: PRODUCT_CATALOG.sandpaper320.id, productSlug: PRODUCT_CATALOG.sandpaper320.slug, isEssential: true, quantity: 1 },
      { ...PRODUCT_CATALOG.sandpaper600, productId: PRODUCT_CATALOG.sandpaper600.id, productSlug: PRODUCT_CATALOG.sandpaper600.slug, isEssential: true, quantity: 1 },
    ],
  });

  // Step 4: Masking
  const maskingStepNum = sandingStepNum + 1;
  steps.push({
    order: maskingStepNum,
    title: 'Masking',
    description: 'Mask off surrounding areas to protect them from overspray.',
    proTips: [
      "Mask at least 30cm beyond the area you're spraying",
      'Press tape edges firmly to prevent paint bleeding underneath',
      'Cover lights, trim, and any nearby panels',
    ],
    duration: '15-20 mins',
    products: [
      { ...PRODUCT_CATALOG.maskingTape, productId: PRODUCT_CATALOG.maskingTape.id, productSlug: PRODUCT_CATALOG.maskingTape.slug, isEssential: true, quantity: 1 },
      { ...PRODUCT_CATALOG.maskingPaper, productId: PRODUCT_CATALOG.maskingPaper.id, productSlug: PRODUCT_CATALOG.maskingPaper.slug, isEssential: false, quantity: 1 },
    ],
  });

  // Step 5: Primer
  const primerStepNum = maskingStepNum + 1;
  const primerProduct = material === 'plastic' ? PRODUCT_CATALOG.plasticPrimer : 
                        (depth === 'toMetal' || rustPresent) ? PRODUCT_CATALOG.metalPrimer :
                        PRODUCT_CATALOG.universalPrimer;

  const primerProducts = material === 'plastic' ? [
    { ...PRODUCT_CATALOG.plasticPrimer, productId: PRODUCT_CATALOG.plasticPrimer.id, productSlug: PRODUCT_CATALOG.plasticPrimer.slug, isEssential: true, quantity: 1, reason: 'Essential for paint adhesion on plastic surfaces' },
    { ...PRODUCT_CATALOG.universalPrimer, productId: PRODUCT_CATALOG.universalPrimer.id, productSlug: PRODUCT_CATALOG.universalPrimer.slug, isEssential: true, quantity: 1, reason: 'Applied over adhesion promoter for best results' },
  ] : [
    { ...primerProduct, productId: primerProduct.id, productSlug: primerProduct.slug, isEssential: true, quantity: 1 },
  ];

  if (rustPresent) {
    primerProducts.unshift({
      ...PRODUCT_CATALOG.rustInhibitor,
      productId: PRODUCT_CATALOG.rustInhibitor.id,
      productSlug: PRODUCT_CATALOG.rustInhibitor.slug,
      isEssential: true,
      quantity: 1,
      reason: 'Extra rust protection under the primer',
    });
  }

  steps.push({
    order: primerStepNum,
    title: 'Prime',
    description: material === 'plastic' 
      ? 'Apply adhesion promoter first, then primer filler. This ensures the paint will stick to the plastic surface.'
      : 'Apply primer in thin, even coats. This provides adhesion and fills minor imperfections.',
    proTips: [
      'Apply 2-3 light coats, not one heavy coat',
      'Wait 10-15 minutes between coats',
      'Lightly sand with 600 grit after the primer cures',
    ],
    duration: '30-45 mins',
    products: primerProducts,
  });

  // Step 6: Base Coat
  const baseStepNum = primerStepNum + 1;
  const baseCoat = getBaseCoatProduct(colorDescription, colorType);

  steps.push({
    order: baseStepNum,
    title: 'Apply Base Coat',
    description: `Apply the ${colorType} base coat in thin, even layers. Build up color gradually.`,
    proTips: [
      'Shake the can thoroughly for 2 minutes',
      'Apply 3-4 thin coats for full coverage',
      'Wait 10-15 minutes between coats',
      colorType === 'metallic' ? 'Keep consistent spray distance for even metallic flake distribution' : 'Keep consistent spray distance',
    ],
    duration: '45-60 mins',
    products: [
      { ...baseCoat, productId: baseCoat.id, productSlug: baseCoat.slug, isEssential: true, quantity: size === 'large' ? 2 : 1 },
    ],
  });

  // Step 7: Clear Coat
  const clearStepNum = baseStepNum + 1;
  steps.push({
    order: clearStepNum,
    title: 'Apply Clear Coat',
    description: 'Apply clear coat to protect the base coat and provide gloss.',
    proTips: [
      'Apply 2-3 coats of clear',
      'The first coat should be a light tack coat',
      'Apply subsequent coats slightly heavier',
      'Wait 10-15 minutes between coats',
    ],
    warnings: [
      '2K clear coat cans have a limited pot life once activated - use within 48 hours',
    ],
    duration: '30-45 mins',
    products: [
      { ...PRODUCT_CATALOG.clearCoat2K, productId: PRODUCT_CATALOG.clearCoat2K.id, productSlug: PRODUCT_CATALOG.clearCoat2K.slug, isEssential: true, quantity: size === 'large' ? 2 : 1 },
    ],
  });

  // Step 8: Final Polish
  const polishStepNum = clearStepNum + 1;
  steps.push({
    order: polishStepNum,
    title: 'Wet Sand & Polish',
    description: 'After the clear coat cures (24-48 hours), wet sand any orange peel and polish to a high gloss.',
    proTips: [
      'Let clear coat cure for at least 24 hours before wet sanding',
      'Use plenty of water when wet sanding',
      'Start with 1500 grit, then 2000 grit',
      'Finish with polishing compound for a mirror shine',
    ],
    duration: '45-60 mins',
    products: [
      { ...PRODUCT_CATALOG.sandpaper1500, productId: PRODUCT_CATALOG.sandpaper1500.id, productSlug: PRODUCT_CATALOG.sandpaper1500.slug, isEssential: false, quantity: 1 },
      { ...PRODUCT_CATALOG.sandpaper2000, productId: PRODUCT_CATALOG.sandpaper2000.id, productSlug: PRODUCT_CATALOG.sandpaper2000.slug, isEssential: false, quantity: 1 },
      { ...PRODUCT_CATALOG.cuttingCompound, productId: PRODUCT_CATALOG.cuttingCompound.id, productSlug: PRODUCT_CATALOG.cuttingCompound.slug, isEssential: true, quantity: 1 },
      { ...PRODUCT_CATALOG.polishingCompound, productId: PRODUCT_CATALOG.polishingCompound.id, productSlug: PRODUCT_CATALOG.polishingCompound.slug, isEssential: true, quantity: 1 },
    ],
  });

  // Calculate totals
  let totalPrice = 0;
  let totalProducts = 0;
  steps.forEach(step => {
    step.products.forEach(p => {
      totalPrice += p.price * p.quantity;
      totalProducts++;
    });
  });

  // Determine difficulty
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  if (depth === 'surface') difficulty = 'beginner';
  if (rustPresent || colorType === 'pearl' || material === 'plastic') difficulty = 'intermediate';
  if (colorType === 'tricoat' || (rustPresent && depth === 'toMetal')) difficulty = 'advanced';

  // Estimate time
  const baseTime = depth === 'surface' ? 45 : 120;
  const rustTime = rustPresent ? 60 : 0;
  const totalMins = baseTime + rustTime;
  const estimatedTime = totalMins < 60 
    ? `${totalMins} mins`
    : totalMins < 120
      ? '1-2 hours'
      : totalMins < 240
        ? '2-4 hours'
        : '4+ hours';

  const title = rustPresent 
    ? `Rust Repair - ${colorDescription || colorType}`
    : `${colorDescription || colorType} ${depth === 'throughClear' ? 'Spot' : depth === 'toMetal' ? 'Deep' : ''} Repair`.trim();

  return {
    id: generateId(),
    title: title.charAt(0).toUpperCase() + title.slice(1),
    summary: {
      estimatedTime: rustPresent ? `${estimatedTime} + 24hr cure` : estimatedTime,
      difficulty,
      priceRange: { min: Math.round(totalPrice * 0.9), max: Math.round(totalPrice * 1.1) },
    },
    basedOn: {
      damageType: state.confirmed.damageType || 'scratch',
      damageDepth: depth,
      material,
      colorType,
      size,
      rustPresent,
      equipment,
    },
    assumptions,
    steps,
    totalProducts,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
}
