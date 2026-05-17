import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function UploadSection() {
  return (
    <section id="studio" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Not sure how it will look?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Try our AI Preview tool. Upload a photo of your room and instantly visualize our products in your space before you buy.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Upload Area */}
          <Link href="/ai-preview" className="block h-full">
            <Card className="p-8 border-dashed border-2 border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[350px] text-center h-full">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload your room photo</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Drag & drop your image here, or click to browse. Supported formats: JPG, PNG, HEIC.
              </p>
              <Button variant="outline" size="sm">Browse Files</Button>
            </Card>
          </Link>

          {/* Demonstration */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative aspect-video rounded-xl overflow-hidden border border-border">
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <Image
                  src="/images/empty_room_1778492705978.png"
                  alt="Empty Room"
                  fill
                  className="object-cover z-10"
                />
                <div className="absolute top-2 left-2 z-20 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded font-medium">Your Room</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 relative aspect-video rounded-xl overflow-hidden border border-primary/30 shadow-lg">
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <Image
                  src="/images/decorated_room_1778492722698.png"
                  alt="Decorated Room"
                  fill
                  className="object-cover z-10"
                />
                <div className="absolute top-2 left-2 z-20 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded font-medium">With Our Decor</div>
              </div>
            </div>

            <ul className="space-y-2 pt-2">
              {["Perfectly scaled to your room", "Realistic lighting integration"].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary/70" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
