import React from "react";

interface AuthHeaderProps {
  title: string;
  description: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col space-y-3">
      <h1 className="text-3xl font-semibold leading-tight tracking-[-0.025em] text-foreground">{title}</h1>
      <p className="max-w-[42ch] text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
};
