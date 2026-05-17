import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-16">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span>New Spring Collection Available</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Elevate your space with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Premium Decor.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Discover curated, modern furniture and art pieces designed to transform your house into a home you love.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full group" asChild>
              <Link href="#products">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full bg-background/50 backdrop-blur-sm" asChild>
              <Link href="/ai-preview">Try AI Preview</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
