"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/context/cart-context";
import { useSession } from "next-auth/react";
import { AIRoomUpload } from "@/components/ai-room-upload";
import { AICartSummary } from "@/components/ai-cart-summary";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2, Sparkles, ChevronLeft, MoveHorizontal, Wand2, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { BACKEND_URL, fetchImageAsBlob } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BeforeAfterSlider } from "@/components/before-after-slider";

export default function AIPreviewPage() {
  const { data: session } = useSession();
  const { items, addItem } = useCart();
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);
  const [sceneAnalysis, setSceneAnalysis] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canGenerate = selectedImage && items.length > 0;

  const handleRecommendProducts = async () => {
    if (!selectedImage) return;

    setIsRecommending(true);
    setRecommendations([]);
    
    try {
      const formData = new FormData();
      formData.append("room_image", selectedImage);

      const response = await fetch(`${BACKEND_URL}/api/v1/render/recommendations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${(session as any)?.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        if (data.recommendations.length > 0) {
          toast.success("AI found some matching products!");
        } else {
          toast.info("AI couldn't find exact matches for this room.");
        }
      }
    } catch (error: any) {
      console.error("Recommendation error:", error);
      toast.error("Failed to get recommendations");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setAiResultUrl(null);
    setSceneAnalysis(null);
    
    try {
      const formData = new FormData();
      formData.append("room_image", selectedImage);
      
      // Convert cart item images to Blobs
      const itemNames = items.map(item => item.name).join(", ");
      formData.append("item_names", itemNames);

      // We need to fetch each product image and add it to formData
      let fetchedCount = 0;
      for (const item of items) {
        try {
          const blob = await fetchImageAsBlob(item.image);
          fetchedCount++;
          // Use item name as filename for better tracking
          const extension = item.image.split(".").pop()?.split("?")[0] || "png";
          const file = new File([blob], `${item.name.replace(/\s+/g, "_")}.${extension}`, { type: blob.type });
          formData.append("item_images", file);
        } catch (err) {
          console.error(`Failed to load image for ${item.name}:`, err);
        }
      }

      if (fetchedCount === 0 && items.length > 0) {
        throw new Error("Could not load any product images. Please check your internet connection or the product images.");
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/render/visualize-with-items`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${(session as any)?.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = "AI generation failed";
        
        if (errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // FastAPI validation error format
            errorMessage = errorData.detail.map((e: any) => `${e.loc.join(".")}: ${e.msg}`).join(", ");
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        setAiResultUrl(`${BACKEND_URL}${data.render_url}`);
        setSceneAnalysis(data.scene_analysis);
        setIsModalOpen(true); // Auto-open the modal
        toast.success("AI Preview generated successfully!", {
          description: "You can now see how the items fit in your room.",
        });
      } else {
        throw new Error("API returned success: false");
      }
    } catch (error: any) {
      console.error("AI Generation error:", error);
      toast.error("Generation Failed", {
        description: error.message || "Something went wrong while connecting to the AI service.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30 bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Shop
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">AI Room Visualization</h1>
              <p className="text-muted-foreground">
                See our products in your space using advanced AI.
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch min-h-[500px]">
            <AIRoomUpload 
              onImageUpload={setSelectedImage} 
              aiResultUrl={aiResultUrl} 
              onViewResult={() => setIsModalOpen(true)}
            />
            <AICartSummary />
          </div>

          {/* AI Recommendations Section */}
          {selectedImage && recommendations.length === 0 && !isRecommending && (
            <div className="flex justify-center mt-[-1rem] mb-4">
              <Button 
                variant="secondary" 
                className="gap-2 rounded-full border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary animate-in fade-in zoom-in shadow-lg"
                onClick={handleRecommendProducts}
              >
                <Wand2 className="h-4 w-4" />
                ✨ AI Ürün Önerisi Al
              </Button>
            </div>
          )}

          {isRecommending && (
             <div className="flex justify-center items-center py-8 animate-in fade-in zoom-in">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <span className="ml-3 text-muted-foreground font-medium">AI odanı analiz edip en uygun eşyaları seçiyor...</span>
             </div>
          )}

          {recommendations.length > 0 && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  AI Önerilen Ürünler
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setRecommendations([])} className="text-muted-foreground">
                  Temizle
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((product) => (
                  <div key={product.id} className="bg-background border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="relative h-48 w-full bg-muted/30">
                      {product.image_url ? (
                        <Image src={`${BACKEND_URL}${product.image_url}`} alt={product.name} fill className="object-contain p-2" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Resim Yok</div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col border-t border-zinc-800">
                      <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">${product.price}</span>
                        <Button 
                          size="sm" 
                          className="h-8 px-4 font-semibold shadow-md"
                          onClick={() => {
                            addItem({
                              id: String(product.id),
                              name: product.name,
                              price: product.price,
                              image: product.image_url ? `${BACKEND_URL}${product.image_url}` : ""
                            });
                            toast.success(`${product.name} sepete eklendi`);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Ekle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Analysis Result */}
          {sceneAnalysis && (
            <Card className="p-6 border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                AI Design Analysis
              </h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {typeof sceneAnalysis === 'string' ? (
                    <p>{sceneAnalysis}</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-2">
                      {Object.entries(sceneAnalysis).map(([key, value]) => (
                        <li key={key}>
                          <strong className="capitalize text-foreground">{key.replace('_', ' ')}: </strong>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Action Button */}
          <div className="flex flex-col items-center gap-6 pt-8">
            <Button
              size="lg"
              className="h-16 px-12 text-xl font-bold rounded-full transition-all group relative overflow-hidden"
              disabled={!canGenerate || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-6 w-6 text-yellow-400 group-hover:scale-125 transition-transform" />
                  Generate AI Preview
                </>
              )}
            </Button>

            {aiResultUrl && !isGenerating && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full gap-2 border-primary/50 hover:bg-primary/5 animate-in fade-in zoom-in duration-500"
                onClick={() => setIsModalOpen(true)}
              >
                <MoveHorizontal className="h-5 w-5" />
                Re-open Comparison Slider
              </Button>
            )}
          </div>

          {!canGenerate && !isGenerating && (
            <p className="text-center text-sm text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-500">
              {!selectedImage ? "Please upload a room image to start" : "Add some items to your cart first"}
            </p>
          )}
        </div>
      </main>

      <Footer />

      {/* AI Result Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] p-0 overflow-hidden bg-zinc-950 border-zinc-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <DialogTitle className="text-white font-medium tracking-tight flex items-center gap-2 pointer-events-auto">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Visualization Result
            </DialogTitle>
            <DialogDescription className="sr-only">
              Comparison view of your room before and after AI generation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedImage && aiResultUrl && (
              <BeforeAfterSlider 
                beforeImage={URL.createObjectURL(selectedImage)} 
                afterImage={aiResultUrl} 
              />
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Drag the center handle to compare
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
