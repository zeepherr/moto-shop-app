import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email - HrungMoto",
  description: "Verify your email to complete registration",
};

export default function VerifyEmailPage() {
  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <AuthHeader
          title="Verify your email"
          description="Enter the 6-digit verification code sent to your inbox"
        />
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="text-center py-6 text-sm text-muted-foreground">Loading verification form...</div>}>
          <VerifyEmailForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
