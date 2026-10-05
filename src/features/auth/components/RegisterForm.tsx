"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "../actions/register.action";

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

      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Use the email approved by the shop"
          value={formData.email}
          onChange={handleChange}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="At least 4 characters"
          value={formData.password}
          onChange={handleChange}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          placeholder="Repeat password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full h-11" disabled={isPending}>
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
