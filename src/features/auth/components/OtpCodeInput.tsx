"use client";

import { useRef } from "react";

interface OtpCodeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  verified?: boolean;
  autoFocus?: boolean;
}

export function OtpCodeInput({ id, value, onChange, disabled, invalid, verified, autoFocus }: OtpCodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  return (
    <div
      className={`otp-code ${invalid ? "otp-code-invalid" : ""} ${verified ? "otp-code-verified" : ""} ${disabled ? "otp-code-disabled" : ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={6}
        pattern="[0-9]{6}"
        aria-label="6-digit verification code"
        aria-invalid={invalid || undefined}
        required
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
        onPaste={(event) => {
          event.preventDefault();
          onChange(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
        }}
        className="otp-code-native"
      />
      <div className="otp-code-slots" aria-hidden="true">
        {digits.map((digit, index) => (
          <span className={`otp-code-slot ${digit.trim() ? "is-filled" : ""} ${index === value.length && value.length < 6 ? "is-current" : ""}`} key={index}>
            {digit.trim() || <i />}
          </span>
        ))}
      </div>
    </div>
  );
}
