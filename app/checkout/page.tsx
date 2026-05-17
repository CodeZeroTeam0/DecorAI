"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/context/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, 
  CreditCard, 
  Calendar, 
  Lock, 
  User, 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/lib/api";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // Redirect if cart is empty, unless we are in the success screen
  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      const timer = setTimeout(() => {
        router.push("/ai-preview");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [items, router]);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  // Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const steps = [
    "Güvenli ödeme kanalı kuruluyor...",
    "Kart bilgileri doğrulanıyor...",
    "Banka onayı alınıyor...",
    "Siparişiniz kaydediliyor..."
  ];

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formattedValue);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value.substring(0, 4);
    if (formattedValue.length > 2) {
      formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2)}`;
    }
    setCardExpiry(formattedValue);
  };

  // Handle CVV input
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCardCvv(value.substring(0, 3));
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !address || !city || !cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
  };

  // Simulation of payment steps
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setOrderNumber(`DEC-${Math.floor(100000 + Math.random() * 900000)}`);
          setIsSuccess(true);
          setIsProcessing(false);
          // Don't clear cart immediately so we can render items on success screen
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Clean cart when leaving success screen
  const handleSuccessClose = () => {
    clearCart();
    router.push("/");
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Sepetiniz Boş</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Ödeme sayfasına yönlendirilebilmek için sepetinizde ürün bulunmalıdır. Yönlendiriliyorsunuz...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 selection:bg-primary/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Step Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-center items-center p-4 animate-in fade-in duration-300">
            <Card className="p-8 max-w-md w-full bg-zinc-900 border-zinc-800 text-center flex flex-col items-center gap-6 shadow-2xl">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <Lock className="h-6 w-6 text-primary absolute inset-0 m-auto" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Güvenli Ödeme Yapılıyor</h3>
                <p className="text-sm text-primary font-medium animate-pulse">
                  {steps[processingStep]}
                </p>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${((processingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sayfayı yenilemeyin veya kapatmayın. 3D Secure güvenli katmanı devrededir.
              </p>
            </Card>
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-500">
            <Card className="p-8 border-primary/20 bg-gradient-to-b from-primary/5 to-zinc-950 text-center shadow-2xl relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
                Ödeme Başarıyla Tamamlandı!
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Harika tasarımların hayata geçmek üzere! Siparişiniz başarıyla alındı ve hazırlık aşamasına geçildi.
              </p>

              {/* Order Box Details */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left space-y-4 mb-8 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sipariş No</span>
                  <span className="text-sm font-bold text-foreground tracking-wider">{orderNumber}</span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Satın Alınan Eşyalar</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground line-clamp-1 flex-1">{item.name} <strong className="text-zinc-500">x{item.quantity}</strong></span>
                        <span className="text-foreground font-medium ml-2">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                  <span className="text-sm text-muted-foreground font-semibold">Toplam Tahsil Edilen Tutar</span>
                  <span className="text-lg font-bold text-emerald-400">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={handleSuccessClose} 
                  className="w-full sm:w-auto h-12 px-8 font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Alışverişe Devam Et
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    clearCart();
                    router.push("/ai-preview");
                  }} 
                  className="w-full sm:w-auto h-12 px-8 font-semibold rounded-xl border-zinc-800 text-foreground hover:bg-zinc-900"
                >
                  Oda Görselleştirmeye Dön
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
              <Link
                href="/ai-preview"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                AI Room Visualizer'a Dön
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Güvenli Ödeme Ekranı</h1>
              <p className="text-muted-foreground text-sm">
                Siparişinizi tamamlamak için adres ve kart bilgilerinizi girin.
              </p>
            </div>

            {/* Split Grid */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Form & Credit Card Visualizer (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 💳 Live CSS Credit Card Container */}
                <div className="flex justify-center py-4 select-none perspective-[1000px]">
                  <div 
                    className={`relative w-80 sm:w-96 h-48 sm:h-56 rounded-2xl text-white shadow-2xl transition-all duration-700 preserve-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    
                    {/* Front of Card */}
                    <div className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-800 backface-hidden flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] tracking-widest text-zinc-500 font-bold uppercase">DECO AI PREMIUM</span>
                          <div className="h-8 w-10 bg-gradient-to-br from-amber-400 to-amber-200 rounded-md relative opacity-85">
                            {/* Chip lines */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-950/20" />
                            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-zinc-950/20" />
                          </div>
                        </div>
                        <span className="text-lg font-extrabold italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400">DecoAI</span>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Card Number */}
                        <div className="text-xl sm:text-2xl font-mono tracking-widest text-zinc-100 min-h-[32px]">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider block">Kart Sahibi</span>
                            <span className="text-xs tracking-wider truncate block max-w-[200px] font-mono text-zinc-200 uppercase">
                              {cardHolder || "AD SOYAD"}
                            </span>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider block">Son Kul.</span>
                            <span className="text-xs font-mono text-zinc-200 tracking-widest">
                              {cardExpiry || "AA/YY"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-black via-zinc-900 to-zinc-850 border border-zinc-800 rotate-y-180 backface-hidden flex flex-col justify-between py-6">
                      <div className="w-full h-10 bg-zinc-950" />
                      
                      <div className="px-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-8 bg-zinc-700/50 rounded flex items-center justify-end px-3 text-xs italic text-zinc-400 font-mono select-none">
                            DecoAI Authorized Signature
                          </div>
                          <div className="w-12 h-8 bg-white text-zinc-950 rounded flex items-center justify-center font-mono font-bold text-sm tracking-widest">
                            {cardCvv || "•••"}
                          </div>
                        </div>
                        <p className="text-[7px] text-zinc-500 text-center leading-relaxed">
                          Bu sanal ödeme kartı DecoAI iç mimari prototipi için hazırlanmıştır. Gerçek para tahsilatı yapılmaz. Güvenli ödeme simülasyonu sunar.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Form Input fields */}
                <form onSubmit={handlePay} className="space-y-6">
                  {/* Address Section */}
                  <Card className="p-6 border-zinc-800/80 bg-zinc-950 space-y-4 rounded-2xl">
                    <h3 className="text-md font-bold text-foreground flex items-center gap-2 pb-2 border-b border-zinc-900">
                      <MapPin className="h-4 w-4 text-primary" /> Teslimat & Fatura Bilgileri
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Müşteri Ad Soyad *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="Cihat Erensoy"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                          />
                          <User className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">E-posta Adresi *</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            required
                            placeholder="cihat@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                          />
                          <Lock className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-semibold">Gönderim Adresi *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Örnek Mahallesi, İstanbul Yolu Sokak, No: 4"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-11 px-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Şehir / İlçe *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="İstanbul / Kadıköy"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-11 px-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Posta Kodu</label>
                        <input 
                          type="text" 
                          placeholder="34720"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full h-11 px-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Payment Card Section */}
                  <Card className="p-6 border-zinc-800/80 bg-zinc-950 space-y-4 rounded-2xl">
                    <h3 className="text-md font-bold text-foreground flex items-center gap-2 pb-2 border-b border-zinc-900">
                      <CreditCard className="h-4 w-4 text-primary" /> Kart İle Ödeme
                    </h3>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-semibold">Kart Üzerindeki İsim *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="CİHAT ERENSOY"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        onFocus={() => setIsFlipped(false)}
                        className="w-full h-11 px-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-semibold">Kart Numarası *</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          placeholder="4355 8890 1234 5678"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          onFocus={() => setIsFlipped(false)}
                          className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground font-mono"
                        />
                        <CreditCard className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">Son Kullanma (AA/YY) *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="12/29"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            onFocus={() => setIsFlipped(false)}
                            className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground font-mono"
                          />
                          <Calendar className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-semibold">CVC / CVV *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="•••"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            onFocus={() => setIsFlipped(true)}
                            onBlur={() => setIsFlipped(false)}
                            className="w-full h-11 pl-10 pr-4 text-sm bg-zinc-900 border border-zinc-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground font-mono"
                          />
                          <Lock className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2"
                  >
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    ${totalPrice.toLocaleString()} Ödeme Yap & Siparişi Tamamla
                  </Button>
                </form>

              </div>

              {/* Order Summary (4 cols) */}
              <div className="lg:col-span-4">
                <Card className="p-6 border-zinc-800 bg-zinc-950 space-y-6 sticky top-24 rounded-2xl">
                  <h3 className="text-lg font-bold text-foreground pb-2 border-b border-zinc-900 flex justify-between items-center">
                    Sipariş Özeti <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{items.length} Çeşit</span>
                  </h3>

                  {/* Selected Items List */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          <Image 
                            src={getFullImageUrl(item.image)} 
                            alt={item.name} 
                            fill 
                            className="object-cover"
                            unoptimized 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-foreground truncate">{item.name}</h4>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">Miktar: {item.quantity} adet</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Pricing Details */}
                  <div className="border-t border-zinc-900 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Ara Toplam</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Kargo Ücreti</span>
                      <span className="text-emerald-400 font-medium">Ücretsiz</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>KDV (Simüle %18)</span>
                      <span>Dahil</span>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-foreground font-bold">
                      <span>Ödenecek Tutar</span>
                      <span className="text-xl text-primary">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-[10px] text-muted-foreground leading-normal">
                    <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" />
                    <span>Ödemeleriniz 256-bit SSL güvenlik sertifikası ile şifrelenir. Kişisel kart bilgileriniz sunucularımızda saklanmaz.</span>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
