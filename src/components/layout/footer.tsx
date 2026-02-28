import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#f8f9fa] border-t border-neutral-200 mt-20">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Column 1: Branding */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/svg/logotype.svg"
                                alt="Pavlicevits"
                                width={180}
                                height={36}
                                className="h-6 w-auto"
                            />
                        </Link>
                        <div className="h-px w-12 bg-neutral-300" />
                        <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
                            Τεχνική εξειδίκευση στα χρώματα αυτοκινήτου και λύσεις ειδικών κατασκευών. Η γερμανική ακρίβεια συναντά τη βιομηχανική αντοχή.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="text-neutral-400 hover:text-teal-600 transition-colors">
                                <span className="sr-only">Facebook</span>
                                <Facebook className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="text-neutral-400 hover:text-teal-600 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="text-neutral-400 hover:text-teal-600 transition-colors">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Products */}
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-neutral-900 uppercase mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" /> ΠΡΟΪΟΝΤΑ
                        </h3>
                        <ul className="space-y-4 text-xs">
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Χρώματα Αυτοκινήτων</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Αστάρια & Υποστρώματα</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Βερνίκια</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Αναλώσιμα</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Εργαλεία & Εξοπλισμός</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Information */}
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-neutral-900 uppercase mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" /> ΠΛΗΡΟΦΟΡΙΕΣ
                        </h3>
                        <ul className="space-y-4 text-xs">
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Η Εταιρεία</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Επικοινωνία</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Οδηγοί Εφαρμογής</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Όροι Χρήσης</Link></li>
                            <li><Link href="#" className="text-neutral-500 hover:text-teal-600 transition-colors">Πολιτική Απορρήτου</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h3 className="text-xs font-bold tracking-wider text-neutral-900 uppercase mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" /> ΕΠΙΚΟΙΝΩΝΙΑ
                        </h3>
                        <ul className="space-y-5 text-xs">
                            <li className="flex gap-3 text-neutral-500">
                                <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                                <span>Οδός ΧΧΧ, Καλαμαριά,<br />Θεσσαλονίκη, 5513X</span>
                            </li>
                            <li className="flex gap-3 text-neutral-500">
                                <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                                <span>2310-XXX-XXX</span>
                            </li>
                            <li className="flex gap-3 text-neutral-500">
                                <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                                <span>info@pavlicevits.gr</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] text-neutral-400 font-mono">
                        &copy; {new Date().getFullYear()} Pavlicevits. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>PayPal</span>
                        <span>IRIS</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
