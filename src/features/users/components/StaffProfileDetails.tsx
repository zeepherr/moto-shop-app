"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteStaffProfilePhotoAction, updateStaffProfileAction, updateStaffProfilePhotoAction } from "@/features/users/actions/user.actions";
import { StaffProfilePhoto } from "./StaffProfilePhoto";
import type { StaffProfileData } from "./staff-profile.types";

export function StaffProfileDetails({ user }: { user: StaffProfileData }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.userInfo?.photoUrl ?? "");
  const [confirmPhotoDelete, setConfirmPhotoDelete] = useState(false);
  const [saving, startSaving] = useTransition();
  const [photoPending, startPhotoTransition] = useTransition();
  const localPreviewUrl = useRef<string | null>(null);
  const fullName = `${firstName} ${lastName}`.trim();
  const detailsChanged = firstName !== user.firstName || lastName !== user.lastName || phone.trim() !== (user.phone ?? "");

  useEffect(() => () => {
    if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
  }, []);

  const applyPhoto = (file: File) => {
    if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
    localPreviewUrl.current = URL.createObjectURL(file);
    setPhotoFile(file);
    setPreview(localPreviewUrl.current);
  };

  const save = () => startSaving(async () => {
    try {
      const result = await updateStaffProfileAction({ firstName, lastName, phone: phone.trim() || null });
      if (!result.success) {
        toast.error(result.error || "Could not update profile.");
        return;
      }
      toast.success("Personal details updated.");
      router.refresh();
    } catch {
      toast.error("Could not update profile. Check your connection and try again.");
    }
  });

  const savePhoto = () => startPhotoTransition(async () => {
    if (!photoFile) return;
    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("purpose", "profile");
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const upload = await response.json().catch(() => null) as {
        success?: boolean; error?: string; data?: { key?: string; publicUrl?: string };
      } | null;
      if (!response.ok || !upload?.success || !upload.data?.key || !upload.data.publicUrl) {
        toast.error(upload?.error || "Could not upload profile photo.");
        return;
      }
      const result = await updateStaffProfilePhotoAction({ photoKey: upload.data.key });
      if (!result.success) {
        toast.error(result.error || "Could not save profile photo.");
        return;
      }
      setPreview(upload.data.publicUrl);
      setPhotoFile(null);
      if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
      localPreviewUrl.current = null;
      toast.success("Profile photo updated.");
      router.refresh();
    } catch {
      toast.error("Could not update profile photo. Check your connection and try again.");
    }
  });

  const removePhoto = () => startPhotoTransition(async () => {
    if (photoFile) {
      if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
      localPreviewUrl.current = null;
      setPhotoFile(null);
      setPreview(user.userInfo?.photoUrl ?? "");
      setConfirmPhotoDelete(false);
      return;
    }
    try {
      const result = await deleteStaffProfilePhotoAction();
      if (!result.success) {
        toast.error(result.error || "Could not remove profile photo.");
        return;
      }
      setPreview("");
      setConfirmPhotoDelete(false);
      toast.success("Profile photo removed.");
      router.refresh();
    } catch {
      toast.error("Could not remove profile photo. Check your connection and try again.");
    }
  });

  return (
    <section className="min-w-0 py-1" aria-labelledby="staff-personal-details-heading">
      <div className="border-b border-border/70 pb-4">
        <h2 id="staff-personal-details-heading" className="text-base font-semibold text-foreground">Personal details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Keep your contact details current for the shop.</p>
      </div>

      <StaffProfilePhoto
        fullName={fullName}
        accountLabel={`Staff account · #${user.id}`}
        preview={preview}
        staged={Boolean(photoFile)}
        disabled={saving || photoPending}
        onPhotoReady={applyPhoto}
        onSavePhoto={savePhoto}
        photoSaving={photoPending}
        onRemoveRequest={() => setConfirmPhotoDelete(true)}
      />

      <form className="grid min-w-0 gap-x-4 gap-y-4 pt-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); save(); }}>
        <ProfileField id="staff-first-name" label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" required />
        <ProfileField id="staff-last-name" label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" required />
        <div className="min-w-0 sm:col-span-2">
          <Label htmlFor="staff-phone">Phone number <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="staff-phone" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 min-h-11" />
        </div>
        <div className="pt-1 sm:col-span-2">
          <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={saving || photoPending || !detailsChanged}>
            {saving ? "Saving…" : "Save personal details"}
          </Button>
        </div>
      </form>

      <Dialog open={confirmPhotoDelete} onOpenChange={setConfirmPhotoDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{photoFile ? "Discard this photo?" : "Remove profile photo?"}</DialogTitle>
            <DialogDescription>{photoFile ? "Your saved profile photo will stay in place." : "Your account will use the initials placeholder until you add another photo."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmPhotoDelete(false)} disabled={photoPending}>Keep photo</Button>
            <Button type="button" variant="destructive" onClick={removePhoto} disabled={photoPending}>{photoPending ? "Removing…" : photoFile ? "Discard photo" : "Remove photo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ProfileField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} maxLength={80} required={required} className="mt-2 min-h-11" />
    </div>
  );
}
