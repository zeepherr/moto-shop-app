import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register - HrungMoto",
  description: "Create a new HrungMoto account",
};

export default function RegisterPage() {
  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <AuthHeader
          title="Create an account"
          description="Register for a new member account"
        />
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
