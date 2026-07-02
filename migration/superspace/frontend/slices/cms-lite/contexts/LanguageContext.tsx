"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Locale = "id" | "en" | "ar";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Locale, Record<string, string>> = {
  id: {
    home: "Beranda",
    products: "Produk",
    blog: "Blog",
    portfolio: "Portfolio",
    contact: "Kontak",
    services: "Layanan",
    aboutUs: "Tentang Kami",
    buyNow: "Beli Sekarang",
    readMore: "Baca Selengkapnya",
    viewPortfolio: "Lihat Portfolio",
    tagline: "Kami mengabadikan setiap momen dengan sentuhan artistik khas nuansa Haramain",
    addToCart: "Tambah ke Keranjang",
    cart: "Keranjang",
    emptyCart: "Keranjang Anda kosong",
    total: "Total",
    checkout: "Checkout",
    subscribe: "Berlangganan",
    hireMe: "Sewa Saya",
    learnMore: "Pelajari Lebih Lanjut",
    contactUs: "Hubungi Kami",
  },
  en: {
    home: "Home",
    products: "Products",
    blog: "Blog",
    portfolio: "Portfolio",
    contact: "Contact",
    services: "Services",
    aboutUs: "About Us",
    buyNow: "Buy Now",
    readMore: "Read More",
    viewPortfolio: "View Portfolio",
    tagline: "We capture every moment with artistic touches of the Haramain ambiance",
    addToCart: "Add to Cart",
    cart: "Cart",
    emptyCart: "Your cart is empty",
    total: "Total",
    checkout: "Checkout",
    subscribe: "Subscribe",
    hireMe: "Hire Me",
    learnMore: "Learn More",
    contactUs: "Contact Us",
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    blog: "المدونة",
    portfolio: "معرض الأعمال",
    contact: "اتصل بنا",
    services: "الخدمات",
    aboutUs: "من نحن",
    buyNow: "اشتر الآن",
    readMore: "اقرأ المزيد",
    viewPortfolio: "عرض معرض الأعمال",
    tagline: "نوثّق كل لحظة بلمسة فنية تنبض بأجواء الحرمين",
    addToCart: "أضف إلى السلة",
    cart: "السلة",
    emptyCart: "سلتك فارغة",
    total: "الإجمالي",
    checkout: "الدفع",
    subscribe: "اشترك",
    hireMe: "وظفني",
    learnMore: "اعرف المزيد",
    contactUs: "اتصل بنا",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");

  const t = (key: string) => translations[locale][key] || key;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
