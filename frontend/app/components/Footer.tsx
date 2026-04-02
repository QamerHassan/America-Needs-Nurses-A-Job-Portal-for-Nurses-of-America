"use client";

import React from "react";
import Link from "next/link";
import AppLogo from "./AppLogo";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface FooterLink {
  label: string;
  href: string;
}

interface FooterColProps {
  title: string;
  links: FooterLink[];
}

/* ─────────────────────────────────────────────
   Centered Dominant Globe
───────────────────────────────────────────── */
function USAGlobe() {
  const lonAngles = [0, 20, 40, 60, 80, 100, 120, 140, 160];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.55,
      }}
      aria-hidden="true"
    >
      <svg
        width="680"
        height="680"
        viewBox="0 0 680 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="gc">
            <circle cx="340" cy="340" r="290" />
          </clipPath>
          <radialGradient id="sphereGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#0c1e4a" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#020712" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="specGrad" cx="32%" cy="26%" r="42%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stopColor="transparent" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Atmosphere haze */}
        <circle cx="340" cy="340" r="318" fill="rgba(29,78,216,0.04)" />

        {/* Base sphere */}
        <circle cx="340" cy="340" r="300" fill="url(#sphereGrad)" />

        {/* Grid lines */}
        <g clipPath="url(#gc)">
          {/* Latitude lines */}
          <g opacity="0.28">
            {[
              { cy: 180, rx: 208, ry: 58 },
              { cy: 230, rx: 268, ry: 74 },
              { cy: 280, rx: 290, ry: 80, dash: "6 3", strong: true },
              { cy: 340, rx: 290, ry: 81, dash: "6 3", strong: true },
              { cy: 400, rx: 290, ry: 80 },
              { cy: 450, rx: 268, ry: 74 },
              { cy: 500, rx: 208, ry: 58 },
            ].map((l, i) => (
              <ellipse
                key={i}
                cx="340"
                cy={l.cy}
                rx={l.rx}
                ry={l.ry}
                fill="none"
                stroke={l.strong ? "#93c5fd" : "#60a5fa"}
                strokeWidth={l.strong ? 1 : 0.7}
                strokeDasharray={l.dash}
              />
            ))}
          </g>

          {/* Longitude lines — animated spin */}
          <g
            style={{
              animation: "globeSpin 38s linear infinite",
              transformOrigin: "340px 340px",
            }}
            opacity="0.22"
          >
            {lonAngles.map((angle) => (
              <ellipse
                key={angle}
                cx="340"
                cy="340"
                rx="40"
                ry="290"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.7"
                transform={`rotate(${angle} 340 340)`}
              />
            ))}
          </g>

          {/* USA continental silhouette */}
          <path
            d="M185 248 L179 243 L173 237 L170 230 L172 222 L179 216
               L188 212 L200 209 L214 207 L226 204 L238 202 L250 200
               L264 198 L278 197 L294 196 L310 195 L326 195 L342 194
               L358 194 L374 195 L388 196 L400 198 L410 200 L418 204
               L424 209 L428 215 L426 222 L430 229 L427 237 L420 243
               L416 251 L418 261 L421 272 L423 283 L420 293 L413 300
               L404 305 L393 309 L381 312 L369 315 L357 317 L344 318
               L331 319 L318 319 L305 318 L292 316 L279 313 L266 309
               L253 304 L241 298 L230 291 L220 283 L212 275 L204 267
               L197 260 L191 254 Z"
            fill="#1e3a8a"
            fillOpacity="0.72"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />
          {/* Glow halo on USA */}
          <path
            d="M185 248 L179 243 L173 237 L170 230 L172 222 L179 216
               L188 212 L200 209 L214 207 L226 204 L238 202 L250 200
               L264 198 L278 197 L294 196 L310 195 L326 195 L342 194
               L358 194 L374 195 L388 196 L400 198 L410 200 L418 204
               L424 209 L428 215 L426 222 L430 229 L427 237 L420 243
               L416 251 L418 261 L421 272 L423 283 L420 293 L413 300
               L404 305 L393 309 L381 312 L369 315 L357 317 L344 318
               L331 319 L318 319 L305 318 L292 316 L279 313 L266 309
               L253 304 L241 298 L230 291 L220 283 L212 275 L204 267
               L197 260 L191 254 Z"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="4"
            strokeOpacity="0.15"
          />

          {/* Florida */}
          <path
            d="M357 317 L362 333 L365 350 L364 368 L359 380 L352 384
               L345 380 L342 367 L341 350 L341 333 L341 319 Z"
            fill="#1e3a8a"
            fillOpacity="0.72"
            stroke="#60a5fa"
            strokeWidth="1.2"
          />

          {/* Alaska */}
          <path
            d="M186 334 L193 328 L205 325 L218 326 L228 331 L231 340
               L226 350 L213 353 L200 351 L191 344 Z"
            fill="#1e3a8a"
            fillOpacity="0.55"
            stroke="#60a5fa"
            strokeWidth="0.9"
          />

          {/* Hawaii */}
          <circle cx="254" cy="347" r="7" fill="#1e3a8a" fillOpacity="0.6" stroke="#60a5fa" strokeWidth="0.9" />
          <circle cx="268" cy="352" r="5.5" fill="#1e3a8a" fillOpacity="0.55" stroke="#60a5fa" strokeWidth="0.8" />
          <circle cx="280" cy="355" r="4" fill="#1e3a8a" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="0.7" />
        </g>

        {/* Specular + rim overlays */}
        <circle cx="340" cy="340" r="290" fill="url(#specGrad)" />
        <circle cx="340" cy="340" r="290" fill="url(#rimGrad)" />

        {/* Outer decorative rings */}
        <circle cx="340" cy="340" r="305" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="8 6" />
        <circle cx="340" cy="340" r="316" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.1" />

        {/* Washington D.C. pulse */}
        <circle cx="390" cy="250" r="6" fill="#ef4444" opacity="0.9">
          <animate attributeName="r" values="6;13;6" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="390" cy="250" r="5" fill="#fca5a5" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Glass Panel Column
───────────────────────────────────────────── */
function FooterCol({ title, links }: FooterColProps) {
  return (
    <div style={glassStyle}>
      <p
        style={{
          fontSize: "9.5px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
          margin: "0 0 18px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {links.map((l: FooterLink) => (
          <li key={l.label} style={{ marginBottom: "9px" }}>
            <Link href={l.href} className="ann-nav-link">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared glass panel style
───────────────────────────────────────────── */
const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "16px",
  padding: "28px 24px",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.35)",
};

/* ─────────────────────────────────────────────
   Main Footer
───────────────────────────────────────────── */
export default function Footer() {
  const stats = [
    { value: "50", accent: " States", label: "Nationwide" },
    { value: "12", accent: "K+", label: "Employers" },
    { value: "280", accent: "K+", label: "Nurses Placed" },
    { value: "", accent: "#1", label: "Job Board" },
  ];

  const socialLabels = ["X", "in", "fb", "ig"];

  const legalLinks = ["Privacy", "Terms", "Accessibility", "Sitemap"];

  return (
    <footer
      style={{
        position: "relative",
        background: "#020b18",
        color: "#fff",
        fontFamily: "'Sora', 'Segoe UI', sans-serif",
        overflow: "hidden",
        minHeight: "520px",
      }}
    >
      {/* Globe — centered, full background */}
      <USAGlobe />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "52px 44px 0",
        }}
      >
        {/* Main grid */}
        <div
          className="ann-footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {/* Brand panel */}
          <div style={glassStyle}>
            {/* Eyebrow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <AppLogo className="h-8 w-auto" />
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                margin: "0 0 14px",
              }}
            >
              The Nation's #1<br />Nursing Career Platform
            </h2>

            <p
              style={{
                fontSize: "12.5px",
                color: "rgba(148,163,184,0.7)",
                lineHeight: 1.85,
                margin: "0 0 22px",
              }}
            >
              Connecting 280,000+ dedicated nurses with America's top
              healthcare employers — coast to coast, all 50 states.
            </p>

            {/* Email subscribe */}
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  color: "#fff",
                  padding: "9px 13px",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                style={{
                  background: "linear-gradient(135deg,#b91c1c,#ef4444)",
                  border: "none",
                  borderRadius: "0 8px 8px 0",
                  color: "#fff",
                  padding: "9px 15px",
                  fontSize: "10px",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Join
              </button>
            </div>

            {/* Socials */}
            <div style={{ display: "flex", gap: "7px" }}>
              {socialLabels.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="ann-social-btn"
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <FooterCol
            title="For Nurses"
            links={[
              { label: "Browse Jobs", href: "/jobs" },
              { label: "Create Profile", href: "#" },
              { label: "Community", href: "#" },
              { label: "Newsletter", href: "#" },
              { label: "Resources", href: "#" },
            ]}
          />
          <FooterCol
            title="For Employers"
            links={[
              { label: "List Company", href: "#" },
              { label: "Post a Job", href: "#" },
              { label: "Pricing Plans", href: "/pricing" },
              { label: "Manage Listings", href: "#" },
              { label: "Analytics", href: "#" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About ANN", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Contact", href: "/contact" },
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
            ]}
          />
        </div>

        {/* Stats row */}
        <div
          className="ann-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "20px 16px 18px",
                textAlign: "center",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                overflow: "hidden",
              }}
            >
              {/* Top shine */}
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: "5px",
                }}
              >
                {s.value}
                <em style={{ color: "#ef4444", fontStyle: "normal" }}>
                  {s.accent}
                </em>
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "rgba(148,163,184,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 0 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11.5px",
              color: "rgba(148,163,184,0.35)",
            }}
          >
            <span style={{ fontSize: "14px" }}>🇺🇸</span>
            <span>© 2025 America Needs Nurses · All rights reserved</span>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            {legalLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="ann-legal-link"
                style={{
                  fontSize: "11.5px",
                  color: "rgba(148,163,184,0.3)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {item}
              </a>
            ))}
          </div>

          <p
            style={{
              fontSize: "11.5px",
              color: "rgba(148,163,184,0.3)",
              margin: 0,
            }}
          >
            Made with ❤️ for Healthcare Workers
          </p>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');

        @keyframes globeSpin {
          to { transform: rotate(360deg); }
        }

        .ann-nav-link {
          color: rgba(148, 163, 184, 0.55);
          text-decoration: none;
          font-size: 12.5px;
          transition: color 0.15s, padding-left 0.15s;
          display: inline-block;
        }
        .ann-nav-link:hover {
          color: #fff;
          padding-left: 5px;
        }
        .ann-social-btn:hover {
          background: rgba(239, 68, 68, 0.18) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #fff !important;
        }
        .ann-legal-link:hover {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        @media (max-width: 960px) {
          .ann-footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .ann-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .ann-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}