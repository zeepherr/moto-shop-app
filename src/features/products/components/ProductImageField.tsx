"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProductImageFieldProps {
  currentImageUrl: string | null;
  file: File | null;
  onFileChange: (file: File) => void;
  onCancelFile: () => void;
  disabled?: boolean;
}

export const ProductImageField: React.FC<ProductImageFieldProps> = ({
  currentImageUrl,
  file,
  onFileChange,
  onCancelFile,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const updatePreview = (nextFile: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextFile ? URL.createObjectURL(nextFile) : null;
    setPreviewUrl(previewUrlRef.current);
  };

  const handleChooseImage = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError("");

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setError("Image must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    updatePreview(selectedFile);
    onFileChange(selectedFile);
  };

  const handleCancelImage = () => {
    setError("");
    updatePreview(null);
    onCancelFile();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const displayImage = previewUrl || currentImageUrl;
  const isNewImage = Boolean(file);
  const hasExistingImage = Boolean(currentImageUrl);

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">Product image</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {displayImage ? (
        <div className="group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border/80 bg-muted">
          <img
            src={displayImage}
            alt="Product preview"
            className="size-full object-contain p-3"
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/85 p-2 backdrop-blur-xs">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {isNewImage ? file?.name : "Current product image"}
            </p>

            {isNewImage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelImage}
                disabled={disabled}
                aria-label="Cancel selected image"
                className="size-7 p-0 shrink-0 cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleChooseImage}
                disabled={disabled}
                className="h-7 px-2.5 text-xs gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                Replace
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleChooseImage}
          disabled={disabled}
          className="flex aspect-4/3 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex size-11 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
            <ImagePlus className="size-5" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Choose product image</p>
            <p className="text-xs text-muted-foreground">JPEG, PNG or WebP · Max 5MB</p>
          </div>
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && !hasExistingImage && !isNewImage && (
        <p className="text-xs text-muted-foreground">Optional</p>
      )}
    </div>
  );
};
