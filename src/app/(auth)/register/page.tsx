import type { Metadata } from "next";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Complete Registration - HrungMoto",
  description: "Complete your shop-approved HrungMoto registration",
};

export default function RegisterPage() {
  return (
    <div className="space-y-8">
        <AuthHeader
          title="Complete your registration"
          description="Use the email address approved by the shop team"
        />
        <RegisterForm />
    </div>
  );
}
