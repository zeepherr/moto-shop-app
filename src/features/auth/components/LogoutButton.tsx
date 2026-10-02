"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction } from "../actions/logout.action";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const LogoutButton: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoggingOut}
      onClick={handleLogout}
      className={className || "cursor-pointer gap-2"}
    >
      <LogOut className="size-4" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
};
