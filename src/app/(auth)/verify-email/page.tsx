import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email - HrungMoto",
  description: "Verify your email to complete registration",
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-8">
        <AuthHeader
          title="Verify your email"
          description="Enter the 6-digit verification code sent to your inbox"
        />
        <Suspense fallback={<div className="py-6 text-sm text-muted-foreground">Loading verification form…</div>}>
          <VerifyEmailForm />
        </Suspense>
    </div>
  );
}
