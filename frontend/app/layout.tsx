import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./app.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Navbar from "./components/Navbar";
import GoogleAuthProviderWrapper from "./components/GoogleAuthProvider";
import GoogleOneTap from "./components/GoogleOneTap";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "America Needs Nurses | ANN - Find Your Next Nursing Job",
  description: "America Needs Nurses (ANN) is the premier nursing job board connecting top healthcare employers with qualified nursing professionals across the USA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <GoogleAuthProviderWrapper>
            <TooltipProvider>
              <Navbar />
              <GoogleOneTap />
              <main className="flex-1">
                {children}
              </main>
            </TooltipProvider>
          </GoogleAuthProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
