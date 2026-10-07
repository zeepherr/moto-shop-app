"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";

interface CropPoint { x: number; y: number }

export function ProfilePhotoCropDialog({
  file,
  onCancel,
  onApply,
}: {
  file: File;
  onCancel: () => void;
  onApply: (file: File) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; center: CropPoint } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<CropPoint>({ x: 0.5, y: 0.5 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      imageRef.current = image;
      setReady(true);
    };
    image.src = source;
    return () => URL.revokeObjectURL(source);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !image || !context) return;
    const baseSize = Math.min(image.naturalWidth, image.naturalHeight);
    const cropSize = baseSize / zoom;
    const centerX = Math.min(image.naturalWidth - cropSize / 2, Math.max(cropSize / 2, center.x * image.naturalWidth));
    const centerY = Math.min(image.naturalHeight - cropSize / 2, Math.max(cropSize / 2, center.y * image.naturalHeight));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, centerX - cropSize / 2, centerY - cropSize / 2, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
  }, [center, zoom, ready]);

  const moveCrop = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    const image = imageRef.current;
    if (!drag || !image) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const dx = (event.clientX - drag.x) / rect.width * cropSize;
    const dy = (event.clientY - drag.y) / rect.height * cropSize;
    const halfX = cropSize / (2 * image.naturalWidth);
    const halfY = cropSize / (2 * image.naturalHeight);
    setCenter({
      x: Math.min(1 - halfX, Math.max(halfX, drag.center.x - dx / image.naturalWidth)),
      y: Math.min(1 - halfY, Math.max(halfY, drag.center.y - dy / image.naturalHeight)),
    });
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      onApply(new File([blob], `profile-photo.${extension}`, { type: file.type }));
    }, file.type, 0.92);
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const image = imageRef.current;
    if (!image || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const amount = 0.025 / zoom;
    setCenter((current) => ({
      x: Math.min(1, Math.max(0, current.x + (event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0))),
      y: Math.min(1, Math.max(0, current.y + (event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0))),
    }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-photo-title">
      <div className="my-auto w-full max-w-md rounded-2xl bg-card p-5 text-card-foreground shadow-xl sm:p-6">
        <h2 id="crop-photo-title" className="text-lg font-semibold">Crop profile photo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Drag to position, use arrow keys for fine adjustments, or change the zoom.</p>
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="mx-auto mt-5 aspect-square w-full max-w-80 touch-none rounded-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          tabIndex={0}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { x: event.clientX, y: event.clientY, center };
          }}
          onPointerMove={moveCrop}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerCancel={() => { dragRef.current = null; }}
          onKeyDown={moveWithKeyboard}
          aria-label="Photo crop area. Drag or use the arrow keys to position the image."
        />
        <label className="mt-4 block text-sm font-medium" htmlFor="crop-zoom">Zoom</label>
        <div className="mt-2 flex items-center gap-4">
          <input id="crop-zoom" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-primary" />
          <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{zoom.toFixed(1)}×</span>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={applyCrop} disabled={!ready}>Use photo</Button>
        </div>
      </div>
    </div>
  );
}
