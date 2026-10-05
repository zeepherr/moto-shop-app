import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { PasswordSetupForm } from "@/features/auth/components/PasswordSetupForm";

export const metadata: Metadata = {
  title: "Set Password - HrungMoto",
  description: "Set your HrungMoto account password",
};

export default function SetPasswordPage() {
  return (
    <div className="space-y-8">
        <AuthHeader title="Set your password" description="Create a password to finish setting up your account" />
        <Suspense fallback={<p className="py-6 text-sm text-muted-foreground">Loading password setup…</p>}>
          <PasswordSetupForm />
        </Suspense>
    </div>
  );
}
