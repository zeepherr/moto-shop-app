import React from "react";
import { findAllUsers } from "@/features/users/services/user.service";
import { UsersPageClient } from "@/features/users/components/UsersPageClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await findAllUsers();

  return (
    <UsersPageClient
      initialUsers={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
