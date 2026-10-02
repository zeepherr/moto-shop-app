"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { Button } from "@/components/ui/button";

export const LogoutButton: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className={className || "text-muted-foreground hover:text-destructive gap-2"}
    >
      <LogOut className="h-4 w-4" />
      <span>{isPending ? "Logging out..." : "Log out"}</span>
    </Button>
  );
};
