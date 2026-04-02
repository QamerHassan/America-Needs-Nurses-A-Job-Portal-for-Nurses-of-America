"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Footer from "../components/Footer";
import { submitContact } from "../utils/api";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        
        try {
            await submitContact(formData);
            setStatus({ type: 'success', message: "Your message has been sent successfully! Our team will get back to you soon." });
            setFormData({ name: "", email: "", subject: "", phone: "", message: "" });
        } catch (err) {
            console.error("Submission error:", err);
            setStatus({ type: 'error', message: "Failed to send message. Please try again later or contact us directly." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "#fafbfc", minHeight: "100vh" }}>
            
            {/* ───────── HEADER HERO ───────── */}
            <section style={{ 
                backgroundColor: "#002868", 
                padding: "80px 5%", 
                color: "#fff",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "50%",
                    height: "100%",
                    backgroundImage: "radial-gradient(circle at center, rgba(200, 16, 46, 0.15) 0%, transparent 60%)",
                    pointerEvents: "none"
                }}></div>

                <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    <h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "12px", fontFamily: "'Playfair Display', serif" }}>
                        Get In touch
                    </h1>
                    <p style={{ fontSize: "1.1rem", color: "#cbd5e1", opacity: "0.9" }}>
                        Get all latest news and updates.
                    </p>
                </div>
            </section>

            {/* ───────── CONTACT FORM ───────── */}
            <section style={{ padding: "80px 5%", backgroundColor: "#fff" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <div style={{ color: "#C8102E", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                            Contact Us
                        </div>
                        <h2 style={{ fontSize: "2.5rem", color: "#002868", fontFamily: "'Playfair Display', serif", fontWeight: "700", marginBottom: "16px" }}>
                            How Can We Help You?
                        </h2>
                        <p style={{ color: "#718096", fontSize: "1.1rem" }}>
                            Please fill the form and we will guide you to the best solution. Our experts will get in touch soon.
                        </p>
                    </div>

                    {status && (
                        <div style={{ 
                            padding: "16px", 
                            borderRadius: "12px", 
                            marginBottom: "32px",
                            textAlign: "center",
                            fontSize: "0.95rem",
                            fontWeight: "500",
                            backgroundColor: status.type === 'success' ? "#f0fdf4" : "#fef2f2",
                            color: status.type === 'success' ? "#166534" : "#991b1b",
                            border: `1px solid ${status.type === 'success' ? "#bbf7d0" : "#fecaca"}`
                        }}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568" }}>Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", width: "100%" }} 
                                required 
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568" }}>Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", width: "100%" }} 
                                required 
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568" }}>Subject</label>
                            <input 
                                type="text" 
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", width: "100%" }} 
                                required 
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568" }}>Phone</label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", width: "100%" }} 
                                required 
                            />
                        </div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568" }}>Message</label>
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", width: "100%", resize: "none" }} 
                                required 
                            ></textarea>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ 
                                    backgroundColor: loading ? "#94a3b8" : "#002868", 
                                    color: "#fff", 
                                    padding: "14px 32px", 
                                    borderRadius: "8px", 
                                    fontWeight: "600", 
                                    fontSize: "1rem", 
                                    border: "none", 
                                    cursor: loading ? "not-allowed" : "pointer", 
                                    transition: "background 0.2s",
                                    opacity: loading ? 0.7 : 1
                                }}
                                onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = "#001a45")}
                                onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = "#002868")}
                            >
                                {loading ? "Sending..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* ───────── LOCATIONS ───────── */}
            <section style={{ padding: "40px 5% 80px", backgroundColor: "#fff" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                    {[
                        { city: "New York", addr: "100 Wall Street, Financial District", place: "New York, NY 10005", email: "info.ny@americaneedsnurses.com" },
                        { city: "Dallas", addr: "1900 N Akard Street, Uptown", place: "Dallas, TX 75201", email: "info.tx@americaneedsnurses.com" },
                        { city: "Chicago", addr: "200 East Randolph St, Aon Center", place: "Chicago, IL 60601", email: "info.il@americaneedsnurses.com" }
                    ].map((loc, i) => (
                        <div key={i} style={{ backgroundColor: "#f8fafc", padding: "40px", borderRadius: "8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                            <div style={{ color: "#002868", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                                <div style={{ backgroundColor: "rgba(0,40,104,0.1)", padding: "16px", borderRadius: "50%" }}>
                                    <MapPin size={28} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: "1.3rem", color: "#1a202c", fontWeight: "700", marginBottom: "12px" }}>{loc.city}</h3>
                            <p style={{ color: "#718096", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 4px 0" }}>{loc.addr}</p>
                            <p style={{ color: "#718096", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 16px 0" }}>{loc.place}</p>
                            <a href={`mailto:${loc.email}`} style={{ color: "#002868", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>{loc.email}</a>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────── GLOBAL CTA ───────── */}
            <section style={{ backgroundColor: "#C8102E", padding: "80px 5%", color: "#fff", textAlign: "center" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", fontFamily: "'Playfair Display', serif", marginBottom: "20px" }}>
                        Find The Perfect Job on America Needs Nurses That is Superb For You
                    </h2>
                    <p style={{ fontSize: "1.1rem", opacity: "0.9", lineHeight: "1.6", marginBottom: "32px" }}>
                        We are connecting thousands of nursing professionals to their dream facilities nationwide. Experience the future of medical staffing today.
                    </p>
                    <Link href="/register" style={{ backgroundColor: "#fff", color: "#C8102E", padding: "14px 32px", paddingRight: "40px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "1.1rem", display: "inline-flex", alignItems: "center", position: "relative" }}>
                        Register Today
                        <span style={{ position: "absolute", right: "12px", fontSize: "1.2rem" }}>→</span>
                    </Link>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                input:focus, textarea:focus {
                    border-color: #002868 !important;
                    background-color: #fff !important;
                }
                .footer-link:hover {
                    color: #fff !important;
                }
                @media (max-width: 768px) {
                    form {
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
