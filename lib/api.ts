export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
}

export async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  const fullUrl = getFullImageUrl(imageUrl);
  const encodedUrl = encodeURI(fullUrl);
  
  console.log(`Fetching image: ${encodedUrl}`);
  
  // Add cache: 'no-cache' to prevent browser from reusing a non-CORS cached response from <img> tags
  const response = await fetch(encodedUrl, { cache: 'no-cache' });
  if (!response.ok) {
    console.error(`Fetch failed for ${encodedUrl}: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch image: ${encodedUrl}`);
  }
  return await response.blob();
}

export async function getProducts(category?: string): Promise<Product[]> {
  const url = new URL(`${BACKEND_URL}/api/v1/products/`);
  if (category) {
    url.searchParams.append("category", category);
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return await response.json();
}

export function getFullImageUrl(url: string | null): string {
  if (!url) return "/images/placeholder.png";
  
  let finalUrl = url;
  if (!url.startsWith("http")) {
    finalUrl = `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  }
  
  // Force IPv4 to avoid Node/browser IPv6 resolution issues with localhost
  return finalUrl.replace("://localhost:", "://127.0.0.1:");
}
