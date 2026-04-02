"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, Flag, Heart, Users, Target, Shield } from "lucide-react";
import Footer from "../components/Footer";

export default function AboutPage() {
    const countersRef = useRef<HTMLDivElement[]>([]);

    /* ───────────── ANIMATED COUNTER ───────────── */
    useEffect(() => {
        const animateCounter = (el: HTMLElement, target: number) => {
            let start = 0;
            const duration = 2000;
            const increment = target / (duration / 16);

            const update = () => {
                start += increment;
                if (start < target) {
                    el.innerText = Math.floor(start).toLocaleString() + "+";
                    requestAnimationFrame(update);
                } else {
                    el.innerText = target.toLocaleString() + "+";
                }
            };
            update();
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        const el = e.target as HTMLElement;
                        const target = Number(el.dataset.target);
                        animateCounter(el, target);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.6 }
        );

        countersRef.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div style={{ backgroundColor: "#fafbfc", minHeight: "100vh" }}>
            {/* ───────── HERO SECTION ───────── */}
            <section
                className="about-hero"
                style={{
                    background:
                        "linear-gradient(to right, rgba(0, 40, 104, 0.92), rgba(200, 16, 46, 0.85)), url('https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
                    padding: "140px 5%",
                    color: "#fff",
                    textAlign: "center"
                }}
            >
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div className="hero-badge" style={{ background: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: "20px", display: "inline-block", fontSize: "14px", fontWeight: "600", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
                        About America Needs Nurses
                    </div>
                    <h1 style={{ fontSize: "3.5rem", fontWeight: "800", marginBottom: "24px", lineHeight: "1.2", fontFamily: "'Playfair Display', serif" }}>
                        Empowering Healthcare.<br />
                        <span style={{ color: "#ffccd5" }}>Elevating Nursing.</span>
                    </h1>
                    <p style={{ fontSize: "1.1rem", lineHeight: "1.8", opacity: "0.9" }}>
                        We are the nation's premier healthcare recruitment platform. We exist to bridge the gap between world-class medical facilities and the dedicated nursing professionals who keep America healthy, ensuring every hospital is staffed and every nurse is empowered.
                    </p>
                </div>
            </section>

            {/* ───────── OUR STORY & MEETING IMAGE ───────── */}
            <section style={{ padding: "100px 5%", maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
                    {/* Left Typography Area */}
                    <div>
                        <div style={{ color: "#C8102E", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", fontSize: "14px" }}>
                            Our Story & Mission
                        </div>
                        <h2 style={{ fontSize: "2.8rem", color: "#002868", marginBottom: "24px", fontFamily: "'Playfair Display', serif", fontWeight: "700", lineHeight: "1.2" }}>
                            Built by professionals, for professionals.
                        </h2>
                        <p style={{ color: "#4a5568", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                            America Needs Nurses (ANN) was founded on a simple but critical observation: the healthcare staffing crisis requires a modern, seamless, and deeply human solution. We noticed that excellent nurses were struggling to find the right facilities, and world-class hospitals were facing critical bed shortages due to understaffing.
                        </p>
                        <p style={{ color: "#4a5568", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "32px" }}>
                            Today, our platform acts as the central hub for healthcare employment in the United States. We provide a fully integrated job board, community network, and direct messaging platform that cuts through the red tape of traditional hiring.
                        </p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <CheckCircle color="#C8102E" size={24} />
                                <span style={{ fontSize: "1.1rem", color: "#2d3748", fontWeight: "600" }}>Nationwide network of top hospitals</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <CheckCircle color="#C8102E" size={24} />
                                <span style={{ fontSize: "1.1rem", color: "#2d3748", fontWeight: "600" }}>Direct communication with hiring managers</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <CheckCircle color="#C8102E" size={24} />
                                <span style={{ fontSize: "1.1rem", color: "#2d3748", fontWeight: "600" }}>Comprehensive career growth tools</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Image Area */}
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", bottom: "20px", left: "20px", backgroundColor: "#002868", borderRadius: "16px", zIndex: 0 }}></div>
                        <img 
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop" 
                            alt="Nurses in a meeting" 
                            style={{ width: "100%", height: "auto", borderRadius: "16px", position: "relative", zIndex: 1, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} 
                        />
                        
                        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", backgroundColor: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 2, display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "60px", height: "60px", backgroundColor: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8102E" }}>
                                <Heart size={32} />
                            </div>
                            <div>
                                <h4 style={{ margin: "0", color: "#002868", fontSize: "1.2rem", fontWeight: "700" }}>Compassion First</h4>
                                <span style={{ color: "#718096", fontSize: "0.9rem" }}>In everything we do.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────── OUR SERVICES / NETWORK DATA ───────── */}
            <section style={{ padding: "100px 5%", backgroundColor: "#fff" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
                    <div style={{ color: "#C8102E", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", fontSize: "14px" }}>
                        Our Reach
                    </div>
                    <h2 style={{ fontSize: "2.8rem", color: "#002868", fontFamily: "'Playfair Display', serif", fontWeight: "700", marginBottom: "16px" }}>
                        A Nationwide Healthcare Network
                    </h2>
                    <p style={{ maxWidth: "700px", margin: "0 auto", color: "#718096", fontSize: "1.1rem" }}>
                        America Needs Nurses provides dynamic staffing solutions that address the unique clinical requirements of every facility and empower nurses to build careers on their own terms.
                    </p>
                </div>

                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
                    {[
                        { title: "Travel Nursing", desc: "Connecting adventurous professionals with high-paying, 13-week contracts at prestigious facilities in all 50 states. We handle credentialing, housing stipends, and rapid deployment.", icon: "✈️" },
                        { title: "Permanent Placement", desc: "For nurses seeking stability and career growth. We match experienced RNs, LPNs, and advanced practice providers directly with hospital core staff openings.", icon: "🏥" },
                        { title: "Per Diem Contracts", desc: "Flexible, local shift-work that allows healthcare professionals to take control of their schedules while helping local clinics and hospitals manage census fluctuations.", icon: "📅" },
                        { title: "Crisis Response Staffing", desc: "Rapid deployment teams of highly skilled critical care and emergency room nurses prepared to mobilize within 48 hours to areas experiencing severe staffing shortages.", icon: "🚨" },
                        { title: "Allied Health Placement", desc: "Expanding our network beyond nursing to cover critical allied health roles including Respiratory Therapists, Surgical Techs, and specialized clinical staff.", icon: "⚕️" },
                        { title: "Facility Partnership", desc: "Providing Chief Nursing Officers and hospital administrators with AI-driven applicant tracking, dedicated account managers, and predictable staffing pipelines.", icon: "🤝" }
                    ].map((svc, i) => (
                        <div key={i} style={{ backgroundColor: "#f8fafc", padding: "30px", borderRadius: "16px", border: "1px solid #edf2f7", transition: "transform 0.3s" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{svc.icon}</div>
                            <h3 style={{ fontSize: "1.3rem", color: "#002868", marginBottom: "12px", fontWeight: "700" }}>{svc.title}</h3>
                            <p style={{ color: "#718096", lineHeight: "1.6", fontSize: "0.95rem" }}>{svc.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────── WHY PARTNER WITH US ───────── */}
            <section style={{ padding: "100px 5%", backgroundColor: "#f8fafc" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
                    <div>
                        <img 
                            src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1200&auto=format&fit=crop" 
                            alt="Hospital technology and collaboration" 
                            style={{ width: "100%", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }} 
                        />
                    </div>
                    <div>
                        <div style={{ color: "#C8102E", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", fontSize: "14px" }}>
                            The ANN Advantage
                        </div>
                        <h2 style={{ fontSize: "2.8rem", color: "#002868", fontFamily: "'Playfair Display', serif", fontWeight: "700", marginBottom: "24px", lineHeight: "1.2" }}>
                            Beyond a Job Board. A Career Ecosystem.
                        </h2>
                        <p style={{ color: "#4a5568", fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "32px" }}>
                            We go beyond static listings and basic resume drops. Our platform acts as an intelligent ecosystem that continuously monitors market demands, providing both nurses and employers with unprecedented analytics, personalized matching algorithms, and direct outreach mechanisms.
                        </p>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div>
                                <h4 style={{ color: "#002868", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>Faster Hiring Times</h4>
                                <p style={{ color: "#718096", fontSize: "0.95rem", lineHeight: "1.6" }}>Our AI-driven pre-screening drastically reduces time-to-hire from weeks to days.</p>
                            </div>
                            <div>
                                <h4 style={{ color: "#002868", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>Verified Credentials</h4>
                                <p style={{ color: "#718096", fontSize: "0.95rem", lineHeight: "1.6" }}>Automated license verification ensures absolute compliance from day one.</p>
                            </div>
                            <div>
                                <h4 style={{ color: "#002868", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>Exclusive Contracts</h4>
                                <p style={{ color: "#718096", fontSize: "0.95rem", lineHeight: "1.6" }}>Access to high-paying travel packages and elite core staff openings unavailable elsewhere.</p>
                            </div>
                            <div>
                                <h4 style={{ color: "#002868", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>Dedicated Support</h4>
                                <p style={{ color: "#718096", fontSize: "0.95rem", lineHeight: "1.6" }}>24/7 technical and career support from our U.S.-based nursing advocate team.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────── CORE VALUES ───────── */}
            <section style={{ backgroundColor: "#002868", padding: "100px 5%", color: "#fff" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "2.5rem", fontFamily: "'Playfair Display', serif", fontWeight: "700", marginBottom: "16px" }}>Our Core Values</h2>
                    <p style={{ maxWidth: "600px", margin: "0 auto", color: "#cbd5e1", fontSize: "1.1rem" }}>
                        The principles that drive our platform, our team, and our commitment to the American healthcare system.
                    </p>
                </div>
                
                <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
                    {[
                        { icon: <Target size={32} />, title: "Precision", desc: "We use advanced data mapping to perfectly match nursing skills with specific hospital requirements, reducing turnover." },
                        { icon: <Shield size={32} />, title: "Integrity", desc: "We maintain the highest standards of transparency. No hidden fees, no ghosting—just honest professional connections." },
                        { icon: <Users size={32} />, title: "Community", desc: "We believe nurses thrive when they are supported by their peers. We foster an environment of continuous learning." },
                    ].map((value, idx) => (
                        <div key={idx} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", transition: "transform 0.3s" }} className="value-card">
                            <div style={{ width: "80px", height: "80px", margin: "0 auto 24px", backgroundColor: "rgba(200, 16, 46, 0.2)", color: "#ffccd5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {value.icon}
                            </div>
                            <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", fontWeight: "600" }}>{value.title}</h3>
                            <p style={{ color: "#cbd5e1", lineHeight: "1.7" }}>{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────── ANIMATED COUNTERS ───────── */}
            <section style={{ padding: "80px 5%", backgroundColor: "#fff", borderBottom: "1px solid #edf2f7" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "40px" }}>
                    {[
                        { value: 400000, label: "Registered Nurses" },
                        { value: 12000, label: "Active Opportunities" },
                        { value: 3000, label: "Partner Facilities" },
                        { value: 50, label: "States Covered" },
                    ].map((stat, i) => (
                        <div key={stat.label} style={{ textAlign: "center" }}>
                            <div
                                style={{ fontSize: "3.5rem", fontWeight: "800", color: "#C8102E", fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}
                                ref={(el) => {
                                    if (el) countersRef.current[i] = el;
                                }}
                                data-target={stat.value}
                            >
                                0
                            </div>
                            <div style={{ fontSize: "1.1rem", color: "#4a5568", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────── CALL TO ACTION ───────── */}
            <section style={{ padding: "100px 5%", textAlign: "center", backgroundColor: "#fafbfc" }}>
                <h2 style={{ fontSize: "2.5rem", color: "#002868", fontFamily: "'Playfair Display', serif", fontWeight: "700", marginBottom: "24px" }}>
                    Ready to take the next step?
                </h2>
                <p style={{ color: "#4a5568", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto 40px" }}>
                    Join thousands of professionals who are advancing their careers and transforming healthcare delivery across the nation.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                    <Link href="/register" style={{ backgroundColor: "#C8102E", color: "#fff", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem", boxShadow: "0 4px 14px rgba(200,16,46,0.3)" }}>
                        Create Free Profile
                    </Link>
                    <Link href="/#companies" style={{ backgroundColor: "#fff", color: "#002868", padding: "16px 32px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem", border: "2px solid #002868" }}>
                        Explore Hospitals
                    </Link>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                .value-card:hover {
                    transform: translateY(-8px);
                }
                .footer-link:hover {
                    color: #fff !important;
                }
                @media (max-width: 950px) {
                    section > div {
                        grid-template-columns: 1fr !important;
                    }
                    footer > div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}