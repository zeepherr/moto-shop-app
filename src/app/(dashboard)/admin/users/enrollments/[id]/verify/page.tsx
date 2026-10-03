import { redirect } from "next/navigation";
import { EnrollmentMethod, EnrollmentStatus } from "@prisma/client";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { findEnrollmentById } from "@/features/auth/services/enrollment.service";
import { AssistedEnrollmentOtpForm } from "@/features/users/components/AssistedEnrollmentOtpForm";

export default async function VerifyEnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enrollmentId = Number(id);
  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) redirect("/admin/users");

  const enrollment = await findEnrollmentById(enrollmentId);
  if (
    !enrollment ||
    enrollment.method !== EnrollmentMethod.ASSISTED ||
    enrollment.status !== EnrollmentStatus.AWAITING_OTP
  ) {
    redirect("/admin/users");
  }

  return (
    <ManagementLayout>
      <PageHeader title="Confirm customer email" description="Verify the code the customer received before sending their password setup and sign-in links." />
      <Card className="mx-auto w-full max-w-xl border-border/80 shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <AssistedEnrollmentOtpForm enrollmentId={enrollment.id} email={enrollment.email} />
        </CardContent>
      </Card>
    </ManagementLayout>
  );
}
