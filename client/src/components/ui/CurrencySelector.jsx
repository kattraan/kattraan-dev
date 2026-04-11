import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/utils/currency';

/**
 * CurrencySelector — compact dropdown for the Navbar.
 * Lets the user switch their display currency. Selection persists in localStorage.
 */
export default function CurrencySelector() {
  const { userCurrency, supportedCurrencies, changeCurrency, loading } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading || supportedCurrencies.length <= 1) return null;

  const symbol = CURRENCY_SYMBOLS[userCurrency] || userCurrency;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
        aria-label="Change currency"
      >
        <span className="font-bold">{symbol}</span>
        <span className="text-xs opacity-70">{userCurrency}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1625] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200]">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Display currency</p>
          </div>
          <div className="max-h-72 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#ffffff20_transparent]">
            {supportedCurrencies.map((code) => {
              const isActive = code === userCurrency;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => { changeCurrency(code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="w-7 font-bold text-base leading-none">{CURRENCY_SYMBOLS[code] || code}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs leading-tight">{code}</span>
                    <span className="text-[10px] text-white/40 leading-tight">{CURRENCY_NAMES[code] || ''}</span>
                  </div>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-pink flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
