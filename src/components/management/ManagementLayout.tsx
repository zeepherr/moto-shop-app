import React from "react";

interface ManagementLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`mx-auto w-full max-w-7xl space-y-6 pb-12 ${className}`}>
      {children}
    </div>
  );
};
