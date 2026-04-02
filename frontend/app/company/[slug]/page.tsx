"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Mail, Phone, Globe, Building, Calendar, Users, DollarSign,
  Briefcase, CheckCircle, Bookmark, ArrowUp, Share2,
  Clock, ChevronRight, Star
} from "lucide-react";
import Footer from "../../components/Footer";
import CompanyLogo from "../../components/CompanyLogo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function CompanyProfilePage() {
  const { slug } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (slug) {
      fetch(`${API_URL}/companies/${slug}`)
        .then(r => r.json())
        .then(data => setCompany(data))
        .catch(err => console.error("Failed to load company:", err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Contact form submit simulation
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setSending(false);
  };

  const formatUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4f7fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f4f7fa] gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Company Not Found</h2>
        <p className="text-gray-500">The company profile you are looking for does not exist.</p>
        <Link href="/companies" className="bg-[#C8102E] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a00d25] transition-colors">
          Browse Companies
        </Link>
      </div>
    );
  }

  const jobs = company.Job || [];
  const logoUrl = company.CompanyImage?.[0]?.url || company.logoUrl || null;
  const tags = company.tags || [];

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-['DM_Sans',sans-serif] flex flex-col">
      <div className="flex-1 w-full pt-0">
        
        {/* ─── Cover Photo Background ─── */}
        <div className="w-full h-[260px] md:h-[320px] bg-[#002868] relative overflow-hidden">
          {company.bannerUrl ? (
            <img src={formatUrl(company.bannerUrl)} alt="Cover" className="w-full h-full object-cover transition-all duration-700 hover:scale-105" />
          ) : company.CompanyImage?.[0]?.url ? (
            <div className="relative w-full h-full">
              <img src={formatUrl(company.CompanyImage[0].url)} alt="Cover Gallery" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>
          ) : (
            <img src="https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=1200&auto=format&fit=crop" alt="Pro Cover" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#002868]/95 via-[#002868]/40 to-black/10 pointer-events-none" />
        </div>

        <div className="max-w-[1140px] mx-auto px-5 -mt-24 relative z-10">

          {/* ─── Header Card ─── */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[#002868]/5 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border border-white/50 backdrop-blur-xl">
            <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="w-28 h-28 rounded-2xl border-4 border-gray-50 flex items-center justify-center overflow-hidden bg-white shadow-md flex-shrink-0">
              {logoUrl ? (
                <CompanyLogo src={logoUrl} alt={company.name} className="w-full h-full p-2 object-contain" fallbackIconSize={48} />
              ) : (
                <span className="text-4xl font-black text-[#002868]">
                  {company.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {company.isFeatured && (
                  <span className="bg-rose-50 text-[#C8102E] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Featured
                  </span>
                )}
                {company.status === "APPROVED" && (
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black text-[#002868] mb-1 tracking-tight">{company.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-gray-500">
                {(company.category || company.User?.EmployerProfile?.companyCategory) && (
                  <span className="flex items-center gap-1.5"><Building size={14} /> {company.User?.EmployerProfile?.companyCategory || company.category}</span>
                )}
                {(company.city || company.address || company.User?.EmployerProfile?.location) && (
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {[company.city, company.state].filter(Boolean).join(", ") || company.address || company.User?.EmployerProfile?.location}</span>
                )}
                {(company.foundedYear || company.User?.EmployerProfile?.foundedYear) && (
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> Est. {company.User?.EmployerProfile?.foundedYear || company.foundedYear}</span>
                )}
                {(company.companySize || company.User?.EmployerProfile?.companySize) && (
                  <span className="flex items-center gap-1.5"><Users size={14} /> {company.User?.EmployerProfile?.companySize || company.companySize} Employees</span>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {tags.map((tag: string) => (
                    <span key={tag} className="bg-blue-50 text-[#002868] text-xs font-bold px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer"
                className="bg-[#002868] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-900 transition-all flex items-center gap-2 shadow-lg">
                <Globe size={16} /> Visit Website
              </a>
            )}
            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#002868] hover:border-[#002868] transition-all">
              <Bookmark size={20} />
            </button>
          </div>
        </div>

        {/* ─── Two Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* Main Column */}
          <div>

            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 pb-4 border-b border-gray-100">About Company</h3>
              <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                {company.User?.EmployerProfile?.about || company.description || "This company has not provided a description yet. They are an active employer on the America Needs Nurses platform connecting healthcare facilities with nursing talent."}
              </p>
            </div>

            {/* Company Info Grid */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6 pb-4 border-b border-gray-100">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Mail, label: "Email Address", value: company.email || company.User?.email },
                  { icon: Phone, label: "Phone Number", value: company.phone || company.User?.EmployerProfile?.phone },
                  { icon: Globe, label: "Website", value: company.website || company.User?.EmployerProfile?.website, isLink: true },
                  { icon: MapPin, label: "Location", value: [company.city, company.state, company.country].filter(Boolean).join(", ") || company.address || company.User?.EmployerProfile?.location },
                  { icon: Building, label: "Category", value: company.User?.EmployerProfile?.companyCategory || company.category },
                  { icon: Users, label: "Company Size", value: (company.User?.EmployerProfile?.companySize || company.companySize) ? (company.User?.EmployerProfile?.companySize || company.companySize) + " Employees" : null },
                  { icon: Calendar, label: "Founded Year", value: company.User?.EmployerProfile?.foundedYear || company.foundedYear },
                  { icon: DollarSign, label: "Revenue", value: company.User?.EmployerProfile?.revenue || company.revenue },
                ].filter(i => i.value).map(({ icon: Icon, label, value, isLink }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#002868] flex-shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                      {isLink ? (
                        <a href={value!} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#C8102E] hover:underline">{value}</a>
                      ) : (
                        <p className="text-sm font-bold text-gray-800">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-900">Open Positions</h3>
                <span className="text-xs font-black text-[#002868] bg-blue-50 px-3 py-1 rounded-full">
                  {jobs.length} Jobs
                </span>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Briefcase size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="font-bold text-sm">No open positions at the moment.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {jobs.map((job: any) => (
                    <Link
                      href={`/jobs/${job.slug}`}
                      key={job.id}
                      className="flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-[#002868]/20 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] flex items-center justify-center">
                          <Briefcase size={20} className="text-[#002868]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-[#C8102E] font-black uppercase tracking-widest mb-0.5">{job.specialty || "Nursing"}</p>
                          <h4 className="text-sm font-black text-[#002868] group-hover:text-[#C8102E] transition-colors">{job.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-gray-400 uppercase">
                            <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock size={10} /> {job.jobType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {job.salaryMin && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            ${job.salaryMin.toLocaleString()}+
                          </span>
                        )}
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#002868] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Video (if exists) */}
            {company.videoUrl && (
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-4 pb-4 border-b border-gray-100">Company Video</h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <iframe
                    src={company.videoUrl.replace("watch?v=", "embed/")}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">

            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-5">Contact {company.name?.split(" ")[0]}</h3>

              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                  <p className="font-black text-gray-800 text-sm">Message Sent!</p>
                  <p className="text-gray-400 text-xs mt-1">They will respond to your email shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="flex flex-col gap-4">
                  {[
                    { key: "name", placeholder: "Your Name", type: "text" },
                    { key: "email", placeholder: "Email Address", type: "email" },
                    { key: "phone", placeholder: "Phone Number", type: "tel" },
                    { key: "subject", placeholder: "Subject", type: "text" },
                  ].map(f => (
                    <input
                      key={f.key}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(contactForm as any)[f.key]}
                      onChange={e => setContactForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#002868] focus:bg-white transition-all"
                      required
                    />
                  ))}
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#002868] focus:bg-white transition-all resize-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[#002868] hover:bg-blue-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>



            {/* Map placeholder if lat/lng exists */}
            {company.latitude && company.longitude && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <iframe
                  src={`https://maps.google.com/maps?q=${company.latitude},${company.longitude}&z=14&output=embed`}
                  className="w-full h-56"
                  title="Company Location"
                  loading="lazy"
                />
                <div className="p-4 flex items-center gap-2 text-xs font-bold text-gray-500">
                  <MapPin size={14} className="text-[#C8102E]" />
                  {[company.city, company.state, company.country].filter(Boolean).join(", ") || company.address || "View on Map"}
                </div>
              </div>
            )}

          </div>
        </div>
        </div>
      </div>

      <Footer />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-[#C8102E] text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-[#a00d25] hover:scale-110 transition-all"
        >
          ↑
        </button>
      )}
    </div>
  );
}
