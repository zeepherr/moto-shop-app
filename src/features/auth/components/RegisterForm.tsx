"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "../actions/register.action";
import { PasswordField } from "./PasswordField";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const res = await registerAction(formData);
      if (!res.success) {
        if (res.code === "OTP_DELIVERY_FAILED") {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&delivery=retry`);
          return;
        }
        setError(res.error || "Failed to register");
        return;
      }

      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&sent=1`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          className="text-base"
          required
          placeholder="Use the email approved by the shop"
          value={formData.email}
          onChange={handleChange}
          disabled={isPending}
        />
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        placeholder="10+ characters, with a letter and number"
        hint="Use at least 10 characters, including a letter and a number."
        disabled={isPending}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        value={formData.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        placeholder="Repeat password"
        disabled={isPending}
      />

      <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
        {isPending ? "Sending verification code..." : "Continue"}
      </Button>

      <div className="text-center text-sm text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
};
