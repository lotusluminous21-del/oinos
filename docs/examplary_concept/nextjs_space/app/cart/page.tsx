'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Header, BottomNav, QuantitySelector, PrimaryButton } from '@/components/skeuo';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const cart = useAppStore(state => state.cart);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  const updateQuantity = useAppStore(state => state.updateQuantity);
  const clearCart = useAppStore(state => state.clearCart);
  const getCartTotal = useAppStore(state => state.getCartTotal);

  const handleRemove = (productId: string, name: string) => {
    removeFromCart(productId);
    toast.success(`Removed ${name} from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.90;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-skeuo-bg pb-32">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800">Shopping Cart</span>
          {cart.length > 0 ? (
            <button onClick={handleClearCart} className="p-2 -mr-2 text-slate-500">
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Your cart is empty</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Start by exploring our products or get expert help
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/categories">
                  <PrimaryButton variant="secondary" size="sm">
                    Browse Products
                  </PrimaryButton>
                </Link>
                <Link href="/expert">
                  <PrimaryButton size="sm">
                    Get Expert Help
                  </PrimaryButton>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="skeuo-card p-4 flex gap-4"
                  >
                    <Link href={`/product/${item.productSlug}`} className="shrink-0">
                      <div className="w-20 h-20 rounded-xl bg-white shadow-inner overflow-hidden">
                        <div className="relative w-full h-full p-2">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productSlug}`}>
                        <h3 className="font-bold text-slate-800 truncate hover:text-skeuo-accent">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-extrabold text-skeuo-accent-dark mt-1">
                        {formatPrice(item.price)}
                      </p>
                      {item.fromSolution && (
                        <span className="text-[10px] px-2 py-0.5 bg-skeuo-accent/10 text-skeuo-accent-dark rounded-full font-semibold">
                          From repair plan
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemove(item.productId, item.name)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <QuantitySelector
                        value={item.quantity}
                        onValueChange={(val) => updateQuantity(item.productId, val)}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="skeuo-card p-5 space-y-4"
              >
                <h3 className="font-bold text-slate-800">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Shipping</span>
                    <span className="font-semibold text-slate-800">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-skeuo-accent font-medium">
                      Add {formatPrice(50 - subtotal)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-extrabold text-slate-800 text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                <PrimaryButton onClick={() => toast.success('Proceeding to checkout...')}>
                  Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </PrimaryButton>

                <p className="text-xs text-center text-slate-400 font-medium">
                  Secure checkout powered by Stripe
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
