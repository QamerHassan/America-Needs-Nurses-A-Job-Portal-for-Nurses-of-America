"use client";

import React, { useState } from "react";
import { Building2 } from "lucide-react";

interface CompanyLogoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackIconSize?: number;
}

export default function CompanyLogo({ src, alt = "Company Logo", className = "", fallbackIconSize = 24 }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Function to ensure valid URL
  const getValidUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `${API_URL}${path}`;
    return `${API_URL}/${path}`;
  };

  const validSrc = getValidUrl(src);

  if (!validSrc || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-100 ${className}`}>
        <Building2 size={fallbackIconSize} className="text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={validSrc}
      alt={alt}
      className={`object-contain ${className}`}
      onError={() => {
        setHasError(true);
        console.log("COMPANY LOGO ERROR: Setting fallback state.", src);
      }}
    />
  );
}
