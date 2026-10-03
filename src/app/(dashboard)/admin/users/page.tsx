import React from "react";
import { findAllUsers } from "@/features/users/services/user.service";
import { UsersPageClient } from "@/features/users/components/UsersPageClient";
import { expireStaleEnrollments, findEnrollmentSummaries } from "@/features/auth/services/enrollment.service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await expireStaleEnrollments();
  const [users, enrollments] = await Promise.all([findAllUsers(), findEnrollmentSummaries()]);

  return (
    <UsersPageClient
      key={enrollments.map((enrollment) => `${enrollment.id}:${enrollment.status}:${enrollment.updatedAt.getTime()}`).join("|")}
      initialUsers={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      initialEnrollments={enrollments.map((enrollment) => ({
        ...enrollment,
        expiresAt: enrollment.expiresAt.toISOString(),
        otpExpiresAt: enrollment.otpExpiresAt?.toISOString() ?? null,
        createdAt: enrollment.createdAt.toISOString(),
      }))}
    />
  );
}
