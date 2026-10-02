import React from "react";

interface AuthHeaderProps {
  title: string;
  description: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col space-y-2 text-center pb-2">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md font-bold text-xl">
        H
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
