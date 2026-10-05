import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Login - HrungMoto",
  description: "Sign in to your HrungMoto account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectTo = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <AuthHeader
          title="Welcome back"
          description="Sign in to continue to your HrungMoto account"
        />
      </CardHeader>
      <CardContent>
        <LoginForm redirectTo={redirectTo} />
      </CardContent>
    </Card>
  );
}
