"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePhotoCropDialog } from "@/features/users/components/ProfilePhotoCropDialog";

export function StaffProfilePhoto({
  fullName,
  accountLabel,
  preview,
  staged,
  disabled,
  onPhotoReady,
  onSavePhoto,
  photoSaving,
  onRemoveRequest,
}: {
  fullName: string;
  accountLabel: string;
  preview: string;
  staged: boolean;
  disabled: boolean;
  onPhotoReady: (file: File) => void;
  onSavePhoto: () => void;
  photoSaving: boolean;
  onRemoveRequest: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-4 border-b border-border/60 py-5 min-[420px]:flex-row min-[420px]:items-center">
      <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted text-muted-foreground">
        {preview ? <Image src={preview} alt={fullName} fill unoptimized className="object-cover" /> : <UserRound className="size-9" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-foreground">{fullName}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{accountLabel}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="min-h-11" disabled={disabled} onClick={() => inputRef.current?.click()}>
            <Camera className="mr-2 size-4" />Change photo
          </Button>
          {preview && <Button type="button" variant="ghost" size="sm" className="min-h-11 text-destructive" disabled={disabled} onClick={onRemoveRequest}>
            <Trash2 className="mr-2 size-4" />{staged ? "Discard" : "Remove"}
          </Button>}
          {staged && <Button type="button" size="sm" className="min-h-11 w-full min-[420px]:w-auto" disabled={disabled || photoSaving} onClick={onSavePhoto}>
            {photoSaving ? "Saving photo…" : "Save photo"}
          </Button>}
        </div>
        {staged && <p role="status" className="mt-2 text-sm text-muted-foreground">Save this photo separately. Your personal details do not need to change.</p>}
        <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG, or WebP · max 5 MB</p>
        <Input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setCropSource(file); event.currentTarget.value = ""; }} />
      </div>
      {cropSource && <ProfilePhotoCropDialog file={cropSource} onCancel={() => setCropSource(null)} onApply={(file) => { onPhotoReady(file); setCropSource(null); }} />}
    </div>
  );
}
