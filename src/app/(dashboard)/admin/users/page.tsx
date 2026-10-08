import React from "react";
import { countUsers, findAllUsers, getUserRoleCounts } from "@/features/users/services/user.service";
import { UsersPageClient } from "@/features/users/components/UsersPageClient";
import { expireStaleEnrollments, findEnrollmentSummaries } from "@/features/auth/services/enrollment.service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await expireStaleEnrollments();
  const [users, totalUsers, roleCounts, activeUsers, inactiveUsers, enrollments] = await Promise.all([
    findAllUsers({ take: 50 }), countUsers(), getUserRoleCounts(),
    countUsers({ isActive: true }), countUsers({ isActive: false }), findEnrollmentSummaries(),
  ]);

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
      initialTotalUsers={totalUsers}
      initialRoleCounts={roleCounts}
      initialAccessCounts={{ all: totalUsers, active: activeUsers, inactive: inactiveUsers }}
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
