'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Star, ChevronDown, ChevronUp, ShoppingCart, Check, AlertTriangle, Lightbulb, Plus, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <p className="text-muted-foreground mb-4">No repair plan generated yet.</p>
        <Button onClick={() => router.push('/expert')} variant="teal">
          Start Expert Guide
        </Button>
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
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-orange-400',
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/expert" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium">Your Repair Plan</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center shrink-0">
                <span className="text-2xl">🛠️</span>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold">{solution.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {solution.summary.estimatedTime}
                  </span>
                  <span className={`flex items-center gap-1 ${difficultyColors[solution.summary.difficulty]}`}>
                    <Star className="w-4 h-4" />
                    {solution.summary.difficulty.charAt(0).toUpperCase() + solution.summary.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-muted-foreground mb-2">Based on your inputs:</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5">{solution.basedOn.material}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5">{solution.basedOn.damageDepth}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5">{solution.basedOn.colorType}</span>
                {solution.basedOn.rustPresent && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-300">Rust present</span>
                )}
              </div>
            </div>

            {solution.assumptions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="italic">Assumed: {solution.assumptions.join(', ')}</span>
                <button className="ml-2 text-teal-400 hover:text-teal-300">
                  <Edit2 className="w-3 h-3 inline" /> Edit
                </button>
              </div>
            )}
          </motion.div>

          {/* Steps */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">STEP-BY-STEP GUIDE</h2>
            
            {solution.steps.map((step, idx) => {
              const isExpanded = expandedSteps.includes(step.order);
              
              return (
                <motion.div
                  key={step.order}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleStep(step.order)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 text-sm font-medium flex items-center justify-center">
                        {step.order}
                      </span>
                      <span className="font-medium">{step.title}</span>
                      {step.duration && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>

                          {step.proTips.length > 0 && (
                            <div className="bg-teal-500/10 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-teal-400 text-xs font-medium">
                                <Lightbulb className="w-4 h-4" />
                                Pro Tips
                              </div>
                              <ul className="text-xs text-teal-100 space-y-1">
                                {step.proTips.map((tip, i) => (
                                  <li key={i}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-orange-500/10 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-orange-400 text-xs font-medium">
                                <AlertTriangle className="w-4 h-4" />
                                Important
                              </div>
                              <ul className="text-xs text-orange-100 space-y-1">
                                {step.warnings.map((warning, i) => (
                                  <li key={i}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Products */}
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">Products for this step:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {step.products.map((product) => (
                                <div
                                  key={product.productId}
                                  className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                                >
                                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatPrice(product.price)} x{product.quantity}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleAddProduct(product)}
                                    disabled={isInCart(product.productId)}
                                    className="shrink-0 w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 disabled:bg-green-600 flex items-center justify-center transition-colors"
                                  >
                                    {isInCart(product.productId) ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
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
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Complete Shopping List</p>
                <p className="text-lg font-semibold">
                  {solution.totalProducts} products • {formatPrice(solution.totalPrice)}
                </p>
              </div>
              <ShoppingCart className="w-6 h-6 text-teal-400" />
            </div>

            <Button
              variant="teal"
              size="xl"
              className="w-full"
              onClick={handleAddAllToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add All to Cart
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Only essential products will be added. Optional items can be added individually.
            </p>
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
