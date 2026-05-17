import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DecoAI – AI Powered Home Decor",
  description: "Yapay zeka ile odanızı dönüştürün. Ev dekorasyon ürünlerini kendi odanızda sanal olarak deneyin.",
};

import { CartProvider } from "@/lib/context/cart-context";
import { Toaster } from "sonner";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <CartProvider>
            {children}
            <Toaster position="top-center" richColors />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
