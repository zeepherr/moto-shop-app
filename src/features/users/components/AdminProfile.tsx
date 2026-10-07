"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteAdminProfilePhotoAction, updateAdminProfileAction } from "@/features/users/actions/user.actions";
import { cancelAdminEmailChangeAction, requestAdminEmailChangeAction, verifyAdminEmailChangeAction } from "@/features/users/actions/email-change.actions";
import { ProfilePhotoCropDialog } from "@/features/users/components/ProfilePhotoCropDialog";
import { AdminPasswordChange } from "@/features/users/components/AdminPasswordChange";
import { OtpCodeInput } from "@/features/auth/components/OtpCodeInput";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/features/auth/constants";

interface AdminProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  userInfo: { photoUrl: string | null } | null;
  emailChangeOtpLastSentAt: string | null;
  emailResendCooldownSeconds: number;
  emailChangeRequest: { newEmail: string; otpExpiresAt: string; otpAttempts: number } | null;
}

export function AdminProfile({ user }: { user: AdminProfileData }) {
  type EmailMode = "view" | "edit" | "verify";
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.userInfo?.photoUrl ?? "");
  const [currentEmail, setCurrentEmail] = useState(user.email ?? "");
  const [email, setEmail] = useState(user.emailChangeRequest?.newEmail ?? user.email ?? "");
  const [emailVerified, setEmailVerified] = useState(Boolean(user.emailVerifiedAt));
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeInvalid, setEmailCodeInvalid] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [resendSeconds, setResendSeconds] = useState(user.emailResendCooldownSeconds);
  const [emailAttemptsRemaining, setEmailAttemptsRemaining] = useState(
    user.emailChangeRequest ? Math.max(0, 5 - user.emailChangeRequest.otpAttempts) : 5,
  );
  const [confirmPhotoDelete, setConfirmPhotoDelete] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const localPreviewUrl = useRef<string | null>(null);
  const [profilePending, startProfileTransition] = useTransition();
  const [photoPending, startPhotoTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [emailMode, setEmailMode] = useState<EmailMode>(user.emailChangeRequest ? "verify" : "view");
  const [codeExpiresSeconds, setCodeExpiresSeconds] = useState(() => user.emailChangeRequest
    ? Math.max(0, Math.ceil((new Date(user.emailChangeRequest.otpExpiresAt).getTime() - Date.now()) / 1000))
    : 0);
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const joinedAt = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  useEffect(() => {
    return () => {
      if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
    };
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (emailMode !== "verify" || codeExpiresSeconds <= 0) return;
    const timer = window.setTimeout(() => setCodeExpiresSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [codeExpiresSeconds, emailMode]);

  const applyPhoto = (file: File) => {
    if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
    localPreviewUrl.current = URL.createObjectURL(file);
    setPhoto(file);
    setPreview(localPreviewUrl.current);
    setCropSource(null);
  };

  const removePhoto = () => startPhotoTransition(async () => {
    if (photo) {
      if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
      localPreviewUrl.current = null;
      setPhoto(null);
      setPreview(user.userInfo?.photoUrl ?? "");
      return;
    }
    const result = await deleteAdminProfilePhotoAction();
    if (!result.success) {
      toast.error(result.error || "Could not delete profile photo.");
      return;
    }
    setPreview("");
    setConfirmPhotoDelete(false);
    toast.success("Profile photo deleted.");
  });

  const save = () => startProfileTransition(async () => {
    try {
      let photoKey: string | undefined;
      let uploadedPhotoUrl: string | undefined;
      if (photo) {
        const formData = new FormData();
        formData.append("image", photo);
        formData.append("purpose", "profile");
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const result = await response.json().catch(() => null) as {
          success?: boolean; error?: string; data?: { key?: string; publicUrl?: string };
        } | null;
        if (!response.ok || !result?.success || !result.data?.key || !result.data.publicUrl) {
          toast.error(result?.error || "Could not upload profile photo.");
          return;
        }
        photoKey = result.data.key;
        uploadedPhotoUrl = result.data.publicUrl;
      }

      const result = await updateAdminProfileAction({ firstName, lastName, phone, photoKey });
      if (!result.success) {
        toast.error(result.error || "Could not update profile.");
        return;
      }
      if (uploadedPhotoUrl) {
        setPreview(uploadedPhotoUrl);
        if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
        localPreviewUrl.current = null;
      }
      setPhoto(null);
      toast.success("Profile updated.");
    } catch {
      toast.error("Could not update profile. Check your connection and try again.");
    }
  });

  const requestEmailCode = () => startEmailTransition(async () => {
    setEmailError("");
    setEmailNotice("");
    try {
      const result = await requestAdminEmailChangeAction({ email });
      if (!result.success) {
        setEmailError(result.error || "Could not send a verification code.");
        if (result.resendAvailableAt) {
          setResendSeconds(Math.max(0, Math.ceil((new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000)));
        }
        return;
      }
      setEmailCode("");
      setEmailCodeInvalid(false);
      setEmailMode("verify");
      setEmailNotice("");
      setResendSeconds(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
      setCodeExpiresSeconds(Math.ceil(OTP_TTL_MS / 1000));
      setEmailAttemptsRemaining(5);
    } catch {
      setEmailError("Could not send a verification code. Check your connection and try again.");
    }
  });

  const verifyEmailCode = () => startEmailTransition(async () => {
    setEmailError("");
    setEmailCodeInvalid(false);
    try {
      const result = await verifyAdminEmailChangeAction({ code: emailCode });
      if (!result.success) {
        setEmailError(result.error || "Email could not be verified.");
        setEmailCodeInvalid(true);
        if (result.attemptsRemaining !== undefined) setEmailAttemptsRemaining(result.attemptsRemaining);
        return;
      }
      setCurrentEmail(result.email ?? email);
      setEmail(result.email ?? email);
      setEmailVerified(true);
      setEmailMode("view");
      setEmailCode("");
      setEmailCodeInvalid(false);
      setEmailAttemptsRemaining(5);
      setEmailNotice(result.message || "Email updated and verified.");
    } catch {
      setEmailError("Email could not be verified. Check your connection and try again.");
    }
  });

  const cancelEmailChange = () => startEmailTransition(async () => {
    try {
      const result = await cancelAdminEmailChangeAction();
      if (!result.success) {
        setEmailError(result.error || "Could not cancel the email change.");
        return;
      }
      setEmailMode("view");
      setEmailCode("");
      setEmailCodeInvalid(false);
      setEmailError("");
      setEmailNotice("");
      setEmail(currentEmail);
      setEmailAttemptsRemaining(5);
    } catch {
      setEmailError("Could not cancel the email change. Check your connection and try again.");
    }
  });

  const beginEmailEdit = () => {
    setEmail(emailMode === "verify" ? email : currentEmail);
    setEmailError("");
    setEmailNotice("");
    setEmailMode("edit");
  };

  const cancelEmailEdit = () => {
    setEmail(currentEmail);
    setEmailError("");
    setEmailNotice("");
    setEmailMode("view");
  };

  return (
    <ManagementLayout className="max-w-5xl !space-y-4 sm:!space-y-6">
      <header className="border-b border-border/70 pb-4 sm:pb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Admin profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Your personal details and account security.</p>
      </header>

      <Card className="overflow-hidden border-border/70 shadow-xs">
        <CardContent className="p-4 sm:p-6">
        <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-muted-foreground sm:size-24">
          {preview ? <Image src={preview} alt={fullName} fill unoptimized className="object-cover" /> : <UserRound className="size-9" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-xl font-semibold tracking-tight text-foreground sm:truncate">{fullName}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Administrator</span><span aria-hidden="true">·</span><span>Account #{user.id}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>{user.isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="mt-4 flex flex-col items-stretch gap-2 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center">
            <Button type="button" variant="outline" size="sm" className="min-h-10 w-full min-[420px]:w-auto" disabled={profilePending || photoPending} onClick={() => photoInputRef.current?.click()}>
              <Camera className="mr-2 size-4" />Change photo
            </Button>
            {preview && <Button type="button" variant="ghost" size="sm" className="min-h-10 w-full text-destructive min-[420px]:w-auto" disabled={profilePending || photoPending} onClick={() => photo ? removePhoto() : setConfirmPhotoDelete(true)}>
              <Trash2 className="mr-2 size-4" />{photo ? "Discard photo" : "Delete photo"}
            </Button>}
            <span className="text-xs text-muted-foreground min-[420px]:basis-full">JPEG, PNG, or WebP · max 5 MB</span>
            <Input ref={photoInputRef} id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setCropSource(file); event.currentTarget.value = ""; }} />
          </div>
        </div>
        </section>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-6">
        <section aria-labelledby="personal-details-heading" className="min-w-0 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:p-6">
          <div className="border-b border-border/70 pb-4">
            <h2 id="personal-details-heading" className="text-lg font-semibold tracking-tight text-foreground">Personal details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Update the information used for shop communication.</p>
          </div>
          <form className="grid min-w-0 gap-x-4 gap-y-4 pt-5 sm:grid-cols-2 sm:gap-y-5" onSubmit={(event) => { event.preventDefault(); save(); }}>
            <Field label="First name" value={firstName} onChange={setFirstName} required maxLength={80} />
            <Field label="Last name" value={lastName} onChange={setLastName} required maxLength={80} />
            <div className="min-w-0 sm:col-span-2">
              <Label htmlFor="admin-phone">Phone number</Label>
              <Input id="admin-phone" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2" />
            </div>
            <div className="flex pt-1 sm:col-span-2">
              <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={profilePending}>{profilePending ? "Saving…" : "Update profile"}</Button>
            </div>
          </form>
        </section>

        <section aria-labelledby="account-security-heading" className="min-w-0 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:p-6">
          <div className="border-b border-border/70 pb-4">
            <h2 id="account-security-heading" className="text-lg font-semibold tracking-tight text-foreground">Account &amp; security</h2>
            <p className="mt-1 text-sm text-muted-foreground">Verify your new address before it becomes your sign-in email.</p>
          </div>
          <div className="space-y-5 pt-5">
            <div className="space-y-2">
              {emailMode === "view" ? (
                <>
                  <p className="text-sm font-medium text-muted-foreground">Current email</p>
                  <div className="flex min-w-0 flex-col items-start gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-3">
                    <p className="min-w-0 break-all text-sm font-medium text-foreground">{currentEmail || "No email on file"}</p>
                    <span className="text-xs text-muted-foreground">{emailVerified ? "Verified" : "Not verified"}</span>
                  </div>
                </>
              ) : emailMode === "edit" ? (
                <>
                  <Label htmlFor="admin-email">New email</Label>
                  <Input id="admin-email" type="email" autoComplete="email" value={email} maxLength={254} onChange={(event) => { setEmail(event.target.value); setEmailError(""); setEmailNotice(""); }} disabled={emailPending} />
                  <p className="text-xs leading-5 text-muted-foreground">Your current email stays active until you verify the new address.</p>
                  <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap [&>button]:min-h-10 [&>button]:w-full min-[420px]:[&>button]:w-auto">
                    <Button type="button" size="sm" onClick={requestEmailCode} disabled={emailPending || resendSeconds > 0 || !email.trim() || email.trim().toLowerCase() === currentEmail.toLowerCase()}>{emailPending ? "Sending code…" : resendSeconds > 0 ? `Try again in ${resendSeconds}s` : "Send verification code"}</Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEmailEdit} disabled={emailPending}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground">New email pending</p>
                  <p className="break-all text-sm font-medium text-foreground">{email}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    A code was sent to this address. Your current email remains active until verification.
                  </p>
                  {codeExpiresSeconds === 0 ? (
                    <p role="status" className="text-sm text-amber-700 dark:text-amber-300">This code has expired. Request a new code to continue.</p>
                  ) : emailAttemptsRemaining === 0 ? (
                    <p role="status" className="text-sm text-amber-700 dark:text-amber-300">No attempts remain. Request a new code to continue.</p>
                  ) : (
                    <>
                      <OtpCodeInput id="admin-email-code" value={emailCode} onChange={(value) => { setEmailCode(value); setEmailCodeInvalid(false); setEmailError(""); }} disabled={emailPending || codeExpiresSeconds === 0 || emailAttemptsRemaining === 0} invalid={emailCodeInvalid} autoFocus />
                      <p className="text-xs text-muted-foreground">{emailAttemptsRemaining} verification {emailAttemptsRemaining === 1 ? "attempt" : "attempts"} remaining · Code expires in {Math.floor(codeExpiresSeconds / 60)}:{String(codeExpiresSeconds % 60).padStart(2, "0")}</p>
                    </>
                  )}
                  <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap [&>button]:min-h-10 [&>button]:w-full min-[420px]:[&>button]:w-auto">
                    <Button type="button" size="sm" onClick={verifyEmailCode} disabled={emailPending || emailCode.length !== 6 || emailAttemptsRemaining === 0 || codeExpiresSeconds === 0}>{emailPending ? "Checking code…" : "Confirm new email"}</Button>
                    <Button type="button" size="sm" variant="outline" onClick={requestEmailCode} disabled={emailPending || resendSeconds > 0}>{emailPending ? "Sending code…" : resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Send a new code"}</Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEmailChange} disabled={emailPending}>Cancel change</Button>
                  </div>
                </>
              )}
              {emailMode === "view" && <Button type="button" size="sm" variant="outline" className="min-h-10 w-full min-[420px]:w-auto" onClick={beginEmailEdit} disabled={emailPending}>Change email</Button>}
              {emailError && <p role="alert" className="text-sm text-destructive">{emailError}</p>}
              {emailNotice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{emailNotice}</p>}
            </div>
            <AdminPasswordChange currentEmail={currentEmail} />
            <dl className="divide-y divide-border/70 border-y border-border/70">
              <DefinitionRow label="Role" value="Administrator" />
              <DefinitionRow label="Account status" value={user.isActive ? "Active" : "Inactive"} />
              <DefinitionRow label="Member since" value={joinedAt} />
            </dl>
          </div>
        </section>
      </div>
      {cropSource && <ProfilePhotoCropDialog file={cropSource} onCancel={() => setCropSource(null)} onApply={applyPhoto} />}
      <Dialog open={confirmPhotoDelete} onOpenChange={setConfirmPhotoDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete profile photo?</DialogTitle>
            <DialogDescription>This removes the photo from your account. You can add another one later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmPhotoDelete(false)} disabled={photoPending}>Keep photo</Button>
            <Button type="button" variant="destructive" onClick={removePhoto} disabled={photoPending}>{photoPending ? "Deleting…" : "Delete photo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagementLayout>
  );
}

function Field({ label, value, onChange, required, maxLength }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; maxLength: number }) {
  const id = `admin-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={maxLength} autoComplete={label === "First name" ? "given-name" : "family-name"} className="mt-2" />
    </div>
  );
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
