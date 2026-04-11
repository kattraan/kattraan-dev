import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { detectUserCurrency, convertFromINR, formatPrice, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/utils/currency';

const CurrencyContext = createContext(null);

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/exchange-rates`;

export function CurrencyProvider({ children }) {
  const [rates, setRates] = useState({});
  const [supportedCurrencies, setSupportedCurrencies] = useState(['INR']);
  const [userCurrency, setUserCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchRates() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!cancelled && data.success) {
          setRates(data.rates || {});
          setSupportedCurrencies(data.supportedCurrencies || ['INR']);
          // Detect user's currency after we know which ones are supported
          const detected = detectUserCurrency(data.supportedCurrencies || []);
          // Restore from localStorage if user previously selected one
          const saved = localStorage.getItem('kattraan_currency');
          if (saved && (data.supportedCurrencies || []).includes(saved)) {
            setUserCurrency(saved);
          } else {
            setUserCurrency(detected);
          }
        }
      } catch (err) {
        console.warn('[Currency] Failed to fetch rates, using INR fallback');
        setRates({ INR: 1 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRates();
    return () => { cancelled = true; };
  }, []);

  const changeCurrency = useCallback((code) => {
    setUserCurrency(code);
    localStorage.setItem('kattraan_currency', code);
  }, []);

  const value = useMemo(() => ({
    userCurrency,
    rates,
    supportedCurrencies,
    loading,
    changeCurrency,
    /** Convert an INR amount to userCurrency */
    convertFromINR: (amountINR) => convertFromINR(amountINR, userCurrency, rates),
    /** Format an INR amount as a display string in userCurrency */
    formatPrice: (amountINR) => formatPrice(amountINR, userCurrency, rates),
    /** Format an INR amount in INR regardless of user setting (for instructor views) */
    formatINR: (amountINR) => formatPrice(amountINR, 'INR', rates),
    /** Get the symbol for the current user currency */
    symbol: CURRENCY_SYMBOLS[userCurrency] || userCurrency,
    currencyName: CURRENCY_NAMES[userCurrency] || userCurrency,
  }), [userCurrency, rates, supportedCurrencies, loading, changeCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/** Hook to use currency context anywhere in the app */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
}

export default CurrencyContext;
