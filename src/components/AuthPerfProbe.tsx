"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AuthPerfProbe() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const startedAt = window.sessionStorage.getItem("moto-care-login-navigation-start");
    if (!startedAt) return;
    window.sessionStorage.removeItem("moto-care-login-navigation-start");
    console.info(`[auth-perf] route_transition_ms: ${(performance.now() - Number(startedAt)).toFixed(1)}ms (${pathname})`);
  }, [pathname]);

  return null;
}
