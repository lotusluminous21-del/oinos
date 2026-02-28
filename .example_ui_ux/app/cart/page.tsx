'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const cart = useAppStore(state => state.cart);
  const updateQuantity = useAppStore(state => state.updateQuantity);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  const clearCart = useAppStore(state => state.clearCart);
  const getCartTotal = useAppStore(state => state.getCartTotal);
  const solution = useAppStore(state => state.solution);

  const handleRemove = (productId: string, name: string) => {
    removeFromCart(productId);
    toast.success(`Removed ${name} from cart`);
  };

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium">Cart ({cart.length})</span>
          {cart.length > 0 && (
            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="p-2 -mr-2 text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 space-y-4"
            >
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground">Add some products to get started</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/categories">
                  <Button variant="outline">Browse Products</Button>
                </Link>
                <Link href="/expert">
                  <Button variant="teal">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Expert Help
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Cart items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass-card p-4"
                    >
                      <div className="flex gap-4">
                        <Link href={`/product/${item.productSlug}`}>
                          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.productSlug}`}>
                            <h3 className="font-medium truncate hover:text-teal-400 transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          {item.fromSolution && (
                            <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded mt-1 inline-block">
                              From repair plan
                            </span>
                          )}
                          <p className="text-teal-400 font-medium mt-1">
                            {formatPrice(item.price)}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-white/5 rounded">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemove(item.productId, item.name)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Solution reminder */}
              {solution && (
                <Link href="/solution" className="block glass-card p-4 hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      <div>
                        <p className="text-sm font-medium">Review your repair plan</p>
                        <p className="text-xs text-muted-foreground">
                          Make sure you have everything you need
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              )}

              {/* Order summary */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="font-medium">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span className="text-teal-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout button */}
              <Button
                variant="teal"
                size="xl"
                className="w-full"
                onClick={() => toast.success('Checkout coming soon!')}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
