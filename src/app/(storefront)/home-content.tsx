import React from 'react';
import Link from 'next/link';
import { ChevronRight, Droplets, Target, ShieldCheck, Layers } from 'lucide-react';
import { CollectionCard } from '@/components/industrial_ui/CollectionCard';
import { ServiceCard } from '@/components/industrial_ui/ServiceCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/shopify/types';

interface CategoryData {
    id: string;
    name: string;
    slug: string;
    icon: string;
    count: number;
}

interface HomeContentProps {
    initialProducts: Product[];
    initialCategories: CategoryData[];
}

export default function HomeContent({ initialProducts, initialCategories }: HomeContentProps) {
    return (
        <>
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pt-6 md:pt-16 pb-16 md:pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center min-h-[auto] md:min-h-[500px]">
                    <div className="flex flex-col justify-center gap-6 md:gap-8 order-2 md:order-1 py-4 md:py-8">
                        <div className="space-y-4">
                            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded">
                                Από το 1982
                            </span>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1] md:leading-[0.9] tracking-tighter uppercase text-primary">
                                Χρώματα <br className="hidden sm:block" /> &amp; Δομικά <br className="hidden sm:block" /> <span className="text-accent">Υλικά.</span>
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl font-light leading-relaxed">
                                Εμπειρία 44+ χρόνων στον κόσμο του χρώματος. Εξειδικευμένες λύσεις σε χρώματα αυτοκινήτου, ναυτιλιακά, οικοδομικά και δομικά υλικά.
                            </p>
                        </div>
                        <div className="flex flex-col flex-wrap sm:flex-row gap-3 sm:gap-4 mt-4">
                            <Button className="w-full sm:w-auto rounded-none uppercase tracking-widest font-bold px-6 sm:px-8 py-6 shadow-none" size="lg">
                                Δείτε τα Προϊόντα μας
                            </Button>
                            <Button variant="outline" className="w-full sm:w-auto rounded-none uppercase tracking-widest font-bold px-6 sm:px-8 py-6 shadow-none border-primary text-primary hover:bg-muted" size="lg">
                                Επικοινωνήστε μαζί μας
                            </Button>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 h-[300px] sm:h-[400px] md:h-[600px] w-full relative">
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-cover grayscale hover:grayscale-0 transition-all duration-700 border border-border"
                            style={{ backgroundImage: 'url("/images/homescreen/hero.png")' }}>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-16 md:py-24">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-0 mb-8 md:mb-10 border-b border-border pb-4 md:pb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-primary">Κατηγορίες</h2>
                        <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-widest mt-1">Κατηγορίες Προϊόντων</p>
                    </div>
                    <Link href="/collections" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent hover:underline hover:text-primary transition-colors">
                        Δείτε Όλα <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CollectionCard
                        title="Οικοδομικά Χρώματα"
                        description="Πλήρης γκάμα χρωμάτων για εσωτερικούς και εξωτερικούς χώρους με υψηλή κάλυψη και αντοχή."
                        image="/images/homescreen/building.png"
                        variant="featured"
                        colors={['bg-[#0f172a]', 'bg-[#1e293b]', 'bg-[#e2e8f0]']}
                    />

                    <CollectionCard
                        title="Χρώματα Αυτοκινήτου"
                        description="Επαγγελματικά χρώματα και προϊόντα φανοποιίας για τέλειο αποτέλεσμα σε κάθε επισκευή."
                        image="/images/homescreen/automotive.png"
                        variant="featured"
                        colors={['bg-[#165c52]', 'bg-[#0f172a]', 'bg-[#334155]']}
                    />

                    <CollectionCard
                        title="Ναυτιλιακά Χρώματα"
                        description="Εξειδικευμένα προϊόντα για σκάφη και θαλάσσιες εφαρμογές με αντοχή στο αλάτι και την υγρασία."
                        image="/images/homescreen/marine.png"
                        variant="featured"
                        badge="Θαλάσσιες Εφαρμογές"
                    />
                </div>
            </section>

            {/* Professional Services */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-16 md:py-24">
                <div className="bg-[#0b1120] text-primary-foreground border border-[#1e293b]">
                    <div className="flex flex-col lg:flex-row">
                        <div className="flex-1 p-6 sm:p-8 md:p-12 lg:p-16 space-y-8 md:space-y-12">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 !text-white">Οι Υπηρεσίες μας</h2>
                                <p className="text-white/70 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                                    Δεν προσφέρουμε μόνο υλικά. Προσφέρουμε εξειδικευμένη γνώση και τεχνική υποστήριξη, από color matching έως συμβουλές χρωματισμού για κάθε εφαρμογή.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                                <ServiceCard
                                    icon={<Target className="w-8 h-8 text-accent" />}
                                    title="Τεχνική Συμβουλευτική"
                                    description="Καθοδήγηση στην επιλογή των κατάλληλων προϊόντων για οικοδομική, ναυτιλιακή ή αυτοκινητιστική χρήση."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-accent [&_p]:text-white/60"
                                />
                                <ServiceCard
                                    icon={<Droplets className="w-8 h-8 text-accent" />}
                                    title="Παρασκευή Αποχρώσεων"
                                    description="Custom αποχρώσεις σύμφωνα με τις ανάγκες σας, από δείγμα ή μοναδική ιδέα, στο εξειδικευμένο εργαστήριό μας."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                                <ServiceCard
                                    icon={<ShieldCheck className="w-8 h-8 text-accent" />}
                                    title="Μελέτη Color Matching"
                                    description="Επαγγελματική αντιστοίχιση χρωμάτων με εξειδικευμένο εξοπλισμό για άψογο αποτέλεσμα."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                                <ServiceCard
                                    icon={<Layers className="w-8 h-8 text-accent" />}
                                    title="Συμβουλές Χρωματισμού"
                                    description="Ιδανικοί χρωματικοί συνδυασμοί για τον χώρο σας, με βάση τις σύγχρονες τάσεις και τις ανάγκες σας."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                            </div>
                        </div>
                        <div className="lg:w-1/3 flex-none relative h-[300px] sm:h-[400px] lg:h-auto">
                            <div className="absolute inset-0 bg-cover bg-center grayscale border border-[#1e293b]"
                                style={{ backgroundImage: 'url("/images/homescreen/services.png")' }}>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-[#0f4d44] text-white p-6 z-10 hidden lg:block">
                                <p className="text-3xl font-black italic">44+</p>
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Χρόνια Εμπειρίας</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
