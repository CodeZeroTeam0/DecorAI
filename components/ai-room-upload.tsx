"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, MoveHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BeforeAfterSlider } from "./before-after-slider";

interface AIRoomUploadProps {
  onImageUpload: (file: File | null) => void;
  aiResultUrl?: string | null;
  onViewResult?: () => void;
}

export function AIRoomUpload({ onImageUpload, aiResultUrl, onViewResult }: AIRoomUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeImage = () => {
    setPreview(null);
    onImageUpload(null);
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Step 1: Upload Your Room</h2>
        <p className="text-sm text-muted-foreground">
          Take a clear photo of your space for the best results.
        </p>
      </div>

      {!preview && !aiResultUrl ? (
        <div
          {...getRootProps()}
          className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-12 transition-colors cursor-pointer ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium text-center">
            {isDragActive ? "Drop the image here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            PNG, JPG or HEIC (max. 10MB)
          </p>
        </div>
      ) : aiResultUrl ? (
        <div 
          className="relative flex-1 rounded-xl overflow-hidden group cursor-pointer"
          onClick={onViewResult}
        >
          <Image
            src={aiResultUrl}
            alt="AI Result preview"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <MoveHorizontal className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-white text-sm font-bold">View Comparison</span>
          </div>
          <div className="absolute top-4 left-4 z-20 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold shadow-lg border border-white/20">
            AI Result Ready
          </div>
          <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 rounded-xl overflow-hidden group">
          <Image
            src={preview || ""}
            alt="Room preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remove Image
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
