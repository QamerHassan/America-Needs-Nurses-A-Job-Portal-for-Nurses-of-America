"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLogo from "./components/AppLogo";
import LoginModal from "./components/LoginModal";
import Footer from "./components/Footer";
import { getActiveBlogs, getStats, getJobs, getCompanies } from "./utils/api";
import { Calendar, Clock, ChevronRight, MapPin, Building, CircleDollarSign } from "lucide-react";
import CompanyLogo from "./components/CompanyLogo";
import { useAuth } from "./context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ nurses: "400K+", jobs: "12K+", companies: "3K+" });
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const router = useRouter();
  const { auth, isHydrated } = useAuth();

  // Search form states
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [experience, setExperience] = useState("");
  const [salaryRange, setSalaryRange] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keywords) params.append("keyword", keywords);
    if (category && category !== "Select Category") params.append("specialty", category);
    if (jobType && jobType !== "All Type") params.append("jobType", jobType);
    if (jobLevel && jobLevel !== "Entry Level") params.append("jobLevel", jobLevel);
    if (experience && experience !== "1 Year") params.append("experience", experience);
    if (salaryRange && salaryRange !== "Select Salary Range") params.append("salary", salaryRange);

    router.push(`/jobs?${params.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, jobsData, companiesData, blogData] = await Promise.all([
          getStats(),
          getJobs({ limit: 4 }), // Fetch top 4 jobs
          getCompanies({ limit: 3 }), // Fetch top 3 companies
          getActiveBlogs()
        ]);

        if (statsData) {
          setStats({
            nurses: statsData.nurses > 1000 ? (statsData.nurses / 1000).toFixed(1) + "K+" : statsData.nurses,
            jobs: statsData.jobs > 1000 ? (statsData.jobs / 1000).toFixed(1) + "K+" : statsData.jobs,
            companies: statsData.companies > 1000 ? (statsData.companies / 1000).toFixed(1) + "K+" : statsData.companies
          });
        }
        setFeaturedJobs(jobsData.jobs || []);
        setCompanies(companiesData || []);
        setBlogs(blogData.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch home data", err);
      }
    };
    fetchData();
  }, []);

  // Auto-open login popup if user is not already logged in
  useEffect(() => {
    if (!isHydrated) return;
    if (!auth) {
      const timer = setTimeout(() => setIsLoginOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, auth]);

  useEffect(() => {
    // ── Stars ──
    const starsEl = document.getElementById("stars");
    if (starsEl) {
      starsEl.innerHTML = "";
      for (let i = 0; i < 70; i++) {
        const s = document.createElement("div");
        s.className = "star";
        const size = Math.random() * 3 + 1;
        s.style.cssText = `
          width:${size}px; height:${size}px;
          left:${Math.random() * 100}%;
          top:${Math.random() * 100}%;
          animation-delay:${Math.random() * 4}s;
          animation-duration:${2 + Math.random() * 3}s;
        `;
        starsEl.appendChild(s);
      }
    }

    // ── Scroll reveal ──
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            // stagger siblings
            const siblings = el.parentElement?.children;
            let delay = 0;
            if (siblings) {
              delay = Array.from(siblings).indexOf(el) * 120;
            }
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".how-card, .role-card, .company-card").forEach((el) => {
      const hEl = el as HTMLElement;
      hEl.style.opacity = "0";
      hEl.style.transform = "translateY(30px)";
      hEl.style.transition = "opacity .65s ease, transform .65s cubic-bezier(.22,1,.36,1)";
      observer.observe(hEl);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── NAVBAR ── */}

      {/* ── HERO ── */}
      <section className="relative min-h-[120vh] lg:min-h-0 lg:h-[calc(100vh-72px)] flex items-center bg-[#f8fafc] overflow-hidden">
        {/* Background Image (Left side) */}
        <div className="absolute inset-0 w-full lg:w-[60%] h-full">
          <div
            className="absolute inset-0 bg-cover bg-[center_top_20%]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584982751601-97d8cb07774e?q=80&w=2070')" }}
          />
          {/* Subtle blue overlay with blur */}
          <div className="absolute inset-0 bg-[#002868]/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Curved White Overlay (Right side background) */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-[45%] pointer-events-none z-0">
          <svg className="absolute inset-0 h-full w-full drop-shadow-2xl" preserveAspectRatio="none" viewBox="0 0 100 100" fill="#f8fafc">
            <path d="M 30 0 C -20 40, 20 70, 0 100 L 100 100 L 100 0 Z"></path>
          </svg>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col lg:flex-row items-center justify-between h-full py-16 lg:py-0 gap-12 lg:gap-0">

          {/* Left Text Content */}
          <div className="w-full lg:w-[50%] text-white text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm">
              America's #1 Healthcare Recruitment Platform
            </div>
            <h1 className="text-[2.5rem] lg:text-[3.5rem] xl:text-[4rem] font-black leading-[1.1] mb-6 tracking-tight drop-shadow-md">
              Connecting <span className="text-[#C8102E] drop-shadow-none">Nurses</span><br className="hidden lg:block" /> With Healthcare Employers Nationwide
            </h1>
            <p className="text-lg text-blue-100/90 mb-10 font-bold leading-relaxed max-w-[90%] mx-auto lg:mx-0">
              Browse thousands of nursing jobs, discover top healthcare companies, and build your career — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/jobs" className="w-full sm:w-auto px-8 py-4 bg-[#C8102E] hover:bg-[#a00c24] text-white rounded-xl font-black tracking-wide transition-all shadow-lg shadow-red-900/30 text-base flex items-center justify-center gap-2">
                Find Nursing Jobs <ChevronRight size={18} strokeWidth={3} />
              </Link>
              <Link href="/employer/post_job" className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white/30 text-white rounded-xl font-black tracking-wide transition-all text-base flex items-center justify-center">
                List Your Company
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-10 mt-16 pt-10 border-t border-white/10 justify-center lg:justify-start">
              <div>
                <div className="text-4xl xl:text-5xl font-black text-white drop-shadow-md">{stats.nurses}</div>
                <div className="text-[10px] xl:text-xs font-black uppercase tracking-widest text-[#C8102E] mt-1">Nurse Profiles</div>
              </div>
              <div>
                <div className="text-4xl xl:text-5xl font-black text-white drop-shadow-md">{stats.jobs}</div>
                <div className="text-[10px] xl:text-xs font-black uppercase tracking-widest text-blue-200 mt-1">Active Jobs</div>
              </div>
              <div>
                <div className="text-4xl xl:text-5xl font-black text-white drop-shadow-md">{stats.companies}</div>
                <div className="text-[10px] xl:text-xs font-black uppercase tracking-widest text-blue-200 mt-1">Companies</div>
              </div>
            </div>
          </div>

          {/* Right Floating Card (Form) */}
          <div className="w-full lg:w-[42%] relative z-20">
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
              <h2 className="text-2xl font-black text-[#002868] mb-1">
                Grow Your Career With
              </h2>
              <h2 className="text-4xl font-black text-[#1a8c62] mb-8" style={{ color: "#1a8c62" /* JobStock vibrant green for contrast, or use red as you prefer */ }}>
                <span className="text-[#C8102E]">America Needs Nurses</span>
              </h2>

              <div className="space-y-6">
                {/* Search Keywords */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Job Keywords.."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#C8102E] outline-none focus:ring-4 focus:ring-red-50 transition-all font-bold text-[#002868] placeholder-gray-400 bg-gray-50/50"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Job Category</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#C8102E] outline-none bg-gray-50/50 hover:bg-gray-50 text-sm font-bold text-[#002868] cursor-pointer appearance-none transition-all"
                      style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23002868%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: ".65rem auto" }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Select Category</option>
                      <option>Registered Nurse (RN)</option>
                      <option>LPN / LVN</option>
                      <option>Nurse Practitioner (NP)</option>
                      <option>ICU / Critical Care</option>
                      <option>Emergency Room (ER)</option>
                      <option>Home Health</option>
                      <option>Pediatrics</option>
                      <option>Operating Room (OR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Job Type</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#C8102E] outline-none bg-gray-50/50 hover:bg-gray-50 text-sm font-bold text-[#002868] cursor-pointer appearance-none transition-all"
                      style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23002868%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: ".65rem auto" }}
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                    >
                      <option>All Type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Travel Nurse</option>
                      <option>Per Diem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Job Level</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#C8102E] outline-none bg-gray-50/50 hover:bg-gray-50 text-sm font-bold text-[#002868] cursor-pointer appearance-none transition-all"
                      style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23002868%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: ".65rem auto" }}
                      value={jobLevel}
                      onChange={(e) => setJobLevel(e.target.value)}
                    >
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                      <option>Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Experience</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#C8102E] outline-none bg-gray-50/50 hover:bg-gray-50 text-sm font-bold text-[#002868] cursor-pointer appearance-none transition-all"
                      style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23002868%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: ".65rem auto" }}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    >
                      <option>1 Year</option>
                      <option>2 Years</option>
                      <option>3 Years</option>
                      <option>5+ Years</option>
                      <option>10+ Years</option>
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">Expected Salary</label>
                  <select
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#C8102E] outline-none bg-gray-50/50 hover:bg-gray-50 text-sm font-bold text-[#002868] cursor-pointer appearance-none transition-all"
                    style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23002868%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: ".65rem auto" }}
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                  >
                    <option>Select Salary Range</option>
                    <option>$50k – $70k</option>
                    <option>$70k – $100k</option>
                    <option>$100k – $150k</option>
                    <option>$150k+</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSearch}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-[#C8102E] to-[#b30e28] hover:opacity-90 text-white rounded-xl font-black tracking-wide shadow-lg shadow-red-900/30 transition-all text-[15px] uppercase"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <div className="features-bar">
        {[
          { icon: "🏥", label: "Company Directory" },
          { icon: "💼", label: "Job Board" },
          { icon: "👩‍⚕️", label: "Nurse Community" },
          { icon: "📰", label: "Newsletter" },
          { icon: "✉️", label: "Direct Messaging" },
        ].map((f) => (
          <div className="feature-item" key={f.label}>
            <span className="feature-icon">{f.icon}</span>
            <div className="feature-label">{f.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="how">
        <div style={{ textAlign: "center" }}>
          <div className="section-tag">How It Works</div>
          <h2>Simple Steps to Your <em>Dream Career</em></h2>
          <p className="section-sub" style={{ margin: ".75rem auto 0" }}>
            Whether you're a nurse looking for work or an employer searching for talent, we make it easy.
          </p>
        </div>
        <div className="how-grid">
          {[
            { n: "1", title: "Create Your Profile", body: "Nurses register and build a complete profile with license, specialty, and experience details." },
            { n: "2", title: "Browse & Discover", body: "Search thousands of jobs and explore the healthcare company directory filtered by specialty." },
            { n: "3", title: "Apply & Connect", body: "Apply with one click, message employers directly, and track all your applications in one dashboard." },
          ].map((c) => (
            <div className="how-card" key={c.n}>
              <div className="how-num">{c.n}</div>
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR (no admin) ── */}
      <section>
        <div className="section-tag">Who It's For</div>
        <h2>Built for Every <em>Healthcare Role</em></h2>
        <p className="section-sub">
          A platform designed to serve nurses, employers, and the healthcare community.
        </p>
        <div className="roles-grid">
          <div className="role-card nurse">
            <span className="role-icon">👩‍⚕️</span>
            <div>
              <h4>For Nurses</h4>
              <p>
                Create your profile, apply to jobs, connect with other nurses in the community,
                and manage your career all from one dashboard.
              </p>
              <Link href="/jobs" className="role-pill">Browse Jobs →</Link>
            </div>
          </div>
          <div className="role-card employer">
            <span className="role-icon">🏨</span>
            <div>
              <h4>For Employers</h4>
              <p>
                List your healthcare company in our directory, post jobs, manage applications,
                and reach thousands of qualified nurses instantly.
              </p>
              <span className="role-pill">Post a Job →</span>
            </div>
          </div>
          <div className="role-card guest">
            <span className="role-icon">👁️</span>
            <div>
              <h4>For Visitors</h4>
              <p>
                Browse the company directory, explore job listings, and subscribe to our
                newsletter — no account required.
              </p>
              <span className="role-pill">Explore Now →</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ── */}
      <section className="featured-jobs py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="section-tag">Explore Opportunities</div>
              <h2 className="text-4xl font-black text-[#002868] mt-2">Latest <em>Nursing Jobs</em></h2>
            </div>
            <Link href="/jobs" className="text-[#C8102E] font-bold hover:underline flex items-center gap-1">
              Browse All Jobs <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.slug}`} className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                      {job.Company?.logoUrl ? (
                        <CompanyLogo src={job.Company.logoUrl} alt={job.Company.name} className="w-full h-full object-contain" fallbackIconSize={20} />
                      ) : (
                        <Building size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">{job.Company?.name}</h5>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin size={10} className="text-[#C8102E]" /> {job.location}
                      </div>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-[#002868] mb-4 group-hover:text-[#C8102E] transition-colors line-clamp-2 h-12">
                    {job.title}
                  </h4>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[#002868] font-bold text-sm">
                      <CircleDollarSign size={14} className="text-green-500" />
                      ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#002868] rounded uppercase">
                      {job.jobType}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-10 text-gray-400">Loading featured jobs...</div>
            )}
          </div>
        </div>
      </section>

      {/* ── COMPANIES ── */}
      <section className="companies">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="section-tag">Company Directory</div>
            <h2>Explore Top <em>Healthcare Companies</em></h2>
          </div>
          <a href="#" className="btn-outline">View All Companies →</a>
        </div>
        <div className="company-cards">
          {companies.length > 0 ? (
            companies.map((company, idx) => (
              <div className="company-card" key={company.id}>
                <div
                  className="company-img"
                  style={{
                    background: company.bannerUrl ? `url(${formatUrl(company.bannerUrl)}) center/cover` : (idx % 2 === 0 ? "var(--red)" : "var(--navy)"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative"
                  }}
                >
                  {company.bannerUrl && <div className="absolute inset-0 bg-black/20" />}
                  <div className="relative z-10 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                      <CompanyLogo src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" fallbackIconSize={32} />
                    ) : (
                      <Building size={32} className="text-[#002868]" />
                    )}
                  </div>
                </div>
                <div className="company-body">
                  <div className="company-cat">{company.industry || "Healthcare"}</div>
                  <h5>{company.name}</h5>
                  <p className="line-clamp-2">{company.description || company.bio || "Leading healthcare provider dedicated to clinical excellence."}</p>
                </div>
                <div className="company-footer">
                  <span className="company-jobs"><strong>{company._count?.Job || 0}</strong> open positions</span>
                  <Link href={`/companies/${company.id}`} className="view-link">View →</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-gray-400">Loading companies...</div>
          )}
        </div>
      </section>

      {/* ── BLOG SECTION ── */}
      <section className="blog-section py-32 px-6 bg-[#fcfcfd]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 px-4">
            <div>
              <div className="section-tag">Resources & News</div>
              <h2 className="text-5xl font-black text-[#002868] mt-4">Latest From <em>Our Blog</em></h2>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#C8102E] hover:text-[#002868] transition-colors">
              Explore all articles <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.length > 0 ? blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group bg-white rounded-[3rem] overflow-hidden shadow-xl border border-gray-50 flex flex-col h-full transform hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={blog.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173bc39978c?q=80&w=2070"}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-[#002868] shadow-sm">
                    {blog.category}
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#C8102E]" /> {new Date(blog.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#C8102E]" /> 12 min read</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#002868] leading-tight mb-6 group-hover:text-[#C8102E] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-3 mb-8">
                    {blog.excerpt || "Discover expert insights, career strategies, and industry updates dedicated to the American nursing community."}
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-[#002868]">Read Full Story</span>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#002868] group-hover:bg-[#C8102E] group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[3rem] h-[500px] animate-pulse border border-gray-100" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter">
        <div className="section-tag" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
          Newsletter
        </div>
        <h2>Stay Ahead in <em style={{ color: "var(--gold)" }}>Healthcare</em></h2>
        <p className="section-sub">
          Get weekly job alerts, company highlights, and nurse-focused content delivered to your inbox.
          No account needed.
        </p>
        <div className="subscribe-form">
          <input type="email" placeholder="Enter your email address…" />
          <button>Subscribe Free</button>
        </div>
        <p className="newsletter-note">🔒 No spam, ever. Unsubscribe anytime.</p>
      </section>

      <Footer />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}