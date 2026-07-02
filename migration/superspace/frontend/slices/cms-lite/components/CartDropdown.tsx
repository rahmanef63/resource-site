"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, itemCount, removeItem, updateQuantity } = useCart();
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t("cart")}</h3>
            <button aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!cart || (Array.isArray(cart) && cart.length === 0) ? (
              <div className="p-8 text-center text-foreground/60">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>{t("emptyCart")}</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                      {(Array.isArray(cart) ? cart : []).map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                          sizes="64px"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.productName}</h4>
                        <p className="text-sm text-foreground/70">
                          ${item.productPrice} x {item.quantity}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-xs border rounded hover:bg-muted"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-xs border rounded hover:bg-muted"
                          >
                            +
                          </button>
                          <button aria-label="Delete"
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">{t("total")}:</span>
                    <span className="font-bold text-lg">${Array.isArray(cart) ? cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2) : '0.00'}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t("checkout")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
