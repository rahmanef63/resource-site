"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Id } from "@convex/_generated/dataModel";

/**
 * CurrencyContext - Simplified Version
 * 
 * NOTE: This is a simplified version that needs full Convex integration.
 * Currently uses local state to prevent build errors.
 * 
 * TODO: Integrate with actual Convex currency API when ready
 * - Use useQuery(api.features.cmsLite.currency.queries.getRates)
 */

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  availableCurrencies: string[];
  convertPrice: (amount: number, fromCurrency: string) => number;
  formatCurrency: (amount: number, currency?: string) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ 
  children: React.ReactNode; 
  workspaceId: Id<"workspaces"> 
}> = ({ children, workspaceId }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [isLoading] = useState(false);
  
  // TODO: Replace with Convex query
  // const currencyData = useQuery(api.features.cmsLite.currency.queries.getRates, { workspaceId });
  const availableCurrencies = ["USD", "SAR", "EUR", "IDR"];
  const baseCurrency = "USD";

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency && availableCurrencies.includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    } else {
      setSelectedCurrency(baseCurrency);
    }
  }, [availableCurrencies, baseCurrency]);

  const handleSetCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCurrency", currency);
    }
  };

  const convertPrice = (amount: number, fromCurrency: string): number => {
    // TODO: Use actual exchange rates from Convex
    return amount; // Placeholder
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const curr = currency || selectedCurrency;
    const localeMap: Record<string, string> = {
      USD: "en-US",
      SAR: "ar-SA",
      EUR: "de-DE",
      IDR: "id-ID",
    };
    
    try {
      return new Intl.NumberFormat(localeMap[curr] || "en-US", {
        style: "currency",
        currency: curr,
      }).format(amount);
    } catch (error) {
      return `${curr} ${amount.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency: handleSetCurrency,
        availableCurrencies,
        convertPrice,
        formatCurrency,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
