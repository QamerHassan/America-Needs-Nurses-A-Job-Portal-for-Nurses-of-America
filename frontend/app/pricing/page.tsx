"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { getActivePlans } from "@/app/utils/api";
import { loadStripe } from "@stripe/stripe-js";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

interface Plan {
  id: string;
  name: string;
  price: string | number;
  currency: string;
  billingCycle: string;
  jobsLimit: number;
  features: string[];
  isPopular: boolean;
  badge: string | null;
  headerStyle: string | null;
  buttonLabel: string | null;
  buttonStyle: string | null;
}

export default function Pricing() {
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    getActivePlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = async (planId: string) => {
    try {
      if (!auth?.userId) {
        alert("Please log in as an employer to subscribe.");
        window.location.href = "/employer/login";
        return;
      }
      // Redirect to the custom checkout page
      window.location.href = `/checkout?planId=${planId}`;
    } catch (err: any) {
      alert(err.message);
    }
  };

  const plans_UNUSED = [];

  const stats = [
    { num: "400K+", lbl: "Nurse Profiles" },
    { num: "12K+", lbl: "Active Jobs" },
    { num: "3K+", lbl: "Companies" },
    { num: "200+", lbl: "Cities" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bf0a2a]"></div>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          --navy: #001f5b;
          --navy-mid: #0a3580;
          --blue: #1347b5;
          --blue-light: #1e5fdc;
          --red: #bf0a2a;
          --red-mid: #d41030;
          --red-light: #e8173a;
          --white: #ffffff;
          --off-white: #f4f6fb;
          --text: #0d1b3e;
          --muted: #4a5880;
          --border: rgba(1,31,91,0.11);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pricing-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--off-white);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* HERO */
        .phero {
          background: linear-gradient(140deg, var(--navy) 0%, var(--navy-mid) 55%, var(--blue) 100%);
          padding: 80px 48px 140px;
          text-align: center;
          position: relative;
          overflow: hidden;
          clip-path: polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%);
        }
        .phero-dots {
          position: absolute; right: 4%; top: 12%;
          width: 200px; height: 150px;
          background-image: radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px);
          background-size: 18px 18px;
          opacity: .7;
        }
        .phero-dots2 {
          position: absolute; left: 3%; bottom: 20%;
          width: 120px; height: 100px;
          background-image: radial-gradient(circle, rgba(191,10,42,0.3) 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          opacity: .8;
        }
        .phero-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 60px;
          background: var(--off-white);
          clip-path: ellipse(55% 100% at 50% 100%);
        }
        .phero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 6vw, 62px);
          font-weight: 700;
          color: #fff;
          position: relative; z-index: 1;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .phero h1 em { color: #f0c040; font-style: normal; }
        .phero p {
          color: rgba(255,255,255,0.72);
          font-size: 17px;
          margin-top: 14px;
          position: relative; z-index: 1;
          max-width: 480px; margin-inline: auto;
          line-height: 1.65;
        }
        .phero-tag {
          display: inline-block;
          background: rgba(191,10,42,0.25);
          border: 1px solid rgba(191,10,42,0.45);
          color: #f0c040;
          font-size: 11px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          padding: 5px 16px; border-radius: 20px;
          margin-bottom: 22px; position: relative; z-index: 1;
        }

        /* CARDS */
        .cards-section {
          max-width: 1160px;
          margin: -60px auto 0;
          padding: 0 24px 80px;
          position: relative; z-index: 10;
        }
        .section-label {
          text-align: center;
          margin-bottom: 40px;
        }
        .section-label h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.02em;
        }
        .section-label h2 em { color: var(--red); font-style: normal; }
        .section-label p {
          color: var(--muted);
          font-size: 15.5px; margin-top: 8px; line-height: 1.6;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 26px;
          align-items: start;
        }

        .pcard {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1.5px solid var(--border);
          box-shadow: 0 8px 30px rgba(1,31,91,0.08);
          transition: transform .3s ease, box-shadow .3s ease;
          display: flex; flex-direction: column;
        }
        .pcard:hover {
          transform: translateY(-8px);
          box-shadow: 0 22px 50px rgba(1,31,91,0.15);
        }
        .pcard.featured {
          border-color: var(--red);
          transform: scale(1.03);
          box-shadow: 0 12px 40px rgba(191,10,42,0.2);
          position: relative;
        }
        .pcard.featured::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, var(--red), var(--blue), var(--red));
          background-size: 200% 200%;
          border-radius: 20px;
          z-index: -1;
          animation: glow 6s linear infinite;
          opacity: 0.4;
        }
        @keyframes glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pcard.featured:hover {
          transform: scale(1.03) translateY(-8px);
        }

        .pcard-header {
          padding: 38px 28px 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .pcard-header.h-basic {
          background: linear-gradient(145deg, #04111f 0%, #0d2a5e 100%);
        }
        .pcard-header.h-red {
          background: linear-gradient(145deg, var(--red) 0%, #8a0720 100%);
        }
        .pcard-header.h-navy {
          background: linear-gradient(145deg, var(--navy) 0%, #002050 100%);
        }
        .pcard-header::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 60%);
        }

        .pcard-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 10px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 20px;
          margin-bottom: 14px; position: relative; z-index: 1;
        }
        .pcard-badge.gold { background: #f0c040; color: #5a3800; }
        .pcard-badge.hot { background: rgba(240,192,64,0.25); color: #f0c040; border: 1px solid rgba(240,192,64,0.4); }

        .pcard-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 700;
          color: #fff; letter-spacing: .06em;
          text-transform: uppercase;
          position: relative; z-index: 1;
        }
        .pcard-price {
          margin-top: 16px;
          display: flex; align-items: flex-end;
          justify-content: center; gap: 2px;
          position: relative; z-index: 1;
        }
        .pcard-dollar { font-size: 20px; color: rgba(255,255,255,0.65); font-weight: 600; padding-bottom: 8px; }
        .pcard-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 70px; font-weight: 700;
          color: #fff; line-height: 1;
        }
        .pcard-period { font-size: 14px; color: rgba(255,255,255,0.6); padding-bottom: 10px; }

        .pcard-body { padding: 30px 28px 32px; flex: 1; display: flex; flex-direction: column; }

        .pcard-features {
          list-style: none; flex: 1;
          display: flex; flex-direction: column; gap: 0;
        }
        .pcard-features li {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(1,31,91,0.07);
          font-size: 14.5px; color: var(--text); font-weight: 500;
          line-height: 1.4;
        }
        .pcard-features li:last-child { border-bottom: none; }
        .pcard-features li.no { color: var(--muted); }

        .feat-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; flex-shrink: 0;
        }
        .feat-icon.yes-red { background: rgba(191,10,42,0.1); color: var(--red); }
        .feat-icon.yes-blue { background: rgba(19,71,181,0.1); color: var(--blue); }
        .feat-icon.yes-navy { background: rgba(0,31,91,0.1); color: var(--navy); }
        .feat-icon.no-icon { background: rgba(74,88,128,0.08); color: var(--muted); }

        .pcard-divider { height: 1px; background: var(--border); margin: 22px 0; }

        .pcard-btn {
          width: 100%; padding: 14px;
          border-radius: 10px;
          font-size: 14.5px; font-weight: 700;
          cursor: pointer; transition: all .25s;
          letter-spacing: .02em;
        }
        .pcard-btn.outline-blue {
          background: transparent;
          border: 2px solid var(--blue);
          color: var(--blue);
        }
        .pcard-btn.outline-blue:hover { background: var(--blue); color: #fff; }

        .pcard-btn.solid-red {
          background: var(--red); color: #fff; border: none;
          box-shadow: 0 6px 20px rgba(191,10,42,0.3);
        }
        .pcard-btn.solid-red:hover { background: var(--red-light); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(191,10,42,0.4); }

        .pcard-btn.solid-navy {
          background: var(--navy); color: #fff; border: none;
          box-shadow: 0 6px 20px rgba(0,31,91,0.25);
        }
        .pcard-btn.solid-navy:hover { background: var(--blue); transform: translateY(-2px); }

        /* CTA */
        .pcta {
          background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 45%, var(--red) 100%);
          padding: 80px 48px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .pcta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 25% 60%, rgba(191,10,42,0.35) 0%, transparent 55%),
                      radial-gradient(circle at 75% 30%, rgba(255,255,255,0.04) 0%, transparent 40%);
        }
        .pcta h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 700;
          color: #fff;
          position: relative; z-index: 1;
          letter-spacing: -0.01em; line-height: 1.2;
        }
        .pcta h2 em { color: #f0c040; font-style: normal; }
        .pcta p {
          color: rgba(255,255,255,0.72);
          font-size: 16px; line-height: 1.65;
          margin: 14px auto 36px;
          max-width: 500px;
          position: relative; z-index: 1;
        }
        .pcta-btns {
          display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
          position: relative; z-index: 1;
        }
        .pcta-btn-primary {
          background: var(--red); color: #fff; border: none;
          padding: 15px 38px; border-radius: 10px;
          font-size: 15.5px; font-weight: 700;
          cursor: pointer; transition: all .25s;
          box-shadow: 0 8px 24px rgba(191,10,42,0.45);
        }
        .pcta-btn-primary:hover { background: var(--red-light); transform: translateY(-2px); }
        .pcta-btn-ghost {
          background: transparent; color: #fff;
          border: 2px solid rgba(255,255,255,0.45);
          padding: 15px 38px; border-radius: 10px;
          font-size: 15.5px; font-weight: 600;
          cursor: pointer; transition: all .25s;
        }
        .pcta-btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

        /* NEWSLETTER */
        .pnewsletter {
          background: var(--blue);
          padding: 44px 48px;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 28px;
        }
        .pnl-form { display: flex; }
        .pnl-form input {
          padding: 13px 18px;
          border: none; border-radius: 9px 0 0 9px;
          font-size: 14px; width: 230px;
          outline: none;
          background: rgba(255,255,255,0.12);
          color: #fff; font-family: inherit;
        }
        .pnl-form input::placeholder { color: rgba(255,255,255,0.45); }
        .pnl-form button {
          background: var(--red); color: #fff; border: none;
          padding: 13px 22px; border-radius: 0 9px 9px 0;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: background .2s; font-family: inherit;
        }
        .pnl-form button:hover { background: var(--red-light); }
        .pnl-stats { display: flex; gap: 44px; flex-wrap: wrap; }
        .pnl-stat { text-align: center; }
        .pnl-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px; font-weight: 700; color: #fff;
          line-height: 1;
        }
        .pnl-stat-lbl {
          color: rgba(255,255,255,0.55);
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: .08em;
          margin-top: 3px;
        }

        /* FOOTER */
        .pfooter {
          background: #02091a;
          padding: 56px 48px 24px;
        }
        .pfooter-grid {
          display: grid;
          grid-template-columns: 240px repeat(3, 1fr) 190px;
          gap: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .pfooter-brand-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .pfooter-brand p {
          color: rgba(255,255,255,0.42);
          font-size: 13px; line-height: 1.7;
        }
        .pfooter-socials { display: flex; gap: 9px; margin-top: 18px; }
        .pfooter-social {
          width: 33px; height: 33px;
          background: rgba(255,255,255,0.07);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5);
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all .2s; text-decoration: none;
        }
        .pfooter-social:hover { background: var(--red); color: #fff; }
        .pfooter-col h4 {
          font-size: 11px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: rgba(255,255,255,0.35);
          margin-bottom: 16px;
        }
        .pfooter-col ul { list-style: none; }
        .pfooter-col ul li { margin-bottom: 9px; }
        .pfooter-col ul li a {
          color: rgba(255,255,255,0.58);
          text-decoration: none; font-size: 13.5px; transition: color .2s;
        }
        .pfooter-col ul li a:hover { color: #fff; }
        .pfooter-apps { display: flex; flex-direction: column; gap: 11px; }
        .pfooter-app {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px; padding: 9px 14px;
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; transition: all .2s; cursor: pointer;
        }
        .pfooter-app:hover { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.18); }
        .pfooter-app-text small { color: rgba(255,255,255,0.42); font-size: 10px; display: block; }
        .pfooter-app-text strong { color: #fff; font-size: 13px; }
        .pfooter-bottom {
          padding-top: 22px;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
        }
        .pfooter-bottom p { color: rgba(255,255,255,0.3); font-size: 13px; }
        .pfooter-bottom a { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 12px; }
        .pfooter-bottom a:hover { color: rgba(255,255,255,0.7); }

        /* SCROLL TOP */
        .scroll-top-btn {
          position: fixed; bottom: 30px; right: 30px;
          width: 48px; height: 48px;
          background: var(--red); color: #fff; border: none;
          border-radius: 11px; font-size: 18px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(191,10,42,0.5);
          transition: all .25s; z-index: 999;
          opacity: 0; pointer-events: none;
        }
        .scroll-top-btn.show { opacity: 1; pointer-events: all; }
        .scroll-top-btn:hover { background: var(--red-light); transform: translateY(-3px); }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .cards-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
          .pcard.featured { transform: none; }
          .pcard.featured:hover { transform: translateY(-8px); }
          .pfooter-grid { grid-template-columns: 1fr 1fr; }
          .pnewsletter { flex-direction: column; text-align: center; }
          .pnl-stats { justify-content: center; }
          .pnav { padding: 0 20px; }
          .pnav-links { display: none; }
          .phero { padding: 60px 24px 120px; }
          .pcta { padding: 60px 24px; }
        }
      `}</style>

      {/* HERO */}
      <header className="phero">
        <div className="phero-dots" />
        <div className="phero-dots2" />
        <div className="phero-tag">America's #1 Healthcare Recruitment Platform</div>
        <h1>Our <em>Simple</em>,<br />Transparent Pricing</h1>
        <p>Choose the best plan for your healthcare recruitment needs. No hidden fees, cancel anytime.</p>
        <div className="phero-arc" />
      </header>

      {/* CARDS */}
      <main className="cards-section">
        <div className="section-label">
          <h2>Choose Your <em>Package</em></h2>
          <p>Start free, scale as your team grows. Every plan includes a company directory listing.</p>
        </div>

        <div className="cards-grid">
          {plans.map((plan, i) => {
            // Map backend headerStyle to frontend classes
            const headerStyleClass = 
              plan.headerStyle === "red" ? "h-red" : 
              plan.headerStyle === "navy" ? "h-navy" : 
              "h-basic";
            
            // Icon color based on header or plan status
            const iconColorClass = 
              plan.headerStyle === "red" ? "yes-red" : 
              plan.headerStyle === "navy" ? "yes-navy" : 
              "yes-blue";
              
            // Map backend buttonStyle for frontend styles
            const btnStyleClass = 
              plan.buttonStyle === "solid" ? "solid-red" :
              plan.buttonStyle === "navy-solid" ? "solid-navy" :
              "outline-blue";

            const badgeClass = plan.badge === "Most Popular" ? "hot" : plan.badge === "Enterprise" ? "gold" : "";

            return (
              <div key={plan.id} className={`pcard${plan.isPopular ? " featured" : ""}`}>
                <div className={`pcard-header ${headerStyleClass}`}>
                  {plan.badge && <div className={`pcard-badge ${badgeClass}`}>{plan.badge}</div>}
                  <div className="pcard-name">{plan.name}</div>
                  <div className="pcard-price">
                    <span className="pcard-dollar">{plan.currency === 'USD' ? '$' : plan.currency}</span>
                    <span className="pcard-amount">{plan.price}</span>
                    <span className="pcard-period">/{plan.billingCycle || 'Mon'}</span>
                  </div>
                </div>
                <div className="pcard-body">
                  <ul className="pcard-features">
                    {plan.features.map((featureText, fi) => (
                      <li key={fi}>
                        <span className={`feat-icon ${iconColorClass}`}>
                          ✓
                        </span>
                        {featureText}
                      </li>
                    ))}
                    {/* Placeholder for missing features to maintain height if needed */}
                  </ul>
                  <div className="pcard-divider" />
                  <button 
                    className={`pcard-btn ${btnStyleClass}`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.buttonLabel || "Get Started"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* CTA */}
      <section className="pcta">
        <h2>Ready to Hire the<br /><em>Best Nurses</em> in America?</h2>
        <p>Join thousands of healthcare facilities finding their perfect matches on our platform today.</p>
        <div className="pcta-btns">
          <button className="pcta-btn-primary">Get Started Now</button>
          <button className="pcta-btn-ghost">Talk to Us</button>
        </div>
      </section>

      {/* NEWSLETTER */}
      <div className="pnewsletter">
        <div className="pnl-form">
          <input type="email" placeholder="Enter your email address" />
          <button>Subscribe</button>
        </div>
        <div className="pnl-stats">
          {stats.map(s => (
            <div key={s.lbl} className="pnl-stat">
              <div className="pnl-stat-num">{s.num}</div>
              <div className="pnl-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {/* SCROLL TO TOP */}
      <button
        className={`scroll-top-btn${showTop ? " show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}