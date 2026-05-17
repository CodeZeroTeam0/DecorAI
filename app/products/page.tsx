"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getProducts, type Product, getFullImageUrl } from "@/lib/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/context/cart-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FALLBACK_IMAGE = "/images/sofa_product_1778492758855.png";

export default function ProductsPage() {
  const { addItem } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const toCartItem = (p: Product) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: getFullImageUrl(p.image_url),
  });

  const handleAddToCart = (product: Product) => {
    addItem(toCartItem(product));
    toast.success(`${product.name} added to cart`);
  };

  const handleAIPreview = (product: Product) => {
    addItem(toCartItem(product));
    router.push("/ai-preview");
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30 bg-zinc-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">All Products</h1>
          <p className="text-muted-foreground text-lg">
            Browse our full collection of premium modern decor.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span>Loading products...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-center text-sm max-w-xs">
              {error}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={getFullImageUrl(product.image_url)}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="gap-2 w-3/4"
                      onClick={() => handleAIPreview(product)}
                    >
                      <Eye className="h-4 w-4" />
                      AI Preview
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5 flex-1">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{product.category}</div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                    <span className="font-medium text-primary">${product.price}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
