export const CATEGORY_IMAGE_MAP: Record<string, string> = {
    "Προετοιμασία & Καθαρισμός": "/images/categories/cleaning-prep.png",
    "Αστάρια & Υποστρώματα": "/images/categories/primers-substrates.png",
    "Χρώματα Βάσης": "/images/categories/base-colors.png",
    "Βερνίκια & Φινιρίσματα": "/images/categories/varnish-finishes.png",
    "Σκληρυντές & Ενεργοποιητές": "/images/categories/hardeners-activators.png",
    "Στόκοι & Πλαστελίνες": "/images/categories/putty-fillers.png",
    "Πινέλα & Εργαλεία": "/images/categories/brushes-tools.png",
    "Διαλυτικά & Αραιωτικά": "/images/categories/thinners-solvents.png",
    "Αξεσουάρ": "/images/categories/accessories.png",
    "default": "/images/categories/brushes-tools.png",
};

export const CATEGORY_ORDER = [
    "Προετοιμασία & Καθαρισμός",
    "Στόκοι & Πλαστελίνες",
    "Αστάρια & Υποστρώματα",
    "Χρώματα Βάσης",
    "Σκληρυντές & Ενεργοποιητές",
    "Βερνίκια & Φινιρίσματα",
    "Διαλυτικά & Αραιωτικά",
    "Πινέλα & Εργαλεία",
    "Αξεσουάρ",
    "Άλλο",
];

export const getCategoryOrder = (category: string) => {
    const index = CATEGORY_ORDER.indexOf(category);
    return index === -1 ? 999 : index;
};

export const getCategoryImage = (category: string) => {
    return CATEGORY_IMAGE_MAP[category] || CATEGORY_IMAGE_MAP.default;
};
