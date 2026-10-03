import { Suspense } from "react";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { PasswordSetupForm } from "@/features/auth/components/PasswordSetupForm";

export const metadata: Metadata = {
  title: "Set Password - HrungMoto",
  description: "Set your HrungMoto account password",
};

export default function SetPasswordPage() {
  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <AuthHeader title="Set your password" description="Create a password to finish setting up your account" />
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="py-6 text-center text-sm text-muted-foreground">Loading password setup…</p>}>
          <PasswordSetupForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
