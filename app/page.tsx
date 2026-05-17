import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { UploadSection } from "@/components/upload-section";
import { ProductGrid } from "@/components/product-grid";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProductGrid />
        <UploadSection />
      </main>
      <Footer />
    </div>
  );
}
