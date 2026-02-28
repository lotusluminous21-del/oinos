import type {
  KnowledgeState,
  Message,
  Question,
  QuestionOption,
  ImageAnalysisResult,
  DamageType,
  DamageDepth,
  MaterialType,
  ColorType,
  SizeType,
} from './types';
import { updateGaps, getMostImportantGap, DEFAULTS } from './knowledge-state';
import { delay } from './utils';

// ============================================
// TEXT PARSING
// ============================================

interface TextExtractionResult {
  updates: Partial<KnowledgeState['confirmed']>;
  inferences: Partial<KnowledgeState['inferred']>;
}

const DAMAGE_TYPE_KEYWORDS: Record<DamageType, string[]> = {
  scratch: ['scratch', 'scratched', 'scraped', 'scrape', 'keyed', 'γρατζουνιά', 'γρατσουνιά'],
  rust: ['rust', 'rusted', 'rusty', 'corrosion', 'corroded', 'oxidation', 'σκουριά'],
  chip: ['chip', 'chipped', 'stone chip', 'rock chip'],
  dent: ['dent', 'dented', 'ding', 'βαθούλωμα'],
  fade: ['fade', 'faded', 'fading', 'dull', 'oxidized', 'ξεθωριασμένο'],
  peel: ['peel', 'peeling', 'flaking', 'ξεφλούδισμα'],
};

const DEPTH_KEYWORDS: Record<DamageDepth, string[]> = {
  surface: ['surface', 'light', 'minor', 'barely', 'superficial', 'shallow', 'can barely feel'],
  throughClear: ['through clear', 'different color', 'see color', 'to primer', 'white showing', 'primer showing'],
  toPrimer: ['to primer', 'primer visible', 'gray showing'],
  toMetal: ['bare metal', 'metal showing', 'metal visible', 'shiny metal', 'down to metal', 'see metal'],
};

const MATERIAL_KEYWORDS: Record<MaterialType, string[]> = {
  metal: ['metal', 'steel', 'aluminum', 'door', 'fender', 'hood', 'trunk', 'roof', 'quarter panel'],
  plastic: ['plastic', 'bumper', 'mirror', 'trim', 'molding', 'spoiler', 'cladding'],
  fiberglass: ['fiberglass', 'fibreglass', 'composite'],
  mixed: ['both', 'multiple'],
};

const COLOR_TYPE_KEYWORDS: Record<ColorType, string[]> = {
  solid: ['solid', 'flat', 'non-metallic', 'plain'],
  metallic: ['metallic', 'metal flake', 'sparkle', 'silver', 'aluminum', 'grey metallic', 'gray metallic'],
  pearl: ['pearl', 'pearlescent', 'mica', 'iridescent', 'color shift'],
  tricoat: ['tricoat', 'tri-coat', 'candy', 'three stage'],
};

const COLOR_NAMES: string[] = [
  'white', 'black', 'silver', 'gray', 'grey', 'red', 'blue', 'green', 'yellow', 'orange',
  'brown', 'beige', 'gold', 'bronze', 'purple', 'maroon', 'navy', 'burgundy', 'champagne',
  'graphite', 'charcoal', 'ivory', 'cream', 'tan',
];

const SIZE_KEYWORDS: Record<SizeType, string[]> = {
  tiny: ['tiny', 'pinpoint', 'dot', 'very small', 'less than 1cm', '<1cm', 'millimeter'],
  small: ['small', '1cm', '2cm', '3cm', 'fingertip', 'coin size', 'quarter size'],
  medium: ['medium', '5cm', '10cm', 'palm', 'hand size', 'about 10', 'fist'],
  large: ['large', 'big', '15cm', '20cm', 'entire panel', 'whole', 'major', 'extensive'],
};

const RUST_KEYWORDS = {
  present: ['rust', 'rusty', 'rusted', 'orange', 'brown spots', 'corrosion', 'oxidation'],
  absent: ['no rust', 'not rusty', 'no corrosion', 'fresh', 'just happened', 'new scratch'],
};

const EQUIPMENT_KEYWORDS = {
  aerosol: ['spray can', 'aerosol', 'rattle can', 'cans'],
  sprayGun: ['spray gun', 'hvlp', 'paint gun', 'compressor', 'professional'],
  none: ['no equipment', 'nothing', 'dont have', "don't have"],
};

export function parseText(text: string): TextExtractionResult {
  const lowerText = text.toLowerCase();
  const updates: Partial<KnowledgeState['confirmed']> = {};
  const inferences: Partial<KnowledgeState['inferred']> = {};

  // Damage type
  for (const [type, keywords] of Object.entries(DAMAGE_TYPE_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      updates.damageType = type as DamageType;
      break;
    }
  }

  // Damage depth
  for (const [depth, keywords] of Object.entries(DEPTH_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      updates.damageDepth = depth as DamageDepth;
      break;
    }
  }

  // Material - can be inferred from location
  for (const [material, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    const match = keywords.find(kw => lowerText.includes(kw));
    if (match) {
      // Direct material mentions are confirmed
      if (['metal', 'plastic', 'fiberglass'].includes(match)) {
        updates.material = material as MaterialType;
      } else {
        // Location-based inference
        inferences.material = {
          value: material as MaterialType,
          confidence: 0.8,
          source: 'text',
        };
        // Store location
        const locationKeywords = ['door', 'fender', 'hood', 'trunk', 'roof', 'bumper', 'mirror', 'trim'];
        const location = locationKeywords.find(loc => lowerText.includes(loc));
        if (location) {
          updates.location = location;
        }
      }
      break;
    }
  }

  // Color type
  for (const [colorType, keywords] of Object.entries(COLOR_TYPE_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      updates.colorType = colorType as ColorType;
      break;
    }
  }

  // Color name extraction
  for (const color of COLOR_NAMES) {
    if (lowerText.includes(color)) {
      updates.colorDescription = color;
      // Silver often implies metallic
      if (color === 'silver' && !updates.colorType) {
        inferences.colorType = {
          value: 'metallic',
          confidence: 0.85,
          source: 'text',
        };
      }
      break;
    }
  }

  // Size
  for (const [size, keywords] of Object.entries(SIZE_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      updates.size = size as SizeType;
      break;
    }
  }

  // Size from measurements (e.g., "10cm", "about 5cm")
  const sizeMatch = lowerText.match(/(\d+)\s*(cm|centimeter|mm|inch)/i);
  if (sizeMatch && !updates.size) {
    const value = parseInt(sizeMatch[1]);
    const unit = sizeMatch[2].toLowerCase();
    let cm = unit.includes('mm') ? value / 10 : unit.includes('inch') ? value * 2.54 : value;
    
    if (cm <= 1) updates.size = 'tiny';
    else if (cm <= 5) updates.size = 'small';
    else if (cm <= 15) updates.size = 'medium';
    else updates.size = 'large';
  }

  // Rust presence
  if (RUST_KEYWORDS.absent.some(kw => lowerText.includes(kw))) {
    updates.rustPresent = false;
  } else if (RUST_KEYWORDS.present.some(kw => lowerText.includes(kw))) {
    updates.rustPresent = true;
  }

  // Equipment
  for (const [equip, keywords] of Object.entries(EQUIPMENT_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      updates.equipment = equip as 'aerosol' | 'sprayGun' | 'none';
      break;
    }
  }

  return { updates, inferences };
}

// ============================================
// IMAGE ANALYSIS (MOCK)
// ============================================

const MOCK_IMAGE_SCENARIOS: ImageAnalysisResult[] = [
  {
    damageType: { value: 'scratch', confidence: 0.92 },
    damageDepth: { value: 'toMetal', confidence: 0.78 },
    rustPresent: { value: true, confidence: 0.95 },
    material: { value: 'metal', confidence: 0.85 },
    sizeEstimate: { value: 'medium', confidence: 0.7 },
    summary: 'I can see a scratch with rust developing. The damage appears to go down to bare metal, and there\'s some surface rust starting to form. It looks like it\'s on a metal panel.',
  },
  {
    damageType: { value: 'scratch', confidence: 0.88 },
    damageDepth: { value: 'throughClear', confidence: 0.82 },
    rustPresent: { value: false, confidence: 0.9 },
    material: { value: 'metal', confidence: 0.75 },
    colorType: { value: 'metallic', confidence: 0.6 },
    sizeEstimate: { value: 'small', confidence: 0.65 },
    summary: 'I see a scratch that\'s gone through the clear coat. No rust visible yet - looks like fresh damage. The color appears to be metallic.',
  },
  {
    damageType: { value: 'chip', confidence: 0.85 },
    damageDepth: { value: 'toPrimer', confidence: 0.7 },
    rustPresent: { value: false, confidence: 0.85 },
    material: { value: 'plastic', confidence: 0.8 },
    sizeEstimate: { value: 'tiny', confidence: 0.75 },
    summary: 'This looks like a stone chip on what appears to be a plastic bumper. It\'s gone through to the primer layer. No rust, as expected for plastic.',
  },
  {
    damageType: { value: 'rust', confidence: 0.95 },
    damageDepth: { value: 'toMetal', confidence: 0.9 },
    rustPresent: { value: true, confidence: 0.98 },
    material: { value: 'metal', confidence: 0.95 },
    sizeEstimate: { value: 'medium', confidence: 0.6 },
    summary: 'This is a rust spot that\'s developed over time. The metal is exposed and corroding. This will need rust treatment before any paint work.',
  },
];

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  // Simulate processing time
  await delay(800 + Math.random() * 700);
  
  // Return a random mock scenario for demonstration
  const scenario = MOCK_IMAGE_SCENARIOS[Math.floor(Math.random() * MOCK_IMAGE_SCENARIOS.length)];
  return scenario;
}

// ============================================
// QUESTION GENERATION
// ============================================

const QUESTIONS: Record<string, Question> = {
  damageDepth: {
    id: 'damageDepth',
    field: 'damageDepth',
    text: 'How deep is the damage?',
    helpText: 'Try running your fingernail across it: if it catches, it\'s more than surface level.',
    type: 'single-select',
    required: true,
    options: [
      {
        id: 'surface',
        label: 'Surface marks only',
        description: 'Light scratches you can barely feel',
        icon: '🟢',
        value: 'surface',
      },
      {
        id: 'throughClear',
        label: 'Through the clear coat',
        description: 'Different color visible beneath',
        icon: '🟡',
        value: 'throughClear',
      },
      {
        id: 'toMetal',
        label: 'Down to bare metal',
        description: 'Shiny metal or rust visible',
        icon: '🔴',
        value: 'toMetal',
      },
    ],
  },
  material: {
    id: 'material',
    field: 'material',
    text: 'What type of surface is damaged?',
    helpText: 'Bumpers are usually plastic. Doors, hoods, and fenders are usually metal.',
    type: 'single-select',
    required: true,
    options: [
      {
        id: 'metal',
        label: 'Metal',
        description: 'Door, fender, hood, trunk',
        icon: '🚗',
        value: 'metal',
      },
      {
        id: 'plastic',
        label: 'Plastic',
        description: 'Bumper, mirror housing, trim',
        icon: '🛡️',
        value: 'plastic',
      },
    ],
  },
  colorType: {
    id: 'colorType',
    field: 'colorType',
    text: 'What type of color is your car?',
    helpText: 'Look at it in sunlight - metallic colors have a sparkle, pearl colors shift color at angles.',
    type: 'single-select',
    required: false,
    options: [
      {
        id: 'solid',
        label: 'Solid / Flat',
        description: 'No sparkle or shimmer',
        icon: '⬜',
        value: 'solid',
      },
      {
        id: 'metallic',
        label: 'Metallic',
        description: 'Has sparkle/flakes in the paint',
        icon: '✨',
        value: 'metallic',
      },
      {
        id: 'pearl',
        label: 'Pearl / Mica',
        description: 'Color seems to shift at angles',
        icon: '🌈',
        value: 'pearl',
      },
    ],
  },
  rustPresent: {
    id: 'rustPresent',
    field: 'rustPresent',
    text: 'Is there any rust visible?',
    helpText: 'Look for orange or brown discoloration around the damaged area.',
    type: 'single-select',
    required: false,
    options: [
      {
        id: 'yes',
        label: 'Yes, rust visible',
        description: 'Orange/brown color in or around damage',
        icon: '🟠',
        value: true,
      },
      {
        id: 'no',
        label: 'No rust',
        description: 'Clean metal or paint only',
        icon: '✅',
        value: false,
      },
    ],
  },
  size: {
    id: 'size',
    field: 'size',
    text: 'How big is the damaged area?',
    type: 'single-select',
    required: false,
    options: [
      {
        id: 'tiny',
        label: 'Tiny (< 1cm)',
        description: 'Dot or small chip',
        value: 'tiny',
      },
      {
        id: 'small',
        label: 'Small (1-5cm)',
        description: 'Fingertip to palm-width',
        value: 'small',
      },
      {
        id: 'medium',
        label: 'Medium (5-15cm)',
        description: 'Palm-sized or larger',
        value: 'medium',
      },
      {
        id: 'large',
        label: 'Large (15cm+)',
        description: 'Major area or panel',
        value: 'large',
      },
    ],
  },
  colorDescription: {
    id: 'colorDescription',
    field: 'colorDescription',
    text: 'What color is your car?',
    helpText: 'This helps us recommend the right paint products.',
    type: 'text',
    required: false,
  },
  equipment: {
    id: 'equipment',
    field: 'equipment',
    text: 'What equipment do you have?',
    type: 'single-select',
    required: false,
    options: [
      {
        id: 'aerosol',
        label: 'None / Spray cans',
        description: 'I\'ll use aerosol products',
        icon: '🎨',
        value: 'aerosol',
      },
      {
        id: 'sprayGun',
        label: 'Spray gun & compressor',
        description: 'I have painting equipment',
        icon: '🔧',
        value: 'sprayGun',
      },
    ],
  },
};

export function generateQuestion(state: KnowledgeState): Question | null {
  const gap = getMostImportantGap(state);
  if (!gap) return null;
  
  return QUESTIONS[gap] || null;
}

// ============================================
// RESPONSE GENERATION
// ============================================

export interface AIResponse {
  type: 'understanding' | 'question' | 'solution-ready' | 'clarification' | 'direct-answer';
  message: string;
  understanding?: {
    confirmed: Array<{ field: string; value: string; }>;
    inferred: Array<{ field: string; value: string; confidence: number; }>;
    canCorrect: boolean;
  };
  question?: Question;
  readyForSolution?: boolean;
}

export function generateResponse(
  state: KnowledgeState,
  isFirstMessage: boolean,
  hasImage: boolean
): AIResponse {
  const hasConfirmed = Object.keys(state.confirmed).length > 0;
  const hasInferred = Object.keys(state.inferred).length > 0;
  const hasCriticalGaps = state.gaps.critical.length > 0;
  
  // Build understanding summary
  const confirmed = Object.entries(state.confirmed)
    .filter(([_, v]) => v !== undefined)
    .map(([field, value]) => ({
      field: formatFieldName(field),
      value: formatValue(field, value),
    }));
  
  const inferred = Object.entries(state.inferred)
    .filter(([_, v]) => v !== undefined)
    .map(([field, v]) => ({
      field: formatFieldName(field),
      value: formatValue(field, v!.value),
      confidence: v!.confidence,
    }));

  // Generate appropriate response
  if (!hasConfirmed && !hasInferred && isFirstMessage) {
    // Vague initial query
    return {
      type: 'clarification',
      message: "I'd love to help! Can you tell me more about what's going on with your paint? Or share a photo and I can take a look!",
    };
  }

  if (hasConfirmed || hasInferred) {
    const question = generateQuestion(state);
    
    if (!hasCriticalGaps) {
      // Ready to generate solution
      return {
        type: 'solution-ready',
        message: hasImage 
          ? "Based on your photo and what you've told me, I have enough to create your repair plan!"
          : "I have enough information to create your custom repair plan!",
        understanding: { confirmed, inferred, canCorrect: true },
        readyForSolution: true,
      };
    }

    // Need more info
    const understandingMsg = confirmed.length > 0 || inferred.length > 0
      ? "Here's what I understand so far:"
      : '';

    return {
      type: 'question',
      message: question
        ? `${understandingMsg ? understandingMsg + ' ' : ''}${question.text}`
        : "I need a bit more information to help you.",
      understanding: confirmed.length > 0 || inferred.length > 0 
        ? { confirmed, inferred, canCorrect: true }
        : undefined,
      question: question || undefined,
    };
  }

  return {
    type: 'clarification',
    message: "Could you describe the damage, or share a photo?",
  };
}

function formatFieldName(field: string): string {
  const names: Record<string, string> = {
    damageType: 'Damage type',
    damageDepth: 'Damage depth',
    material: 'Surface',
    rustPresent: 'Rust',
    colorType: 'Color type',
    colorDescription: 'Color',
    size: 'Size',
    equipment: 'Equipment',
    location: 'Location',
  };
  return names[field] || field;
}

function formatValue(field: string, value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  const valueLabels: Record<string, Record<string, string>> = {
    damageType: {
      scratch: 'Scratch',
      rust: 'Rust damage',
      chip: 'Stone chip',
      dent: 'Dent',
      fade: 'Faded paint',
      peel: 'Peeling paint',
    },
    damageDepth: {
      surface: 'Surface marks only',
      throughClear: 'Through clear coat',
      toPrimer: 'Down to primer',
      toMetal: 'Down to bare metal',
    },
    material: {
      metal: 'Metal panel',
      plastic: 'Plastic',
      fiberglass: 'Fiberglass',
      mixed: 'Mixed materials',
    },
    colorType: {
      solid: 'Solid',
      metallic: 'Metallic',
      pearl: 'Pearl/Mica',
      tricoat: 'Tri-coat',
    },
    size: {
      tiny: 'Tiny (<1cm)',
      small: 'Small (1-5cm)',
      medium: 'Medium (5-15cm)',
      large: 'Large (15cm+)',
    },
    equipment: {
      aerosol: 'Spray cans',
      sprayGun: 'Spray gun',
      none: 'None',
    },
  };
  
  if (valueLabels[field] && valueLabels[field][value]) {
    return valueLabels[field][value];
  }
  
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export { QUESTIONS };
