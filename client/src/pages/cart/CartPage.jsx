import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, loading, removeItem, fetchCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-primary-dark dark:text-white font-satoshi pt-24 md:pt-32 pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <ShoppingCart size={32} className="text-primary-pink" />
          Your Cart
        </h1>
        <p className="text-gray-600 dark:text-white/40 text-sm mb-8">
          {items.length === 0 ? 'Your cart is empty.' : `${items.length} course${items.length !== 1 ? 's' : ''} in your cart.`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-600 dark:text-white/40">
            <div className="w-6 h-6 border-2 border-primary-pink border-t-transparent rounded-full animate-spin" />
            Loading cart…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 dark:text-white/20 mb-4" />
            <p className="text-gray-600 dark:text-white/60 font-medium mb-6">No courses in your cart yet.</p>
            <Link
              to={ROUTES.COURSES}
              className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
            >
              Browse courses <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.courseId}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/15 transition-colors"
                >
                  <div className="w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-white/20 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-sm text-primary-pink font-semibold mt-0.5">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTES.CHECKOUT}/${item.courseId}`)}
                      className="btn-gradient px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      Checkout
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.courseId)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-500/10 dark:text-white/40 dark:hover:text-red-400 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200/70 dark:border-white/10">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Total: <span className="text-primary-pink">{formatPrice(total)}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-white/40">
                Checkout one course at a time. You can remove items you don’t need.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
