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
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
        emailVerifiedAt: u.emailVerifiedAt?.toISOString() ?? null,
        hasProfilePhoto: Boolean(u.userInfo?.photoUrl),
        lastSignedInAt: u.authSessions[0]?.createdAt.toISOString() ?? null,
      }))}
      initialEnrollments={enrollments.map((enrollment) => ({
        ...enrollment,
        expiresAt: enrollment.expiresAt.toISOString(),
        otpExpiresAt: enrollment.otpExpiresAt?.toISOString() ?? null,
        createdAt: enrollment.createdAt.toISOString(),
        lastEvent: enrollment.auditEvents[0]
          ? { action: enrollment.auditEvents[0].action, createdAt: enrollment.auditEvents[0].createdAt.toISOString() }
          : null,
      }))}
    />
  );
}
