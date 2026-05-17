"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "decoai_cart";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [didLoad, setDidLoad] = useState(false);
  const [hasSyncedBackend, setHasSyncedBackend] = useState(false);

  // Reset sync status on logout/session change
  useEffect(() => {
    if (!session) {
      setHasSyncedBackend(false);
    }
  }, [session]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (_) {}
    setDidLoad(true);
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!didLoad) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, didLoad]);

  // 1. Initial merge on login/restore session: merge local items to backend, then load final backend cart
  useEffect(() => {
    if (!session || !didLoad || hasSyncedBackend) return;

    const accessToken = (session as any).accessToken;
    if (!accessToken) return;

    const syncWithBackend = async () => {
      // Push local items to backend (merge) if there are any
      if (items.length > 0) {
        await fetch(`${BACKEND_URL}/api/v1/cart/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(
            items.map((i) => ({ product_id: i.id, quantity: i.quantity }))
          ),
        }).catch(() => {});
      }

      // Fetch combined cart from backend and set it as local state
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/cart/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data: any[] = await res.json();
          
          // Deduplicate by product_id
          const mergedItems: Record<number, CartItem> = {};
          data.forEach((d) => {
            const pid = d.product_id;
            if (mergedItems[pid]) {
              mergedItems[pid].quantity += d.quantity;
            } else {
              mergedItems[pid] = {
                id: pid,
                name: d.product.name,
                price: d.product.price,
                image: d.product.image_url || "",
                quantity: d.quantity,
              };
            }
          });
          
          setItems(Object.values(mergedItems));
          setHasSyncedBackend(true);
        }
      } catch (_) {}
    };

    syncWithBackend();
  }, [session, didLoad, hasSyncedBackend]);

  // 2. Real-time sync: save cart to backend database whenever items list changes (after initial merge)
  useEffect(() => {
    if (!session || !didLoad || !hasSyncedBackend) return;

    const accessToken = (session as any).accessToken;
    if (!accessToken) return;

    const saveToBackend = async () => {
      await fetch(`${BACKEND_URL}/api/v1/cart/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(
          items.map((i) => ({ product_id: i.id, quantity: i.quantity }))
        ),
      }).catch((err) => {
        console.error("Failed to sync cart changes to backend:", err);
      });
    };

    saveToBackend();
  }, [items, session, didLoad, hasSyncedBackend]);

  const totalPrice = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const totalItems = items.reduce((t, i) => t + i.quantity, 0);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) { removeItem(id); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
