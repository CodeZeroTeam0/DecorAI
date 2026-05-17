"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DesignCard } from "@/components/design-card";
import { BACKEND_URL } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, LayoutGrid, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function MyDesignsPage() {
  const { data: session, status } = useSession();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated") {
      fetchDesigns();
    }
  }, [status]);

  const fetchDesigns = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/designs/my-designs`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch designs");
      }

      const data = await response.json();
      setDesigns(data);
    } catch (error) {
      console.error("Error fetching designs:", error);
      toast.error("Tasarımlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-primary" />
              Tasarımlarım
            </h1>
            <p className="text-muted-foreground text-lg">
              Yapay zeka ile oluşturduğunuz tüm oda tasarımları burada saklanır.
            </p>
          </div>
          <Button asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/ai-preview">
              <Sparkles className="h-4 w-4" />
              Yeni Tasarım Oluştur
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Henüz tasarımınız yok</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Odanızın fotoğrafını yükleyin ve beğendiğiniz ürünleri içinde görün. 
              İlk tasarımınızı oluşturmaya hemen başlayın.
            </p>
            <Button size="lg" asChild>
              <Link href="/ai-preview">Hemen Dene</Link>
            </Button>
          </div>
        )}

        <div className="mt-16 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
          <div className="bg-primary/20 p-2 rounded-lg mt-1">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-1">Bilgi</h4>
            <p className="text-sm text-muted-foreground">
              Tasarımlarınız bulut sunucularımızda güvenle saklanır. Herhangi bir tasarımı sildiğinizde, 
              hem orijinal hem de oluşturulan görsel sistemden kalıcı olarak kaldırılır.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
