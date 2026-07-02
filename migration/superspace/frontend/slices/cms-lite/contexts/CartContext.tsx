"use client";

import React, { createContext, useContext, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

/**
 * CartContext - Convex Version
 * 
 * NOTE: This is a simplified version that needs full Convex integration.
 * Currently provides mock functionality to prevent build errors.
 * 
 * TODO: Integrate with actual Convex cart API when ready
 * - Use useQuery(api.features.cmsLite.cart.queries.getCurrentCart)
 * - Use useMutation for add/update/remove operations
 */

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: any;
}

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ 
  children: React.ReactNode; 
  workspaceId: Id<"workspaces"> 
}> = ({ 
  children, 
  workspaceId 
}) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with Convex queries
  // const cartItems = useQuery(api.features.cmsLite.cart.queries.getCurrentCart, { workspaceId });
  // const addToCartMutation = useMutation(api.features.cmsLite.cart.actions.addToCart);
  
  const addToCart = async (productId: string, quantity: number = 1) => {
    setIsLoading(true);
    try {
      toast({ 
        title: "Added to cart", 
        description: "Product has been added to your cart" 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: message || "Failed to add to cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    setIsLoading(true);
    try {
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to update quantity:", error);
      toast({
        title: "Error",
        description: message || "Failed to update quantity",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    setIsLoading(true);
    try {
      toast({ 
        title: "Removed from cart", 
        description: "Item has been removed from your cart" 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to remove item:", error);
      toast({
        title: "Error",
        description: message || "Failed to remove item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      setCart([]);
      toast({ 
        title: "Cart cleared", 
        description: "All items have been removed from your cart" 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to clear cart:", error);
      toast({
        title: "Error",
        description: message || "Failed to clear cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        total,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
