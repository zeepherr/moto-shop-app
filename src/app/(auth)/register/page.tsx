import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Complete Registration - HrungMoto",
  description: "Complete your shop-approved HrungMoto registration",
};

export default function RegisterPage() {
  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <AuthHeader
          title="Complete your registration"
          description="Use the email address approved by the shop team"
        />
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
