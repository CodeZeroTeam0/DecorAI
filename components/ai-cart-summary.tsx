"use client";
import { useCart } from "@/lib/context/cart-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/api";

export function AICartSummary() {
  const { items, totalItems, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <Card className="p-6 h-full flex flex-col border-zinc-800 bg-zinc-950">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Step 2: Selected Products</h2>
          <p className="text-sm text-muted-foreground">
            We'll visualize these {totalItems} items in your space.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-2 border-zinc-850 bg-zinc-950 text-foreground hover:bg-zinc-900 hover:text-foreground">
          <Link href="/#products">
            <Plus className="h-4 w-4" />
            Add More
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 min-h-[220px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-3">
              <span className="text-muted-foreground font-bold">?</span>
            </div>
            <p className="text-sm text-muted-foreground">No products in cart</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/40 transition-all">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                <Image
                  src={getFullImageUrl(item.image)}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">${item.price}</p>
              </div>
              
              {/* Quantity Controls and Delete */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground hover:bg-zinc-800"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-8 text-center text-xs font-semibold select-none text-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground hover:bg-zinc-800"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-900 space-y-4">
          <div className="flex justify-between items-center text-foreground px-1">
            <span className="text-sm text-muted-foreground font-medium">Toplam Tutar</span>
            <span className="text-xl font-bold text-primary">${totalPrice.toLocaleString()}</span>
          </div>
          
          <Button asChild className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2">
            <Link href="/checkout">
              💳 Satın Al & Ödeme Yap
            </Link>
          </Button>
        </div>
      )}

      <Button asChild variant="outline" className="w-full sm:hidden gap-2 border-zinc-850 bg-zinc-950 text-foreground hover:bg-zinc-900 hover:text-foreground mt-2">
        <Link href="/#products">
          <Plus className="h-4 w-4" />
          Select New Product
        </Link>
      </Button>
    </Card>
  );
}

