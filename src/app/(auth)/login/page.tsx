import type { Metadata } from "next";
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
    <div className="space-y-8">
        <AuthHeader
          title="Welcome back"
          description="Sign in to continue to your HrungMoto account"
        />
        <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
