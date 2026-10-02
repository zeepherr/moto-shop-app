"use client";

import type { CSSProperties, ComponentProps } from "react";
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/components/theme/ThemeProvider";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster({
  className = "",
  toastOptions = {},
  style,
  icons,
  ...props
}: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === "system" ? "system" : theme === "light" ? "light" : "dark"}
      position="top-right"
      duration={4000}
      visibleToasts={3}
      gap={10}
      closeButton={false}
      offset={24}
      mobileOffset={16}
      {...props}
      className={`motocare-toaster ${className}`}
      icons={{
        success: <CircleCheck size={19} />,
        info: <Info size={19} />,
        warning: <TriangleAlert size={19} />,
        error: <OctagonX size={19} />,
        loading: <LoaderCircle size={19} className="animate-spin" />,
        ...icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-2xl)",
          ...style,
        } as CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions.classNames,
          toast: ["motocare-toast", toastOptions.classNames?.toast]
            .filter(Boolean)
            .join(" "),
        },
      }}
    />
  );
}
