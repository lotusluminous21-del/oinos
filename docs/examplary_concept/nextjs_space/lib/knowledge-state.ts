import type { KnowledgeState, DamageType, DamageDepth, MaterialType, ColorType, SizeType } from './types';

export function createInitialKnowledgeState(): KnowledgeState {
  return {
    confirmed: {},
    inferred: {},
    gaps: {
      critical: ['damageDepth', 'material'],
      important: ['colorType', 'rustPresent', 'size'],
      optional: ['equipment', 'colorCode', 'vehicleInfo'],
    },
  };
}

export function updateGaps(state: KnowledgeState): KnowledgeState {
  const criticalFields = ['damageDepth', 'material'];
  const importantFields = ['colorType', 'rustPresent', 'size'];
  const optionalFields = ['equipment', 'colorCode', 'vehicleInfo'];

  const isKnown = (field: string): boolean => {
    const confirmed = state.confirmed[field as keyof typeof state.confirmed];
    const inferred = state.inferred[field as keyof typeof state.inferred];
    
    if (confirmed !== undefined) return true;
    if (inferred && inferred.confidence >= 0.7) return true;
    return false;
  };

  // If we only have surface damage, we don't need material info
  const depth = state.confirmed.damageDepth || state.inferred.damageDepth?.value;
  const adjustedCritical = depth === 'surface' 
    ? criticalFields.filter(f => f !== 'material')
    : criticalFields;

  // If no paint repair needed, we don't need color info
  const adjustedImportant = depth === 'surface'
    ? importantFields.filter(f => f !== 'colorType')
    : importantFields;

  return {
    ...state,
    gaps: {
      critical: adjustedCritical.filter(f => !isKnown(f)),
      important: adjustedImportant.filter(f => !isKnown(f)),
      optional: optionalFields.filter(f => !isKnown(f)),
    },
  };
}

export function isReadyForSolution(state: KnowledgeState): boolean {
  return state.gaps.critical.length === 0;
}

export function getConfidenceLevel(state: KnowledgeState): 'high' | 'medium' | 'low' {
  const confirmedCount = Object.keys(state.confirmed).length;
  const inferredHighConf = Object.values(state.inferred).filter(v => v && v.confidence >= 0.8).length;
  const total = confirmedCount + inferredHighConf;
  
  if (total >= 5) return 'high';
  if (total >= 3) return 'medium';
  return 'low';
}

export function getMostImportantGap(state: KnowledgeState): string | null {
  if (state.gaps.critical.length > 0) {
    return state.gaps.critical[0];
  }
  if (state.gaps.important.length > 0) {
    return state.gaps.important[0];
  }
  return null;
}

export function getEffectiveValue<T>(
  state: KnowledgeState,
  field: keyof KnowledgeState['confirmed']
): T | undefined {
  const confirmed = state.confirmed[field];
  if (confirmed !== undefined) return confirmed as T;
  
  const inferred = state.inferred[field as keyof KnowledgeState['inferred']];
  if (inferred && inferred.confidence >= 0.6) {
    return inferred.value as T;
  }
  
  return undefined;
}

// Default values for optional fields when generating solution
export const DEFAULTS = {
  equipment: 'aerosol' as const,
  size: 'medium' as const,
  rustPresent: false,
  colorType: 'metallic' as const,
};
