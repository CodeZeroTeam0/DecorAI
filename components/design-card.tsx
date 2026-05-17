"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Expand, ArrowRight, Sparkles, MoveHorizontal } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { BACKEND_URL, getFullImageUrl } from "@/lib/api";

interface DesignCardProps {
  design: {
    id: number;
    original_image: string;
    generated_image: string;
    created_at: string;
    product: {
      name: string;
      image_url: string;
    };
  };
}

export function DesignCard({ design }: DesignCardProps) {
  const date = new Date(design.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const originalImage = getFullImageUrl(design.original_image);
  const generatedImage = getFullImageUrl(design.generated_image);

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-0 relative aspect-video overflow-hidden">
        <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full">
                <Expand className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] p-0 overflow-hidden bg-zinc-950 border-zinc-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <DialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <DialogTitle className="text-white font-medium tracking-tight flex items-center gap-2 pointer-events-auto">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {design.product.name}
                  <span className="text-zinc-400 text-sm font-normal ml-2">· {date}</span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View the original and AI generated design comparison.
                </DialogDescription>
              </DialogHeader>

              <div className="relative w-full h-[80vh] flex items-center justify-center">
                <BeforeAfterSlider
                  beforeImage={originalImage}
                  afterImage={generatedImage}
                />
              </div>

              {/* Bottom pill hint */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 flex items-center gap-2">
                  <MoveHorizontal className="h-3.5 w-3.5" />
                  Karşılaştırmak için sürükle
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Image
          src={generatedImage}
          alt={design.product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{design.product.name}</h3>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            AI Render
          </Badge>
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <Calendar className="h-3 w-3" />
          {date}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex -space-x-2">
          <div className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden">
            <Image 
              src={originalImage} 
              alt="Original" 
              fill 
              unoptimized
              className="object-cover" 
            />
          </div>
          <div className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden">
            <Image 
              src={generatedImage} 
              alt="Generated" 
              fill 
              unoptimized
              className="object-cover" 
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" className="group/btn h-8">
          View Detail
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
