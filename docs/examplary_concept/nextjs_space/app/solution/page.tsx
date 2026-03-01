'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Star, ChevronDown, ChevronUp, ShoppingCart, Check, AlertTriangle, Lightbulb, Plus, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Header, BottomNav, PrimaryButton, Chip } from '@/components/skeuo';

export default function SolutionPage() {
  const router = useRouter();
  const solution = useAppStore(state => state.solution);
  const addToCart = useAppStore(state => state.addToCart);
  const addSolutionToCart = useAppStore(state => state.addSolutionToCart);
  const cart = useAppStore(state => state.cart);
  
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  if (!solution) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-skeuo-bg p-6">
        <div className="skeuo-card p-8 text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">No repair plan yet</h2>
          <p className="text-sm text-slate-500 font-medium">Start by describing your project to our expert</p>
          <PrimaryButton onClick={() => router.push('/expert')}>
            Start Expert Guide
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const toggleStep = (stepOrder: number) => {
    setExpandedSteps(prev =>
      prev.includes(stepOrder)
        ? prev.filter(s => s !== stepOrder)
        : [...prev, stepOrder]
    );
  };

  const handleAddProduct = (product: any) => {
    addToCart({
      productId: product.productId,
      productSlug: product.productSlug,
      name: product.name,
      price: product.price,
      image: product.image,
      fromSolution: true,
    }, product.quantity);
    setAddedProducts(prev => new Set(prev).add(product.productId));
    toast.success(`Added ${product.name} to cart`);
  };

  const handleAddAllToCart = () => {
    addSolutionToCart(solution);
    toast.success('All essential products added to cart!');
    router.push('/cart');
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.productId === productId) || addedProducts.has(productId);
  };

  const difficultyColors = {
    beginner: 'text-green-600',
    intermediate: 'text-amber-600',
    advanced: 'text-orange-600',
  };

  return (
    <div className="min-h-screen bg-skeuo-bg pb-32">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/expert" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800">Your Repair Plan</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="skeuo-card p-5 space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-skeuo-accent to-skeuo-accent-dark flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-2xl">🛠️</span>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-slate-800">{solution.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-4 h-4" />
                    {solution.summary.estimatedTime}
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${difficultyColors[solution.summary.difficulty]}`}>
                    <Star className="w-4 h-4" />
                    {solution.summary.difficulty.charAt(0).toUpperCase() + solution.summary.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 font-medium mb-2">Based on your inputs:</p>
              <div className="flex flex-wrap gap-2">
                <Chip className="!h-8 !text-[12px]">{solution.basedOn.material}</Chip>
                <Chip className="!h-8 !text-[12px]">{solution.basedOn.damageDepth}</Chip>
                <Chip className="!h-8 !text-[12px]">{solution.basedOn.colorType}</Chip>
                {solution.basedOn.rustPresent && (
                  <Chip className="!h-8 !text-[12px] !bg-orange-100 !text-orange-700">Rust present</Chip>
                )}
              </div>
            </div>

            {solution.assumptions.length > 0 && (
              <div className="text-xs text-slate-400 font-medium">
                <span className="italic">Assumed: {solution.assumptions.join(', ')}</span>
                <button className="ml-2 text-skeuo-accent hover:text-skeuo-accent-dark font-semibold">
                  <Edit2 className="w-3 h-3 inline" /> Edit
                </button>
              </div>
            )}
          </motion.div>

          {/* Steps */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide px-1">Step-by-Step Guide</h2>
            
            {solution.steps.map((step, idx) => {
              const isExpanded = expandedSteps.includes(step.order);
              
              return (
                <motion.div
                  key={step.order}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="skeuo-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleStep(step.order)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-skeuo-accent/20 text-skeuo-accent-dark text-sm font-bold flex items-center justify-center">
                        {step.order}
                      </span>
                      <span className="font-bold text-slate-800">{step.title}</span>
                      {step.duration && (
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4">
                          <p className="text-sm text-slate-600 font-medium">
                            {step.description}
                          </p>

                          {step.proTips.length > 0 && (
                            <div className="skeuo-inset rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-2 text-skeuo-accent-dark text-xs font-bold">
                                <Lightbulb className="w-4 h-4" />
                                Pro Tips
                              </div>
                              <ul className="text-xs text-slate-600 font-medium space-y-1">
                                {step.proTips.map((tip, i) => (
                                  <li key={i}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-orange-50 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold">
                                <AlertTriangle className="w-4 h-4" />
                                Important
                              </div>
                              <ul className="text-xs text-orange-700 font-medium space-y-1">
                                {step.warnings.map((warning, i) => (
                                  <li key={i}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Products */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Products for this step</p>
                            <div className="space-y-2">
                              {step.products.map((product) => (
                                <div
                                  key={product.productId}
                                  className="flex items-center gap-3 skeuo-card p-3"
                                >
                                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-inner">
                                    <div className="relative w-full h-full p-1">
                                      <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {formatPrice(product.price)} x{product.quantity}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleAddProduct(product)}
                                    disabled={isInCart(product.productId)}
                                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                      isInCart(product.productId)
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-skeuo-accent text-slate-900 shadow-skeuo-button active:shadow-skeuo-button-active active:scale-95'
                                    }`}
                                  >
                                    {isInCart(product.productId) ? (
                                      <Check className="w-5 h-5" />
                                    ) : (
                                      <Plus className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Total & Add All */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="skeuo-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Complete Shopping List</p>
                <p className="text-lg font-bold text-slate-800">
                  {solution.totalProducts} products • {formatPrice(solution.totalPrice)}
                </p>
              </div>
              <ShoppingCart className="w-6 h-6 text-skeuo-accent" />
            </div>

            <PrimaryButton
              onClick={handleAddAllToCart}
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add All to Cart
            </PrimaryButton>

            <p className="text-xs text-center text-slate-400 font-medium">
              Only essential products will be added. Optional items can be added individually.
            </p>
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
