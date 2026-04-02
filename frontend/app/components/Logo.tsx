"use client";

import React from "react";
import AppLogo from "./AppLogo";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  iconOnly?: boolean;
}

/**
 * @deprecated Use AppLogo instead for the unified enterprise branding system.
 * This component is maintained for backward compatibility and redirects to AppLogo.
 */
export default function Logo({ 
  theme = "dark", 
  className = "", 
  size = "md",
  iconOnly = false 
}: LogoProps) {
  const sizeMap = {
    xs: "24px",
    sm: "32px",
    md: "40px",
    lg: "64px",
  };

  return (
    <AppLogo 
      className={className} 
      height={sizeMap[size]} 
    />
  );
}
