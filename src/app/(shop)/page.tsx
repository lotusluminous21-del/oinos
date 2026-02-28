import { getProductTypes, getProducts } from '@/lib/shopify/client';
import { HeroSection } from '@/components/home/hero-section';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles, PaintBucket, Paintbrush, SprayCan, Droplets, Wrench, Eraser, Package, Plus } from 'lucide-react';
import { Product } from '@/lib/shopify/types';
import { QuickAddButton } from '@/components/home/quick-add-button';

function getIconForCategory(title: string, className?: string) {
  const t = title.toLowerCase();
  const classes = className || "w-5 h-5";

  if (t.includes('αστάρι') || t.includes('υπόστρωμα') || t.includes('primer'))
    return <PaintBucket className={classes} strokeWidth={2} />;

  if (t.includes('χρώμα') || t.includes('βάση') || t.includes('basecoat'))
    return <Paintbrush className={classes} strokeWidth={2} />;

  if (t.includes('βερνίκι') || t.includes('φινίρισμα') || t.includes('clear'))
    return <Sparkles className={classes} strokeWidth={2} />;

  if (t.includes('προετοιμασία') || t.includes('καθαρισμός') || t.includes('διαλυτικό'))
    return <Droplets className={classes} strokeWidth={2} />;

  if (t.includes('στόκος') || t.includes('πλαστελίνη'))
    return <Eraser className={classes} strokeWidth={2} />;

  if (t.includes('εργαλείο') || t.includes('πινέλο'))
    return <Wrench className={classes} strokeWidth={2} />;

  if (t.includes('σπρέι'))
    return <SprayCan className={classes} strokeWidth={2} />;

  return <Package className={classes} strokeWidth={2} />;
}

export const metadata = {
  title: 'Pavlicevits | Χρώματα Αυτοκινήτου & Ειδικές Κατασκευές',
  description: 'Η κορυφαία επιλογή για χρώματα αυτοκινήτου, βερνίκια, αστάρια και εργαλεία βαφής.',
  openGraph: {
    type: 'website'
  }
};

export async function OldHomeContent() {
  const productTypes = await getProductTypes();
  const displayCategories = productTypes.slice(0, 8); // Show up to 8 categories to match grid

  const allProducts = await getProducts();
  const featuredProducts = allProducts.slice(0, 4);

  const categoryColors = [
    "bg-cyan-50/80 text-cyan-600",
    "bg-red-50/80 text-red-500",
    "bg-blue-50/80 text-blue-600",
    "bg-emerald-50/80 text-emerald-600",
    "bg-purple-50/80 text-purple-600",
    "bg-amber-50/80 text-amber-600",
    "bg-indigo-50/80 text-indigo-500",
    "bg-rose-50/80 text-rose-500"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <HeroSection />

      <main className="relative z-20 pb-28">

        {/* Shop by Category */}
        <section className="px-5 py-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-[17px] font-extrabold text-neutral-900 mb-4 tracking-tight">Shop by Category</h2>

            <div className="grid grid-cols-3 gap-3">
              {displayCategories.map((type, index) => (
                <Link
                  key={type}
                  href={`/proionta?category=${encodeURIComponent(type)}`}
                  className="bg-white rounded-[24px] p-3 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[105px] gap-1.5"
                >
                  <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center mb-1 shadow-sm ${categoryColors[index % categoryColors.length]}`}>
                    {getIconForCategory(type, "w-6 h-6")}
                  </div>
                  <span className="text-[12px] font-extrabold text-neutral-800 leading-[1.1] text-wrap">{type}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-5 py-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-[17px] font-extrabold text-neutral-900 mb-4 tracking-tight">Featured Products</h2>

            <div className="grid grid-cols-2 gap-4">
              {featuredProducts.map((product: Product) => (
                <Link
                  key={product.handle}
                  href={`/product/${product.handle}`}
                  className="bg-white rounded-[28px] p-4 pb-5 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative group"
                >
                  <div className="aspect-square relative w-full mb-3 rounded-[20px] overflow-hidden bg-[#F7F9FC] flex items-center justify-center">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        className="object-contain p-2 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Package className="w-10 h-10 text-neutral-300" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col px-1">
                    <h3 className="text-[14px] font-extrabold text-neutral-800 leading-[1.2] mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-[12px] font-medium text-neutral-400 mb-2 truncate">
                      {product.productType || 'Premium'}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-[17px] font-black text-neutral-900 tracking-tight">
                        €{parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Add Button Floating */}
                  <QuickAddButton productHandle={product.handle} />
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

import { SmartSearchBar } from '@/components/ui/skeumorphic/smart-search-bar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/skeumorphic/accordion';
import { ActionCard } from '@/components/ui/skeumorphic/action-card';
import { Chip } from '@/components/ui/skeumorphic/chip';
import { BottomNav } from '@/components/ui/skeumorphic/bottom-nav';
import { ProductCard } from '@/components/ui/skeumorphic/product-card';
import { ChatBubble } from '@/components/ui/skeumorphic/chat-bubble';
import { ConfirmedFacts } from '@/components/ui/skeumorphic/confirmed-facts';
import { ChatQuestionCard } from '@/components/ui/skeumorphic/chat-question-card';
import { ProductGallery } from '@/components/ui/skeumorphic/product-gallery';
import { QuantitySelector } from '@/components/ui/skeumorphic/quantity-selector';
import { CompatibleProductCard } from '@/components/ui/skeumorphic/compatible-product-card';
import { PrimaryButton } from '@/components/ui/skeumorphic/primary-button';
import { EmptyCartState } from '@/components/ui/skeumorphic/empty-cart-state';
import { CarFront, Shield, Ship, Cpu, CheckCircle2, Truck as TruckIcon, ListFilter, ArrowUpDown } from 'lucide-react';

export default async function ComponentGallery() {
  const products = await getProducts();
  const displayProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F6] items-center pt-16 pb-32">
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">UI Components</h1>

        {/* Smart Search */}
        <div className="w-full mb-12 flex justify-center">
          <SmartSearchBar />
        </div>

        {/* Steps Accordions Stack */}
        <div className="w-full max-w-[500px] flex flex-col gap-4">
          <Accordion type="single" collapsible className="w-full flex flex-col gap-3" defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Steps</AccordionTrigger>
              <AccordionContent>Configure your initial settings and setup your product preferences.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Steps 2</AccordionTrigger>
              <AccordionContent>Additional configurations and details go here.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Steps 3</AccordionTrigger>
              <AccordionContent>Review and verify all chosen steps.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Steps & ccordion</AccordionTrigger>
              <AccordionContent>Advanced settings panel.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Steps extianted</AccordionTrigger>
              <AccordionContent>Finalizing all required details.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Color Suggestion */}
        {/* Color Suggestion */}
        <div className="w-full max-w-[500px] mt-10 flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1">Color suggestion</h2>
          <div className="flex gap-[16px] overflow-x-auto pb-6 pt-3 px-3 -mx-3 hide-scrollbar">

            <div className="flex flex-col items-center gap-2.5 shrink-0 w-[72px]">
              <ActionCard className="w-[64px] h-[64px] p-0 flex items-center justify-center rounded-[20px]">
                <Wrench className="w-7 h-7 text-cyan-600 drop-shadow-[0_3px_3px_rgba(8,145,178,0.4)]" strokeWidth={2.5} />
              </ActionCard>
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Fix a<br />scratch</span>
            </div>

            <div className="flex flex-col items-center gap-2.5 shrink-0 w-[72px]">
              <ActionCard className="w-[64px] h-[64px] p-0 flex items-center justify-center rounded-[20px]">
                <CarFront className="w-7 h-7 text-rose-500 drop-shadow-[0_3px_3px_rgba(244,63,94,0.4)]" strokeWidth={2.5} />
              </ActionCard>
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Paint a<br />bumper</span>
            </div>

            <div className="flex flex-col items-center gap-2.5 shrink-0 w-[72px]">
              <ActionCard className="w-[64px] h-[64px] p-0 flex items-center justify-center rounded-[20px]">
                <Shield className="w-7 h-7 text-blue-600 drop-shadow-[0_3px_3px_rgba(37,99,235,0.4)]" strokeWidth={2.5} />
              </ActionCard>
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Ceramic<br />coating</span>
            </div>

            <div className="flex flex-col items-center gap-2.5 shrink-0 w-[72px]">
              <ActionCard className="w-[64px] h-[64px] p-0 flex items-center justify-center rounded-[20px]">
                <Ship className="w-7 h-7 text-indigo-500 drop-shadow-[0_3px_3px_rgba(99,102,241,0.4)]" strokeWidth={2.5} />
              </ActionCard>
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Touch up<br />ships</span>
            </div>

          </div>
        </div>

        {/* Shop by Category */}
        <div className="w-full max-w-[500px] mt-8 flex flex-col gap-4">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1">Shop by Category</h2>
          <div className="flex gap-[14px] overflow-x-auto pb-6 pt-3 px-3 -mx-3 hide-scrollbar">
            <ActionCard className="w-[108px] h-[124px] shrink-0 p-3 pb-4 justify-between flex flex-col items-center">
              <Droplets className="w-10 h-10 mt-1 text-[#00D4CA] drop-shadow-[0_4px_4px_rgba(0,212,202,0.45)]" strokeWidth={2} />
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Preparation<br />& Cleaning</span>
            </ActionCard>
            <ActionCard className="w-[108px] h-[124px] shrink-0 p-3 pb-4 justify-between flex flex-col items-center">
              <Eraser className="w-10 h-10 mt-1 text-[#93274D] drop-shadow-[0_4px_4px_rgba(147,39,77,0.45)]" strokeWidth={2} />
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Sanding<br />Supplies</span>
            </ActionCard>
            <ActionCard className="w-[108px] h-[124px] shrink-0 p-3 pb-4 justify-between flex flex-col items-center">
              <PaintBucket className="w-10 h-10 mt-1 text-[#8C97A7] drop-shadow-[0_4px_4px_rgba(140,151,167,0.45)]" strokeWidth={2} />
              <span className="text-[13px] font-bold text-slate-700 leading-[1.2] text-center tracking-tight">Primers</span>
            </ActionCard>
          </div>
        </div>

        {/* Value Chips */}
        <div className="w-full max-w-[500px] mt-8 flex flex-col gap-4">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1">Value Chips</h2>
          <div className="flex gap-[12px] overflow-x-auto pb-6 pt-3 px-3 -mx-3 hide-scrollbar">
            <Chip icon={<Cpu className="w-5 h-5 text-slate-900" strokeWidth={2.5} />}>
              Expert AI
            </Chip>
            <Chip icon={<CheckCircle2 className="w-5 h-5 text-slate-900" strokeWidth={2.5} />}>
              Quality
            </Chip>
            <Chip icon={<TruckIcon className="w-5 h-5 text-slate-900" strokeWidth={2.5} />}>
              Fast Shipping
            </Chip>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="w-full max-w-[500px] mt-16 flex flex-col gap-4">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1">Bottom Navigation</h2>
          <div className="flex justify-center w-full px-2 pb-10">
            <BottomNav />
          </div>
        </div>

        {/* Chat Session View */}
        <div className="w-full max-w-[500px] mt-16 flex flex-col gap-6">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1 mb-2">Chat View Details</h2>
          <div className="flex flex-col gap-[22px]">
            <ChatBubble role="user" content="How user message?" />
            <ChatBubble role="ai" content="Hi! How to clob your asstimate, henai seein poitifscn sxenamt aintns Assistant candes uigh hum broin at message." />
            <ChatBubble role="user" content="Hi.. tdam your messages tbat your messages and some hiep persons and ennaioinort and next your messagess?" />
          </div>

          <ConfirmedFacts
            facts={[
              "Confirmed Facts",
              "Confirmed Facts or sepuned",
              "Confirmed Facts confirmed"
            ]}
            className="mt-6 mb-2"
          />

          <ChatQuestionCard
            title="Question Card"
            question="How cant oaute whist aoe irat message?"
          />
        </div>

        {/* Product Detail View */}
        <div className="w-full max-w-[500px] mt-16 flex flex-col gap-6">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1 mb-2">Product Detail Display</h2>

          <div className="flex flex-col gap-0 w-full px-2">
            <ProductGallery />

            <div className="mt-8">
              <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">Product Detail</h1>
              <p className="text-[16px] font-medium text-slate-600 tracking-tight mt-1">Specificators</p>
            </div>

            <div className="mt-5 flex flex-col gap-3.5">
              <div className="flex items-center text-[15.5px]">
                <span className="font-bold text-slate-800 tracking-tight">Specifications:&nbsp;</span>
                <span className="font-medium text-slate-700 tracking-tight">Clear</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[15.5px] font-bold text-slate-800 tracking-tight">Quantity:&nbsp;-&nbsp;1</span>
                <QuantitySelector />
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Description</h3>
              <p className="text-[14.5px] font-medium text-slate-700 leading-relaxed mt-2.5 pb-2">
                High-contrast doter ait emet, consectetur despisching clrt, and do olascikad temper iausitsioa. Ut maies comioens plasm consectoviators, aopve mon color covers, coorm covorávate and inomnemtas sud compatible products.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight mb-3">Compatible products</h3>
              <div className="flex gap-[14px] overflow-x-auto pb-8 pt-4 px-3 -mx-3 hide-scrollbar">
                <CompatibleProductCard title="Premium 2K" />
                <CompatibleProductCard title="Premium 2K..." />
                <CompatibleProductCard title="Premium" />
                <CompatibleProductCard title="Premium +" />
              </div>
            </div>

            <div className="mt-8 mb-4 w-full px-1">
              <PrimaryButton>Add to Cart</PrimaryButton>
            </div>
          </div>
        </div>

        {/* Empty Cart State View */}
        <div className="w-full max-w-[500px] mt-16 flex flex-col gap-6">
          <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1 mb-2">Empty Cart State</h2>
          <EmptyCartState />
        </div>

        {/* Product Card Variations */}
        <div className="w-full max-w-[500px] mt-16 flex flex-col gap-10">

          {/* Summary View */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1">Summary View</h2>
            <div className="flex flex-col gap-4">
              {displayProducts[0] && <ProductCard product={displayProducts[0]} variant="summary" />}
            </div>
          </div>

          {/* Featured Products */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-bold text-slate-800 tracking-tight px-1">Featured Products</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 hide-scrollbar">
              {displayProducts.map((p) => (
                <ProductCard key={p.id} product={p} variant="featured" className="shrink-0" />
              ))}
            </div>
          </div>

          {/* For your project / Standard Cards */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-slate-800 tracking-tight">For your project</h2>
                <ChevronRight className="w-5 h-5 text-slate-800" />
              </div>
              <div className="flex items-center gap-4 text-slate-900">
                <ArrowUpDown className="w-5 h-5" />
                <ListFilter className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {displayProducts.slice(0, 2).map((p) => (
                <div key={p.id} className="relative">
                  <ProductCard product={p} variant="standard" className="w-full" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
