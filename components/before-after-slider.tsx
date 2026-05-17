"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full cursor-ew-resize select-none group bg-zinc-900/50"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Background Blur Effect (Optional but looks premium) */}
      <div className="absolute inset-0 opacity-20 blur-2xl scale-110">
        <Image src={afterImage} alt="" fill className="object-cover" unoptimized />
      </div>

      {/* After Image (Background) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image 
          src={afterImage} 
          alt="After" 
          fill 
          className="object-contain" 
          priority
          unoptimized
        />
        <div className="absolute bottom-6 right-6 bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md shadow-2xl backdrop-blur-md z-10 border border-white/10 uppercase tracking-wider">
          After Design
        </div>
      </div>

      {/* Before Image (Overlay) */}
      <div 
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image 
          src={beforeImage} 
          alt="Before" 
          fill 
          className="object-contain bg-zinc-900/20"
          priority
          unoptimized
        />
        <div className="absolute bottom-6 left-6 bg-black/60 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md shadow-2xl backdrop-blur-md z-20 border border-white/5 border-r-0 uppercase tracking-wider">
          Before
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 z-30 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute inset-y-0 -left-px w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-1/2 -left-6 -translate-y-1/2 h-12 w-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] border-4 border-zinc-100 flex items-center justify-center pointer-events-auto hover:scale-110 transition-transform active:scale-95 group-hover:shadow-primary/40 group-hover:border-primary/20">
          <MoveHorizontal className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Comparison Badge */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white text-[10px] font-medium tracking-[0.2em] uppercase">
          Slide to compare
        </div>
      </div>
    </div>
  );
}
