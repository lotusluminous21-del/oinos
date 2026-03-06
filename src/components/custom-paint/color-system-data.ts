// src/components/custom-paint/color-system-data.ts
// Static data for color systems, RAL Classic table (full 216), car manufacturers, and validation

export type ColorSystem = 'RAL' | 'OEM' | 'description';

export interface ColorSystemOption {
    id: ColorSystem;
    label: string;
    description: string;
    placeholder: string;
    helpText: string;
    icon: string;
}

export const COLOR_SYSTEMS: ColorSystemOption[] = [
    {
        id: 'RAL',
        label: 'RAL',
        description: 'Ευρωπαϊκό πρότυπο χρωμάτων',
        placeholder: 'π.χ. RAL 7016',
        helpText: 'Ο κωδικός RAL βρίσκεται στην ετικέτα του δοχείου ή στο χρωματολόγιο. Μορφή: RAL + 4ψήφιος αριθμός.',
        icon: '🎨',
    },
    {
        id: 'OEM',
        label: 'Αυτοκίνητο (OEM)',
        description: 'Κωδικός κατασκευαστή οχήματος',
        placeholder: 'π.χ. LY9T, 070, 1G3',
        helpText: 'Ο κωδικός χρώματος βρίσκεται σε ετικέτα στο εσωτερικό της πόρτας οδηγού, στο καπό ή στο βιβλίο service.',
        icon: '🚗',
    },
    {
        id: 'description',
        label: 'Περιγραφή / Δείγμα',
        description: 'Δεν ξέρω τον ακριβή κωδικό',
        placeholder: 'π.χ. σκούρο πράσινο σαν φύλλο ελιάς',
        helpText: 'Περιγράψτε το χρώμα όσο πιο αναλυτικά μπορείτε. Για ακριβή αντιστοιχία χρώματος, προτείνουμε επίσκεψη στο κατάστημά μας με δείγμα.',
        icon: '✏️',
    },
];

// Full RAL Classic dataset (216 colors)
// code → hex → Greek name → English name
export interface RALColor {
    code: string;
    hex: string;
    name: string;
    nameEn: string;
}

export const RAL_COLORS: RALColor[] = [
    // ── 1xxx: Yellows ──
    { code: '1000', hex: '#BEBD7F', name: 'Πράσινο Μπεζ', nameEn: 'Green Beige' },
    { code: '1001', hex: '#C2B078', name: 'Μπεζ', nameEn: 'Beige' },
    { code: '1002', hex: '#C6A961', name: 'Αμμώδες Κίτρινο', nameEn: 'Sand Yellow' },
    { code: '1003', hex: '#E5BE01', name: 'Σηματοδοτικό Κίτρινο', nameEn: 'Signal Yellow' },
    { code: '1004', hex: '#CDA434', name: 'Χρυσοκίτρινο', nameEn: 'Golden Yellow' },
    { code: '1005', hex: '#A98307', name: 'Μελί Κίτρινο', nameEn: 'Honey Yellow' },
    { code: '1006', hex: '#E4A010', name: 'Κίτρινο Καλαμποκιού', nameEn: 'Maize Yellow' },
    { code: '1007', hex: '#DC9D00', name: 'Κίτρινο Χρυσαφί', nameEn: 'Daffodil Yellow' },
    { code: '1011', hex: '#8A6642', name: 'Καφέ Μπεζ', nameEn: 'Brown Beige' },
    { code: '1012', hex: '#C7B446', name: 'Κίτρινο Λεμονί', nameEn: 'Lemon Yellow' },
    { code: '1013', hex: '#EAE6CA', name: 'Λευκό Μαργαριτάρι', nameEn: 'Oyster White' },
    { code: '1014', hex: '#E1CC4F', name: 'Ιβουάρ', nameEn: 'Ivory' },
    { code: '1015', hex: '#E6D690', name: 'Ελαφρύ Ιβουάρ', nameEn: 'Light Ivory' },
    { code: '1016', hex: '#EDFF21', name: 'Κίτρινο Θειαφιού', nameEn: 'Sulfur Yellow' },
    { code: '1017', hex: '#F5D033', name: 'Κίτρινο Σαφράν', nameEn: 'Saffron Yellow' },
    { code: '1018', hex: '#F8F32B', name: 'Ψυχρό Κίτρινο', nameEn: 'Zinc Yellow' },
    { code: '1019', hex: '#9E9764', name: 'Γκρι Μπεζ', nameEn: 'Grey Beige' },
    { code: '1020', hex: '#999950', name: 'Κίτρινο Ελιάς', nameEn: 'Olive Yellow' },
    { code: '1021', hex: '#F3DA0B', name: 'Κίτρινο Κάδμιο', nameEn: 'Colza Yellow' },
    { code: '1023', hex: '#FAD201', name: 'Κυκλοφοριακό Κίτρινο', nameEn: 'Traffic Yellow' },
    { code: '1024', hex: '#AEA04B', name: 'Κίτρινο Ώχρα', nameEn: 'Ochre Yellow' },
    { code: '1026', hex: '#FFFF00', name: 'Φωσφοριζέ Κίτρινο', nameEn: 'Luminous Yellow' },
    { code: '1027', hex: '#9D9101', name: 'Κίτρινο Κάρυ', nameEn: 'Curry' },
    { code: '1028', hex: '#F4A900', name: 'Κίτρινο Πεπονιού', nameEn: 'Melon Yellow' },
    { code: '1032', hex: '#D6AE01', name: 'Κίτρινο Σπαρτού', nameEn: 'Broom Yellow' },
    { code: '1033', hex: '#F3A505', name: 'Κίτρινο Νταλία', nameEn: 'Dahlia Yellow' },
    { code: '1034', hex: '#EFA94A', name: 'Κίτρινο Παστέλ', nameEn: 'Pastel Yellow' },
    { code: '1035', hex: '#6A5D4D', name: 'Μπεζ Μαργαριτάρι', nameEn: 'Pearl Beige' },
    { code: '1036', hex: '#705335', name: 'Χρυσό Μαργαριτάρι', nameEn: 'Pearl Gold' },
    { code: '1037', hex: '#F39F18', name: 'Κίτρινο Ηλίου', nameEn: 'Sun Yellow' },

    // ── 2xxx: Oranges ──
    { code: '2000', hex: '#ED760E', name: 'Κίτρινο Πορτοκαλί', nameEn: 'Yellow Orange' },
    { code: '2001', hex: '#C93C20', name: 'Κόκκινο Πορτοκαλί', nameEn: 'Red Orange' },
    { code: '2002', hex: '#CB2821', name: 'Βερμίλιον', nameEn: 'Vermilion' },
    { code: '2003', hex: '#FF7514', name: 'Πορτοκαλί Παστέλ', nameEn: 'Pastel Orange' },
    { code: '2004', hex: '#F44611', name: 'Καθαρό Πορτοκαλί', nameEn: 'Pure Orange' },
    { code: '2005', hex: '#FF2301', name: 'Φωσφοριζέ Πορτοκαλί', nameEn: 'Luminous Orange' },
    { code: '2007', hex: '#FFA420', name: 'Φωσφοριζέ Ανοιχτό Πορτοκαλί', nameEn: 'Luminous Bright Orange' },
    { code: '2008', hex: '#F75E25', name: 'Ανοιχτό Κόκκινο Πορτοκαλί', nameEn: 'Bright Red Orange' },
    { code: '2009', hex: '#F54021', name: 'Κυκλοφοριακό Πορτοκαλί', nameEn: 'Traffic Orange' },
    { code: '2010', hex: '#D84B20', name: 'Σηματοδοτικό Πορτοκαλί', nameEn: 'Signal Orange' },
    { code: '2011', hex: '#EC7C26', name: 'Βαθύ Πορτοκαλί', nameEn: 'Deep Orange' },
    { code: '2012', hex: '#E55137', name: 'Πορτοκαλί Σολομού', nameEn: 'Salmon Orange' },
    { code: '2013', hex: '#C35831', name: 'Πορτοκαλί Μαργαριτάρι', nameEn: 'Pearl Orange' },

    // ── 3xxx: Reds ──
    { code: '3000', hex: '#AF2B1E', name: 'Πυρίμαχο Κόκκινο', nameEn: 'Flame Red' },
    { code: '3001', hex: '#A52019', name: 'Σηματοδοτικό Κόκκινο', nameEn: 'Signal Red' },
    { code: '3002', hex: '#A2231D', name: 'Κόκκινο Καρμίνι', nameEn: 'Carmine Red' },
    { code: '3003', hex: '#9B111E', name: 'Ρουμπινί Κόκκινο', nameEn: 'Ruby Red' },
    { code: '3004', hex: '#75151E', name: 'Πορφυρό Κόκκινο', nameEn: 'Purple Red' },
    { code: '3005', hex: '#5E2129', name: 'Κρασί Κόκκινο', nameEn: 'Wine Red' },
    { code: '3007', hex: '#3E2B2E', name: 'Μαύρο Κόκκινο', nameEn: 'Black Red' },
    { code: '3009', hex: '#6C3631', name: 'Σκουριά Κόκκινο', nameEn: 'Oxide Red' },
    { code: '3011', hex: '#781F19', name: 'Καφέ Κόκκινο', nameEn: 'Brown Red' },
    { code: '3012', hex: '#C1876B', name: 'Μπεζ Κόκκινο', nameEn: 'Beige Red' },
    { code: '3013', hex: '#A12312', name: 'Ντομάτα Κόκκινο', nameEn: 'Tomato Red' },
    { code: '3014', hex: '#D36E70', name: 'Ροζ Αντίκα', nameEn: 'Antique Pink' },
    { code: '3015', hex: '#EA899A', name: 'Ανοιχτό Ροζ', nameEn: 'Light Pink' },
    { code: '3016', hex: '#B32821', name: 'Κοράλλι Κόκκινο', nameEn: 'Coral Red' },
    { code: '3017', hex: '#E63244', name: 'Ροζέ', nameEn: 'Rose' },
    { code: '3018', hex: '#D53032', name: 'Φράουλα Κόκκινο', nameEn: 'Strawberry Red' },
    { code: '3020', hex: '#CC0605', name: 'Κόκκινο Κυκλοφορίας', nameEn: 'Traffic Red' },
    { code: '3022', hex: '#D95030', name: 'Σολομού Κόκκινο', nameEn: 'Salmon Pink' },
    { code: '3024', hex: '#F80000', name: 'Φωσφοριζέ Κόκκινο', nameEn: 'Luminous Red' },
    { code: '3026', hex: '#FE0000', name: 'Φωσφοριζέ Ανοιχτό Κόκκινο', nameEn: 'Luminous Bright Red' },
    { code: '3027', hex: '#C51D34', name: 'Βατόμουρο Κόκκινο', nameEn: 'Raspberry Red' },
    { code: '3028', hex: '#CB3234', name: 'Καθαρό Κόκκινο', nameEn: 'Pure Red' },
    { code: '3031', hex: '#B32428', name: 'Ανατολίτικο Κόκκινο', nameEn: 'Orient Red' },
    { code: '3032', hex: '#721422', name: 'Μαργαριτάρι Ρουμπινί', nameEn: 'Pearl Ruby Red' },
    { code: '3033', hex: '#B44C43', name: 'Μαργαριτάρι Ροζ', nameEn: 'Pearl Pink' },

    // ── 4xxx: Violets ──
    { code: '4001', hex: '#6D3461', name: 'Κόκκινο Μωβ', nameEn: 'Red Lilac' },
    { code: '4002', hex: '#922B3E', name: 'Κόκκινο Βιολέ', nameEn: 'Red Violet' },
    { code: '4003', hex: '#DE4C8A', name: 'Ερίκα Βιολέ', nameEn: 'Heather Violet' },
    { code: '4004', hex: '#641C34', name: 'Μπορντό Βιολέ', nameEn: 'Claret Violet' },
    { code: '4005', hex: '#6C4675', name: 'Μπλε Μωβ', nameEn: 'Blue Lilac' },
    { code: '4006', hex: '#A03472', name: 'Κυκλοφοριακό Μωβ', nameEn: 'Traffic Purple' },
    { code: '4007', hex: '#4A192C', name: 'Βιολέ Μωβ', nameEn: 'Purple Violet' },
    { code: '4008', hex: '#924E7D', name: 'Σηματοδοτικό Βιολέ', nameEn: 'Signal Violet' },
    { code: '4009', hex: '#A18594', name: 'Παστέλ Βιολέ', nameEn: 'Pastel Violet' },
    { code: '4010', hex: '#CF3476', name: 'Τηλε-Ματζέντα', nameEn: 'Telemagenta' },
    { code: '4011', hex: '#8673A1', name: 'Μαργαριτάρι Βιολέ', nameEn: 'Pearl Violet' },
    { code: '4012', hex: '#6C6874', name: 'Μαργαριτάρι Μούρο', nameEn: 'Pearl Blackberry' },

    // ── 5xxx: Blues ──
    { code: '5000', hex: '#354D73', name: 'Βιολέ Μπλε', nameEn: 'Violet Blue' },
    { code: '5001', hex: '#1F3438', name: 'Πράσινο Μπλε', nameEn: 'Green Blue' },
    { code: '5002', hex: '#20214F', name: 'Ουλτραμαρίν Μπλε', nameEn: 'Ultramarine Blue' },
    { code: '5003', hex: '#1D1E33', name: 'Ζαφείρι Μπλε', nameEn: 'Sapphire Blue' },
    { code: '5004', hex: '#18171C', name: 'Μαύρο Μπλε', nameEn: 'Black Blue' },
    { code: '5005', hex: '#1E2460', name: 'Σηματοδοτικό Μπλε', nameEn: 'Signal Blue' },
    { code: '5007', hex: '#3E5F8A', name: 'Μπριγιάν Μπλε', nameEn: 'Brilliant Blue' },
    { code: '5008', hex: '#26252D', name: 'Γκρι Μπλε', nameEn: 'Grey Blue' },
    { code: '5009', hex: '#025669', name: 'Αζούρ Μπλε', nameEn: 'Azure Blue' },
    { code: '5010', hex: '#0E294B', name: 'Μπλε Εντζιάν', nameEn: 'Gentian Blue' },
    { code: '5011', hex: '#231A24', name: 'Ατσάλι Μπλε', nameEn: 'Steel Blue' },
    { code: '5012', hex: '#3B83BD', name: 'Ανοιχτό Μπλε', nameEn: 'Light Blue' },
    { code: '5013', hex: '#1E213D', name: 'Κοβάλτιο Μπλε', nameEn: 'Cobalt Blue' },
    { code: '5014', hex: '#606E8C', name: 'Περιστέρι Μπλε', nameEn: 'Pigeon Blue' },
    { code: '5015', hex: '#2271B3', name: 'Μπλε Ουρανού', nameEn: 'Sky Blue' },
    { code: '5017', hex: '#063971', name: 'Κυκλοφοριακό Μπλε', nameEn: 'Traffic Blue' },
    { code: '5018', hex: '#3F888F', name: 'Τουρκουάζ Μπλε', nameEn: 'Turquoise Blue' },
    { code: '5019', hex: '#1B5583', name: 'Μπλε Καπρί', nameEn: 'Capri Blue' },
    { code: '5020', hex: '#1D334A', name: 'Μπλε Ωκεανού', nameEn: 'Ocean Blue' },
    { code: '5021', hex: '#256D7B', name: 'Μπλε Νερού', nameEn: 'Water Blue' },
    { code: '5022', hex: '#252850', name: 'Νυχτερινό Μπλε', nameEn: 'Night Blue' },
    { code: '5023', hex: '#49678D', name: 'Μακρινό Μπλε', nameEn: 'Distant Blue' },
    { code: '5024', hex: '#5D9B9B', name: 'Μπλε Παστέλ', nameEn: 'Pastel Blue' },
    { code: '5025', hex: '#2A6478', name: 'Μαργαριτάρι Εντζιάν', nameEn: 'Pearl Gentian Blue' },
    { code: '5026', hex: '#102C54', name: 'Μαργαριτάρι Νυχτερινό Μπλε', nameEn: 'Pearl Night Blue' },

    // ── 6xxx: Greens ──
    { code: '6000', hex: '#316650', name: 'Πράσινο Πατίνας', nameEn: 'Patina Green' },
    { code: '6001', hex: '#287233', name: 'Σμαραγδί Πράσινο', nameEn: 'Emerald Green' },
    { code: '6002', hex: '#2D572C', name: 'Φύλλο Πράσινο', nameEn: 'Leaf Green' },
    { code: '6003', hex: '#424632', name: 'Πράσινο Ελιάς', nameEn: 'Olive Green' },
    { code: '6004', hex: '#1F3A3D', name: 'Μπλε Πράσινο', nameEn: 'Blue Green' },
    { code: '6005', hex: '#2F4538', name: 'Πράσινο Βρύο', nameEn: 'Moss Green' },
    { code: '6006', hex: '#3E3B32', name: 'Γκρι Ελιάς', nameEn: 'Grey Olive' },
    { code: '6007', hex: '#343B29', name: 'Πράσινο Μπουκαλιού', nameEn: 'Bottle Green' },
    { code: '6008', hex: '#39352A', name: 'Καφέ Πράσινο', nameEn: 'Brown Green' },
    { code: '6009', hex: '#31372B', name: 'Πράσινο Πεύκου', nameEn: 'Fir Green' },
    { code: '6010', hex: '#35682D', name: 'Πράσινο Χορταριού', nameEn: 'Grass Green' },
    { code: '6011', hex: '#587246', name: 'Πράσινο Ρεζέντα', nameEn: 'Reseda Green' },
    { code: '6012', hex: '#343E40', name: 'Μαύρο Πράσινο', nameEn: 'Black Green' },
    { code: '6013', hex: '#6C7156', name: 'Πράσινο Καλαμιού', nameEn: 'Reed Green' },
    { code: '6014', hex: '#47402E', name: 'Κίτρινο Ελιάς', nameEn: 'Yellow Olive' },
    { code: '6015', hex: '#3B3C36', name: 'Μαύρο Ελιάς', nameEn: 'Black Olive' },
    { code: '6016', hex: '#1E5945', name: 'Τουρκουάζ Πράσινο', nameEn: 'Turquoise Green' },
    { code: '6017', hex: '#4C9141', name: 'Πράσινο Μαΐου', nameEn: 'May Green' },
    { code: '6018', hex: '#57A639', name: 'Πράσινο Κιτρινωπό', nameEn: 'Yellow Green' },
    { code: '6019', hex: '#BDECB6', name: 'Λευκό Πράσινο', nameEn: 'Pastel Green' },
    { code: '6020', hex: '#2E3A23', name: 'Πράσινο Χρωμίου', nameEn: 'Chrome Green' },
    { code: '6021', hex: '#89AC76', name: 'Ωχρό Πράσινο', nameEn: 'Pale Green' },
    { code: '6022', hex: '#25221B', name: 'Πράσινο Ελιάς Καφέ', nameEn: 'Olive Drab' },
    { code: '6024', hex: '#308446', name: 'Κυκλοφοριακό Πράσινο', nameEn: 'Traffic Green' },
    { code: '6025', hex: '#3D642D', name: 'Πράσινο Φτέρης', nameEn: 'Fern Green' },
    { code: '6026', hex: '#015D52', name: 'Πράσινο Οπάλ', nameEn: 'Opal Green' },
    { code: '6027', hex: '#84C3BE', name: 'Ανοιχτό Πράσινο', nameEn: 'Light Green' },
    { code: '6028', hex: '#2C5545', name: 'Πράσινο Πεύκου', nameEn: 'Pine Green' },
    { code: '6029', hex: '#20603D', name: 'Πράσινο Μέντα', nameEn: 'Mint Green' },
    { code: '6032', hex: '#317F43', name: 'Σηματοδοτικό Πράσινο', nameEn: 'Signal Green' },
    { code: '6033', hex: '#497E76', name: 'Πράσινο Μέντα Μαργαριτάρι', nameEn: 'Mint Turquoise' },
    { code: '6034', hex: '#7FB5B5', name: 'Παστέλ Τουρκουάζ', nameEn: 'Pastel Turquoise' },
    { code: '6035', hex: '#1C542D', name: 'Μαργαριτάρι Πράσινο', nameEn: 'Pearl Green' },
    { code: '6036', hex: '#193737', name: 'Μαργαριτάρι Οπάλ Πράσινο', nameEn: 'Pearl Opal Green' },
    { code: '6037', hex: '#008F39', name: 'Καθαρό Πράσινο', nameEn: 'Pure Green' },
    { code: '6038', hex: '#00BB2D', name: 'Φωσφοριζέ Πράσινο', nameEn: 'Luminous Green' },

    // ── 7xxx: Greys ──
    { code: '7000', hex: '#78858B', name: 'Γκρι Σκίουρου', nameEn: 'Squirrel Grey' },
    { code: '7001', hex: '#8A9597', name: 'Ασημί Γκρι', nameEn: 'Silver Grey' },
    { code: '7002', hex: '#7E7B52', name: 'Πράσινο Γκρι Ελιάς', nameEn: 'Olive Grey' },
    { code: '7003', hex: '#6C7059', name: 'Γκρι Βρύο', nameEn: 'Moss Grey' },
    { code: '7004', hex: '#969992', name: 'Σηματοδοτικό Γκρι', nameEn: 'Signal Grey' },
    { code: '7005', hex: '#646B63', name: 'Γκρι Ποντικού', nameEn: 'Mouse Grey' },
    { code: '7006', hex: '#6D6552', name: 'Μπεζ Γκρι', nameEn: 'Beige Grey' },
    { code: '7008', hex: '#6A5F31', name: 'Χακί Γκρι', nameEn: 'Khaki Grey' },
    { code: '7009', hex: '#4D5645', name: 'Πράσινο Γκρι', nameEn: 'Green Grey' },
    { code: '7010', hex: '#4C514A', name: 'Μπρεζέν Γκρι', nameEn: 'Tarpaulin Grey' },
    { code: '7011', hex: '#434B4D', name: 'Σιδερί Γκρι', nameEn: 'Iron Grey' },
    { code: '7012', hex: '#4E5754', name: 'Βασάλτης Γκρι', nameEn: 'Basalt Grey' },
    { code: '7013', hex: '#464531', name: 'Καφέ Γκρι', nameEn: 'Brown Grey' },
    { code: '7015', hex: '#434750', name: 'Σχιστολιθικό Γκρι', nameEn: 'Slate Grey' },
    { code: '7016', hex: '#293133', name: 'Ανθρακί', nameEn: 'Anthracite Grey' },
    { code: '7021', hex: '#23282B', name: 'Μαύρο Γκρι', nameEn: 'Black Grey' },
    { code: '7022', hex: '#332F2C', name: 'Σκιά Γκρι', nameEn: 'Umbra Grey' },
    { code: '7023', hex: '#686C5E', name: 'Γκρι Τσιμέντο', nameEn: 'Concrete Grey' },
    { code: '7024', hex: '#474A51', name: 'Γραφίτης', nameEn: 'Graphite Grey' },
    { code: '7026', hex: '#374447', name: 'Γκρι Γρανίτη', nameEn: 'Granite Grey' },
    { code: '7030', hex: '#8B8C7A', name: 'Πέτρινο Γκρι', nameEn: 'Stone Grey' },
    { code: '7031', hex: '#474B4E', name: 'Μπλε Γκρι', nameEn: 'Blue Grey' },
    { code: '7032', hex: '#B8B799', name: 'Γκρι Βοτσαλάκι', nameEn: 'Pebble Grey' },
    { code: '7033', hex: '#7D8471', name: 'Γκρι Τσιμέντο', nameEn: 'Cement Grey' },
    { code: '7034', hex: '#8F8B66', name: 'Γκρι Κίτρινο', nameEn: 'Yellow Grey' },
    { code: '7035', hex: '#D7D7D7', name: 'Ανοιχτό Γκρι', nameEn: 'Light Grey' },
    { code: '7036', hex: '#7F7679', name: 'Γκρι Πλατίνα', nameEn: 'Platinum Grey' },
    { code: '7037', hex: '#7D7F7D', name: 'Γκρι Σκόνης', nameEn: 'Dusty Grey' },
    { code: '7038', hex: '#B5B8B1', name: 'Αχάτης Γκρι', nameEn: 'Agate Grey' },
    { code: '7039', hex: '#6C6960', name: 'Γκρι Χαλαζία', nameEn: 'Quartz Grey' },
    { code: '7040', hex: '#9DA1AA', name: 'Γκρι Παράθυρου', nameEn: 'Window Grey' },
    { code: '7042', hex: '#8D948D', name: 'Κυκλοφοριακό Γκρι Α', nameEn: 'Traffic Grey A' },
    { code: '7043', hex: '#4E5452', name: 'Κυκλοφοριακό Γκρι Β', nameEn: 'Traffic Grey B' },
    { code: '7044', hex: '#CAC4B0', name: 'Μεταξωτό Γκρι', nameEn: 'Silk Grey' },
    { code: '7045', hex: '#909090', name: 'Τηλε-Γκρι 1', nameEn: 'Telegrey 1' },
    { code: '7046', hex: '#82898F', name: 'Τηλε-Γκρι 2', nameEn: 'Telegrey 2' },
    { code: '7047', hex: '#D0D0D0', name: 'Τηλε-Γκρι 4', nameEn: 'Telegrey 4' },
    { code: '7048', hex: '#898176', name: 'Μαργαριτάρι Γκρι Ποντικού', nameEn: 'Pearl Mouse Grey' },

    // ── 8xxx: Browns ──
    { code: '8000', hex: '#826C34', name: 'Πράσινο Καφέ', nameEn: 'Green Brown' },
    { code: '8001', hex: '#955F20', name: 'Ώχρα Καφέ', nameEn: 'Ochre Brown' },
    { code: '8002', hex: '#6C3B2A', name: 'Σηματοδοτικό Καφέ', nameEn: 'Signal Brown' },
    { code: '8003', hex: '#734222', name: 'Πηλός Καφέ', nameEn: 'Clay Brown' },
    { code: '8004', hex: '#8E402A', name: 'Χάλκινο Καφέ', nameEn: 'Copper Brown' },
    { code: '8007', hex: '#59351F', name: 'Ελαφί Καφέ', nameEn: 'Fawn Brown' },
    { code: '8008', hex: '#6F4F28', name: 'Πράσινο Ελιάς Καφέ', nameEn: 'Olive Brown' },
    { code: '8011', hex: '#5B3A29', name: 'Καρυδί', nameEn: 'Nut Brown' },
    { code: '8012', hex: '#592321', name: 'Κόκκινο Καφέ', nameEn: 'Red Brown' },
    { code: '8014', hex: '#382C1E', name: 'Σέπια Καφέ', nameEn: 'Sepia Brown' },
    { code: '8015', hex: '#633A34', name: 'Κάστανο', nameEn: 'Chestnut Brown' },
    { code: '8016', hex: '#4C2F27', name: 'Μαόνι Καφέ', nameEn: 'Mahogany Brown' },
    { code: '8017', hex: '#45322E', name: 'Σοκολατί', nameEn: 'Chocolate Brown' },
    { code: '8019', hex: '#403A3A', name: 'Γκρι Καφέ', nameEn: 'Grey Brown' },
    { code: '8022', hex: '#212121', name: 'Μαύρο Καφέ', nameEn: 'Black Brown' },
    { code: '8023', hex: '#A65E2E', name: 'Πορτοκαλί Καφέ', nameEn: 'Orange Brown' },
    { code: '8024', hex: '#79553D', name: 'Μπεζ Καφέ', nameEn: 'Beige Brown' },
    { code: '8025', hex: '#755C48', name: 'Ωχρό Καφέ', nameEn: 'Pale Brown' },
    { code: '8028', hex: '#4E3B31', name: 'Τέρα Καφέ', nameEn: 'Terra Brown' },
    { code: '8029', hex: '#763C28', name: 'Μαργαριτάρι Χάλκινο', nameEn: 'Pearl Copper' },

    // ── 9xxx: Blacks & Whites ──
    { code: '9001', hex: '#FDF4E3', name: 'Κρεμ', nameEn: 'Cream' },
    { code: '9002', hex: '#E7EBDA', name: 'Λευκό Γκρι', nameEn: 'Grey White' },
    { code: '9003', hex: '#F4F4F4', name: 'Σηματοδοτικό Λευκό', nameEn: 'Signal White' },
    { code: '9004', hex: '#282828', name: 'Σηματοδοτικό Μαύρο', nameEn: 'Signal Black' },
    { code: '9005', hex: '#0A0A0A', name: 'Βαθύ Μαύρο', nameEn: 'Jet Black' },
    { code: '9006', hex: '#A5A5A5', name: 'Λευκό Αλουμινίου', nameEn: 'White Aluminium' },
    { code: '9007', hex: '#8F8F8F', name: 'Γκρι Αλουμινίου', nameEn: 'Grey Aluminium' },
    { code: '9010', hex: '#FFFFFF', name: 'Καθαρό Λευκό', nameEn: 'Pure White' },
    { code: '9011', hex: '#1C1C1C', name: 'Γραφίτης Μαύρο', nameEn: 'Graphite Black' },
    { code: '9016', hex: '#F6F6F6', name: 'Κυκλοφοριακό Λευκό', nameEn: 'Traffic White' },
    { code: '9017', hex: '#1E1E1E', name: 'Κυκλοφοριακό Μαύρο', nameEn: 'Traffic Black' },
    { code: '9018', hex: '#D7D7D7', name: 'Λευκό Πάπυρου', nameEn: 'Papyrus White' },
    { code: '9022', hex: '#9C9C9C', name: 'Μαργαριτάρι Ανοιχτό Γκρι', nameEn: 'Pearl Light Grey' },
    { code: '9023', hex: '#828282', name: 'Μαργαριτάρι Σκούρο Γκρι', nameEn: 'Pearl Dark Grey' },
];

// Greek-market car manufacturers
export const CAR_MANUFACTURERS = [
    'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford', 'Honda',
    'Hyundai', 'Jeep', 'Kia', 'Mazda', 'Mercedes-Benz', 'Mitsubishi',
    'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Škoda',
    'Smart', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo',
    'Alfa Romeo', 'Land Rover', 'Mini', 'Porsche', 'Tesla', 'Άλλο',
];

// Validation patterns per color system
export const COLOR_CODE_PATTERNS: Record<ColorSystem, RegExp | null> = {
    RAL: /^(RAL\s?)?[0-9]{4}$/i,
    OEM: null, // No universal pattern — each manufacturer differs
    description: null, // Free text
};

/**
 * Look up a RAL code and return the hex color. Returns null if not found.
 */
export function lookupRALHex(code: string): string | null {
    const cleaned = code.replace(/^RAL\s*/i, '').trim();
    const match = RAL_COLORS.find(c => c.code === cleaned);
    return match?.hex ?? null;
}

/**
 * Look up a RAL code and return the Greek name. Returns null if not found.
 */
export function lookupRALName(code: string): string | null {
    const cleaned = code.replace(/^RAL\s*/i, '').trim();
    const match = RAL_COLORS.find(c => c.code === cleaned);
    return match?.name ?? null;
}
