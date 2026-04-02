"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  if (!clientId) {
    console.warn("Google Client ID is missing in environment variables.");
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider 
      clientId={clientId}
      // @ts-ignore - use_fedcm_for_prompt is a valid GSI property but may be missing in current types
      use_fedcm_for_prompt={false}
    >
      {children}
    </GoogleOAuthProvider>
  );
}
