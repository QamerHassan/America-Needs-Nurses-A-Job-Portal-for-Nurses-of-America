"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, MapPin, Briefcase, ChevronRight,
  CircleDollarSign, LayoutGrid, List, Building, Bookmark
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getJobs } from "../utils/api";
import Footer from "../components/Footer";

const specialties = [
  'ICU / Critical Care','Emergency Room (ER)','Pediatrics','Oncology',
  'Labor & Delivery','Operating Room (OR)','Neonatal ICU (NICU)',
  'Psychiatric / Mental Health','Dialysis','Telemetry'
];

const usLocations = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
  'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
  'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  'New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Philadelphia, PA',
  'San Antonio, TX','San Diego, CA','Dallas, TX','San Jose, CA'
];

const commonKeywords = [
  'Registered Nurse','ICU Nurse','ER Nurse','Pediatric Nurse','Travel Nurse','NP','LPN',
  'Nurse Practitioner','CRNA','Staff Nurse','Charge Nurse','Clinical Nurse','Home Health Nurse'
];

const jobTypes = ['Full-time','Part-time','Contract','Travel','Internship'];

/* ─────────────────────────────────────────────────────────────
   HOSPITAL ASSETS MAP
   Logo: Google Favicon Service — 100% reliable, no CORS issues
   Image: Unsplash building photos
───────────────────────────────────────────────────────────── */
const HOSPITAL_ASSETS: Record<string, { logo: string; image: string }> = {
  "mayo clinic": {
    logo: "https://www.google.com/s2/favicons?domain=mayoclinic.org&sz=128",
    image: "https://picsum.photos/seed/hospital-1/800/600",
  },
  "johns hopkins hospital": {
    logo: "https://www.google.com/s2/favicons?domain=hopkinsmedicine.org&sz=128",
    image: "https://picsum.photos/seed/hospital-2/800/600",
  },
  "cleveland clinic": {
    logo: "https://www.google.com/s2/favicons?domain=clevelandclinic.org&sz=128",
    image: "https://picsum.photos/seed/hospital-3/800/600",
  },
  "massachusetts general hospital": {
    logo: "https://www.google.com/s2/favicons?domain=massgeneral.org&sz=128",
    image: "https://picsum.photos/seed/hospital-4/800/600",
  },
  "ucla health": {
    logo: "https://www.google.com/s2/favicons?domain=uclahealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-5/800/600",
  },
  "newyork-presbyterian": {
    logo: "https://www.google.com/s2/favicons?domain=nyp.org&sz=128",
    image: "https://picsum.photos/seed/hospital-6/800/600",
  },
  "cedars-sinai medical center": {
    logo: "https://www.google.com/s2/favicons?domain=cedars-sinai.org&sz=128",
    image: "https://picsum.photos/seed/hospital-7/800/600",
  },
  "ucsf health": {
    logo: "https://www.google.com/s2/favicons?domain=ucsfhealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-8/800/600",
  },
  "stanford health care": {
    logo: "https://www.google.com/s2/favicons?domain=stanfordhealthcare.org&sz=128",
    image: "https://picsum.photos/seed/hospital-9/800/600",
  },
  "northwestern memorial": {
    logo: "https://www.google.com/s2/favicons?domain=nm.org&sz=128",
    image: "https://picsum.photos/seed/hospital-10/800/600",
  },
  "mount sinai hospital": {
    logo: "https://www.google.com/s2/favicons?domain=mountsinai.org&sz=128",
    image: "https://picsum.photos/seed/hospital-11/800/600",
  },
  "houston methodist": {
    logo: "https://www.google.com/s2/favicons?domain=houstonmethodist.org&sz=128",
    image: "https://picsum.photos/seed/hospital-12/800/600",
  },
  "duke university hospital": {
    logo: "https://www.google.com/s2/favicons?domain=dukehealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-13/800/600",
  },
  "brigham and women's hospital": {
    logo: "https://www.google.com/s2/favicons?domain=brighamandwomens.org&sz=128",
    image: "https://picsum.photos/seed/hospital-14/800/600",
  },
  "jefferson health": {
    logo: "https://www.google.com/s2/favicons?domain=jeffersonhealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-15/800/600",
  },
  "emory university hospital": {
    logo: "https://www.google.com/s2/favicons?domain=emoryhealthcare.org&sz=128",
    image: "https://picsum.photos/seed/hospital-16/800/600",
  },
  "upmc presbyterian": {
    logo: "https://www.google.com/s2/favicons?domain=upmc.com&sz=128",
    image: "https://picsum.photos/seed/hospital-17/800/600",
  },
  "unc medical center": {
    logo: "https://www.google.com/s2/favicons?domain=unchealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-18/800/600",
  },
  "vanderbilt university medical center": {
    logo: "https://www.google.com/s2/favicons?domain=vumc.org&sz=128",
    image: "https://picsum.photos/seed/hospital-19/800/600",
  },
  "st. jude children's research hospital": {
    logo: "https://www.google.com/s2/favicons?domain=stjude.org&sz=128",
    image: "https://picsum.photos/seed/hospital-20/800/600",
  },
  "barnes-jewish hospital": {
    logo: "https://www.google.com/s2/favicons?domain=bjc.org&sz=128",
    image: "https://picsum.photos/seed/hospital-21/800/600",
  },
  "rush university medical center": {
    logo: "https://www.google.com/s2/favicons?domain=rush.edu&sz=128",
    image: "https://picsum.photos/seed/hospital-22/800/600",
  },
  "university of michigan health": {
    logo: "https://www.google.com/s2/favicons?domain=uofmhealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-23/800/600",
  },
  "ut southwestern medical center": {
    logo: "https://www.google.com/s2/favicons?domain=utswmed.org&sz=128",
    image: "https://picsum.photos/seed/hospital-24/800/600",
  },
  "uc san diego health": {
    logo: "https://www.google.com/s2/favicons?domain=ucsdhealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-25/800/600",
  },
  "university of kansas hospital": {
    logo: "https://www.google.com/s2/favicons?domain=kansashealthsystem.com&sz=128",
    image: "https://picsum.photos/seed/hospital-26/800/600",
  },
  "university of virginia medical center": {
    logo: "https://www.google.com/s2/favicons?domain=uvahealth.com&sz=128",
    image: "https://picsum.photos/seed/hospital-27/800/600",
  },
  "strong memorial hospital": {
    logo: "https://www.google.com/s2/favicons?domain=urmc.rochester.edu&sz=128",
    image: "https://picsum.photos/seed/hospital-28/800/600",
  },
  "ochsner medical center": {
    logo: "https://www.google.com/s2/favicons?domain=ochsner.org&sz=128",
    image: "https://picsum.photos/seed/hospital-29/800/600",
  },
  "wexner medical center": {
    logo: "https://www.google.com/s2/favicons?domain=wexnermedical.osu.edu&sz=128",
    image: "https://picsum.photos/seed/hospital-30/800/600",
  },
  "oregon health & science university": {
    logo: "https://www.google.com/s2/favicons?domain=ohsu.edu&sz=128",
    image: "https://picsum.photos/seed/hospital-31/800/600",
  },
  "tufts medical center": {
    logo: "https://www.google.com/s2/favicons?domain=tuftsmedicalcenter.org&sz=128",
    image: "https://picsum.photos/seed/hospital-32/800/600",
  },
  "memorial hermann": {
    logo: "https://www.google.com/s2/favicons?domain=memorialhermann.org&sz=128",
    image: "https://picsum.photos/seed/hospital-33/800/600",
  },
  "banner health": {
    logo: "https://www.google.com/s2/favicons?domain=bannerhealth.com&sz=128",
    image: "https://picsum.photos/seed/hospital-34/800/600",
  },
  "yale new haven hospital": {
    logo: "https://www.google.com/s2/favicons?domain=ynhh.org&sz=128",
    image: "https://picsum.photos/seed/hospital-35/800/600",
  },
  "scripps memorial hospital la jolla": {
    logo: "https://www.google.com/s2/favicons?domain=scripps.org&sz=128",
    image: "https://picsum.photos/seed/hospital-36/800/600",
  },
  "inova fairfax hospital": {
    logo: "https://www.google.com/s2/favicons?domain=inova.org&sz=128",
    image: "https://picsum.photos/seed/hospital-37/800/600",
  },
  "corewell health": {
    logo: "https://www.google.com/s2/favicons?domain=corewellhealth.org&sz=128",
    image: "https://picsum.photos/seed/hospital-38/800/600",
  },
  "loyola university medical center": {
    logo: "https://www.google.com/s2/favicons?domain=loyolamedicine.org&sz=128",
    image: "https://picsum.photos/seed/hospital-39/800/600",
  },
  "baptist health south florida": {
    logo: "https://www.google.com/s2/favicons?domain=baptisthealth.net&sz=128",
    image: "https://picsum.photos/seed/hospital-40/800/600",
  },
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/* Get logo + image for a job/company */
function getAssets(job: any, index: number) {
  const company = job.Company;
  const key = (company?.name || "").toLowerCase().trim();
  const mapped = HOSPITAL_ASSETS[key];

  /* Logo priority:
     1. Job.imageUrl (Job-level logo uploaded during post)
     2. DB Company.logoUrl (Company-level logo)
     3. Hardcoded Google Favicon (fallback)
     4. Company Gallery Image
     5. Google Favicon from website
     6. UI Avatars (last resort)
  */
  let logo = "";
  if (job.imageUrl) {
    logo = formatUrl(job.imageUrl);
  } else if (company?.logoUrl) {
    logo = formatUrl(company.logoUrl);
  } else if (mapped?.logo) {
    logo = mapped.logo;
  } else if (company?.CompanyImage?.[0]?.url) {
    logo = formatUrl(company.CompanyImage[0].url);
  } else if (company?.website) {
    try {
      const domain = new URL(company.website).hostname.replace("www.", "");
      logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {}
  }

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(company?.name || "H")}&background=002868&color=fff&size=128&bold=true&font-size=0.4`;

  /* Image priority: Job.bannerUrl → hardcoded map → DB CompanyImage → fallback pool */
  const image =
    formatUrl(job.bannerUrl) ||
    mapped?.image ||
    formatUrl(company?.CompanyImage?.[0]?.url) ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return { logo: logo || avatarFallback, image, avatarFallback };
}

/* ── Logo component: Google favicon → UI Avatars fallback ── */
function CompanyLogo({ src, fallback, alt, className }: {
  src: string; fallback: string; alt: string; className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [tried, setTried] = useState(false);
  useEffect(() => { setImgSrc(src); setTried(false); }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => { if (!tried) { setTried(true); setImgSrc(fallback); } }}
    />
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 9;

  const usLocations = [
    'New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Philadelphia, PA',
    'San Antonio, TX','San Diego, CA','Dallas, TX','San Jose, CA'
  ];

  const searchParams = useSearchParams();

  const filteredKeywords = commonKeywords.filter(k => k.toLowerCase().includes(keyword.toLowerCase()));
  const filteredLocations = usLocations.filter(l => l.toLowerCase().includes(location.toLowerCase()));

  // Read initial search params
  useEffect(() => {
    const k = searchParams.get("keyword");
    const s = searchParams.get("specialty");
    const t = searchParams.get("jobType");

    if (k) setKeyword(k);
    if (s) setSelectedSpecialty(s);
    if (t) setSelectedTypes([t]);

    // Small delay to ensure state updates before fetch
    const timeout = setTimeout(() => {
      fetchJobs();
    }, 100);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  useEffect(() => { fetchJobs(); }, [page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters: any = { page, limit: jobsPerPage };
      if (keyword) filters.keyword = keyword;
      if (location) filters.location = location;
      if (selectedSpecialty) filters.specialty = selectedSpecialty;
      if (selectedTypes.length > 0) filters.jobType = selectedTypes[0];
      
      const response = await getJobs(filters);
      // Backend now returns { jobs, total }
      setJobs(response.jobs || []);
      setTotalJobs(response.total || 0);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (page === 1) fetchJobs(); 
    else setPage(1); // Setting page to 1 will trigger fetchJobs via useEffect
  };
  const toggleType = (type: string) =>
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  const clearFilters = () => {
    setKeyword(""); 
    setLocation(""); 
    setSelectedSpecialty(""); 
    setSelectedTypes([]);
    setPage(1);
    if (page === 1) fetchJobs();
  };

  return (
    <div className="min-h-screen bg-[#1B3A6B] flex flex-col font-['DM_Sans',sans-serif] pt-8">

      <div className="container mx-auto px-6 max-w-[1440px] pb-24 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR (25%) ── */}
          <aside className="lg:w-1/4 w-full flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-black/10 border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#002868]">Search Filters</h3>
                <button onClick={clearFilters} className="text-[#CC2229] text-sm font-bold hover:underline">Clear</button>
              </div>
              <form onSubmit={handleSearch} className="space-y-6">

                {/* Keyword */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">Search Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input type="text" placeholder="Job title, keywords..."
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC2229] transition-all text-sm font-semibold text-gray-800"
                      value={keyword} onChange={e => setKeyword(e.target.value)}
                      onFocus={() => setShowKeywordSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowKeywordSuggestions(false), 200)} />
                    {showKeywordSuggestions && filteredKeywords.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {filteredKeywords.map(k => (
                          <div key={k} className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                            onClick={() => { setKeyword(k); setShowKeywordSuggestions(false); }}>
                            <Search size={14} className="text-gray-300" /> {k}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">Job Category</label>
                  <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC2229] text-sm font-semibold text-gray-800"
                    value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}>
                    <option value="">All Categories</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Job Type */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">Job Type</label>
                  <div className="space-y-2">
                    {jobTypes.map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTypes.includes(type) ? 'bg-[#CC2229] border-[#CC2229]' : 'border-gray-300 bg-white'}`}>
                           {selectedTypes.includes(type) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Job Level & Experience (Stubs) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wide">Job Level</label>
                    <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#CC2229] text-sm font-semibold text-gray-800">
                      <option>Any Level</option><option>Entry</option><option>Mid</option><option>Senior</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wide">Experience</label>
                    <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#CC2229] text-sm font-semibold text-gray-800">
                      <option>Any</option><option>1-3 Yrs</option><option>3-5 Yrs</option><option>5+ Yrs</option>
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">Expected Salary</label>
                  <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC2229] text-sm font-semibold text-gray-800">
                    <option>Any Salary</option>
                    <option>$50k - $75k</option>
                    <option>$75k - $100k</option>
                    <option>$100k+</option>
                  </select>
                </div>

                <button type="submit"
                  className="w-full bg-[#CC2229] text-white font-black tracking-wide py-3.5 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 text-sm uppercase">
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* ── MAIN CONTENT (75%) ── */}
          <main className="lg:w-3/4 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
              <p className="font-bold text-gray-600 text-sm">
                Showing <span className="text-[#002868]">{(page - 1) * jobsPerPage + 1} – {Math.min(page * jobsPerPage, totalJobs)}</span> of{" "}
                <span className="text-[#002868]">{totalJobs}</span> Jobs
              </p>
              <div className="flex items-center gap-3">
                 <span className="text-sm font-bold text-gray-500">Sort by:</span>
                <select className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-bold focus:outline-none focus:border-[#CC2229] text-[#002868] cursor-pointer">
                  <option>Most Relevant</option>
                  <option>Newest First</option>
                  <option>Salary: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl text-center shadow-lg border border-transparent">
                <Search size={40} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs matched</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters.</p>
                <button onClick={clearFilters}
                  className="px-6 py-3 bg-[#002868] text-white rounded-lg font-bold hover:bg-[#CC2229] transition-all">
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* GRID VIEW ONLY */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job, index) => {
                  const { logo, avatarFallback } = getAssets(job, index);
                  return (
                    <div key={job.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col relative group">
                      
                      {/* Top Row: Logo & Bookmark */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1 overflow-hidden">
                          <CompanyLogo src={logo} fallback={avatarFallback} alt={job.Company?.name || "Logo"} className="w-full h-full object-contain" />
                        </div>
                        <button className="text-gray-300 hover:text-[#CC2229] transition-colors p-2">
                           <Bookmark size={20} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <Link href={`/jobs/${job.slug}`} className="text-lg font-black text-[#1B3A6B] hover:text-[#CC2229] transition-colors line-clamp-2 leading-tight mb-1">
                          {job.title}
                        </Link>
                        <p className="text-sm font-semibold text-gray-500 mb-4">{job.Company?.name || "Healthcare Facility"}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="flex items-center gap-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-gray-200">
                            <MapPin size={12} className="text-[#1B3A6B]" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1 bg-red-50 text-[#CC2229] text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-red-100">
                            {job.jobType}
                          </span>
                        </div>

                        {/* Salary & Description */}
                        <div className="mb-4">
                           <div className="text-xl font-black text-[#1B3A6B] mb-2 flex items-center gap-1.5">
                              <CircleDollarSign size={18} className="text-[#CC2229]" />
                              ${(job.salaryMin / 1000).toFixed(0)}k <span className="text-gray-400 font-medium text-sm">/ yr</span>
                           </div>
                           <p className="text-xs font-semibold text-gray-400 line-clamp-1">
                              Requires {(job.specialty || "RN").split(',')[0]} experience.
                           </p>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-4 border-t border-gray-50 mt-auto">
                        <Link href={`/jobs/${job.slug}`} className="w-full bg-white border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#CC2229] hover:border-[#CC2229] hover:text-white transition-all py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                          Apply Now <ChevronRight size={16} />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {!loading && jobs.length > 0 && totalJobs > jobsPerPage && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                  <button 
                    disabled={page === 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'text-[#1B3A6B] hover:bg-gray-100'}`}
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  
                  {Array.from({ length: Math.ceil(totalJobs / jobsPerPage) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button 
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${p === page ? 'bg-[#CC2229] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button 
                    disabled={page >= Math.ceil(totalJobs / jobsPerPage)}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${page >= Math.ceil(totalJobs / jobsPerPage) ? 'opacity-50 cursor-not-allowed' : 'text-[#1B3A6B] hover:bg-gray-100'}`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}