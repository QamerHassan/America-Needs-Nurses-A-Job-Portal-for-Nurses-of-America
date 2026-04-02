"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

interface AppLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  linkHref?: string;
  showText?: boolean;
}

/**
 * AppLogo - The single source of truth for the America Needs Nurses application logo.
 * Features:
 * - Enterprise-grade fallback handling (no broken images)
 * - Clickable (defaults to landing page)
 * - Centralized branding control
 */
export default function AppLogo({ 
  className = "h-10 w-auto", 
  width, 
  height,
  linkHref = "/",
  showText = false
}: AppLogoProps) {
  const [hasError, setHasError] = useState(false);

  // Use raw image with error handling
  const logoImage = (
    <img
      src="/logo.png"
      alt="America Needs Nurses"
      className={`${className} object-contain`}
      style={{ 
        width: width || "auto", 
        height: height || "auto",
        display: hasError ? 'none' : 'block'
      }}
      onError={() => setHasError(true)}
    />
  );

  // Fallback UI if the image fails to load
  const fallbackUI = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-[#002868] text-white rounded-lg flex items-center justify-center shadow-md">
        <Building2 size={16} />
      </div>
      <span className="font-black text-[#002868] tracking-tighter text-sm">
        ANN<span className="text-[#C8102E]">.</span>
      </span>
    </div>
  );

  return (
    <Link href={linkHref} className="inline-flex items-center no-underline hover:opacity-90 transition-opacity">
      {!hasError ? logoImage : fallbackUI}
      {showText && !hasError && (
          <span className="ml-2 font-black text-[#002868] tracking-tight hidden md:block">
            AMERICA NEEDS NURSES
          </span>
      )}
    </Link>
  );
}
