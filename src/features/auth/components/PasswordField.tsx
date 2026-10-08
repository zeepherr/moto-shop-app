"use client";

import { useState, type ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  minLength?: number;
  maxLength?: number;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  name,
  placeholder,
  required = true,
  disabled = false,
  hint,
  minLength,
  maxLength = 128,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const requiredLength = minLength ?? (label.toLowerCase().includes("current") ? 4 : 10);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          minLength={requiredLength}
          maxLength={maxLength}
          className="pr-12 text-base"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:opacity-50"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {hint || requiredLength >= 10 ? <p className="text-sm leading-relaxed text-muted-foreground">{hint || "Use at least 10 characters, including a letter and a number."}</p> : null}
    </div>
  );
}
