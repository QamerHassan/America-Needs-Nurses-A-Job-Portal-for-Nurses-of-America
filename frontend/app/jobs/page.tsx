"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, MapPin, Briefcase, ChevronRight,
  CircleDollarSign, LayoutGrid, List, Building
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-['DM_Sans',sans-serif]">

      {/* Hero */}
      <div className="bg-[#002868] text-white py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-['Playfair_Display',serif] font-bold mb-4">
            Find Your Next Nursing Job
          </h1>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Browse Jobs</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR ── */}
          <aside className="lg:w-1/4 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#002868]">Search Filter</h3>
                <button onClick={clearFilters} className="text-red-600 text-sm font-semibold hover:underline">Clear All</button>
              </div>
              <form onSubmit={handleSearch} className="space-y-6">

                {/* Keyword */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" placeholder="Search by keywords..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] transition-all"
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                    onFocus={() => setShowKeywordSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowKeywordSuggestions(false), 200)} />
                  {showKeywordSuggestions && filteredKeywords.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredKeywords.map(k => (
                        <div key={k} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                          onClick={() => { setKeyword(k); setShowKeywordSuggestions(false); }}>
                          <Search size={14} className="text-gray-300" /> {k}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input type="text" placeholder="Location, Zip.."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] transition-all"
                    value={location} onChange={e => setLocation(e.target.value)}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)} />
                  {showLocationSuggestions && filteredLocations.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredLocations.map(l => (
                        <div key={l} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                          onClick={() => { setLocation(l); setShowLocationSuggestions(false); }}>
                          <MapPin size={14} className="text-gray-300" /> {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Job Categories</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}>
                    <option value="">All Categories</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Job Type</label>
                  <div className="space-y-3">
                    {jobTypes.map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#C8102E] focus:ring-[#C8102E]"
                          checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit"
                  className="w-full bg-[#C8102E] text-white font-bold py-3 rounded-lg hover:bg-black transition-all shadow-md active:scale-95">
                  Search Jobs
                </button>
              </form>
            </div>

            {/* Newsletter */}
            <div className="bg-[#002868] p-8 rounded-xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4">Get The Latest Jobs Right Into Your Inbox!</h3>
                <p className="text-blue-100 text-sm mb-6">We just want your email address!</p>
                <div className="space-y-3">
                  <input type="email" placeholder="Enter Your email"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/20" />
                  <button className="w-full bg-white text-[#002868] font-bold py-3 rounded-lg hover:bg-[#C8102E] hover:text-white transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 bg-white/5 w-32 h-32 rounded-full group-hover:scale-150 transition-transform duration-700" />
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="lg:w-3/4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <p className="font-medium text-gray-600">
                Showing <span className="text-[#002868] font-bold">{(page - 1) * jobsPerPage + 1} – {Math.min(page * jobsPerPage, totalJobs)}</span> of{" "}
                <span className="text-[#002868] font-bold">{totalJobs}</span> Results
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white p-1 rounded-lg border border-gray-100 shadow-sm mr-4">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#C8102E] text-white' : 'text-gray-400 hover:text-[#002868]'}`}>
                    <LayoutGrid size={18} />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#C8102E] text-white' : 'text-gray-400 hover:text-[#002868]'}`}>
                    <List size={18} />
                  </button>
                </div>
                <select className="bg-white border border-gray-100 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none">
                  <option>Short by (Default)</option>
                  <option>Newest First</option>
                  <option>Salary: High to Low</option>
                </select>
                <select className="bg-white border border-gray-100 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none">
                  <option>10 Per Page</option>
                  <option>20 Per Page</option>
                  <option>50 Per Page</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white p-16 rounded-xl text-center shadow-sm border border-dashed border-gray-300">
                <Search size={32} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters.</p>
                <button onClick={clearFilters}
                  className="px-6 py-3 bg-[#002868] text-white rounded-lg font-bold hover:bg-[#C8102E] transition-all">
                  Clear All Filters
                </button>
              </div>

            ) : viewMode === 'grid' ? (
              /* ══════════ GRID VIEW ══════════ */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job, index) => {
                  const { logo, image, avatarFallback } = getAssets(job, index);
                  return (
                    <div key={job.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col group">

                      {/* Hospital building photo */}
                      <div className="h-44 relative overflow-hidden bg-[#001e50]">
                        <img
                          src={image}
                          alt={job.Company?.name || "Hospital"}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-90 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001e50]/80 via-[#001e50]/10 to-transparent" />
                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 bg-green-500 text-white rounded-full shadow">
                          Featured
                        </span>
                        <Link href={`/jobs/${job.slug}`}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#C8102E] transition-all">
                          <ChevronRight size={15} />
                        </Link>
                        <p className="absolute bottom-3 left-4 right-4 text-white text-xs font-semibold tracking-wide truncate drop-shadow">
                          {job.Company?.name}
                        </p>
                      </div>

                      {/* Company logo — overlapping bottom of image */}
                      <div className="flex justify-center -mt-7 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-white shadow-lg border-2 border-white group-hover:border-red-100 transition-colors flex items-center justify-center overflow-hidden p-1">
                          <CompanyLogo
                            src={logo}
                            fallback={avatarFallback}
                            alt={job.Company?.name || "Logo"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="px-5 pb-5 pt-3 flex flex-col items-center flex-grow">
                        <h3 className="text-base font-black text-[#002868] text-center mb-1 group-hover:text-[#C8102E] transition-colors leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-bold mb-4 flex items-center gap-1 uppercase tracking-wider">
                          <MapPin size={11} className="text-[#C8102E]" /> {job.location}
                        </p>

                        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                          {(job.specialty || "General Nursing").split(", ").map((tag: string) => (
                            <span key={tag} className="text-[10px] font-black uppercase text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto w-full pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Salary Range</span>
                            <span className="text-base font-black text-[#002868] flex items-center gap-1">
                              <CircleDollarSign size={14} className="text-red-500" />
                              ${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Type</span>
                            <span className="text-[11px] font-bold text-white bg-[#002868] px-3 py-1 rounded-full group-hover:bg-[#C8102E] transition-colors">
                              {job.jobType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (
              /* ══════════ LIST VIEW ══════════ */
              <div className="flex flex-col gap-5">
                {jobs.map((job, index) => {
                  const { logo, image, avatarFallback } = getAssets(job, index);
                  return (
                    <div key={job.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col md:flex-row">

                      {/* Image strip */}
                      <div className="md:w-40 h-32 md:h-auto relative flex-shrink-0 overflow-hidden bg-[#001e50]">
                        <img src={image} alt={job.Company?.name || "Hospital"}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#001e50]/40 to-transparent" />
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 bg-green-500 text-white rounded-full shadow">
                          Featured
                        </span>
                      </div>

                      {/* Center */}
                      <div className="flex flex-1 items-center gap-5 p-5">
                        <div className="w-14 h-14 rounded-xl bg-white border-2 border-gray-100 shadow-sm group-hover:border-red-100 transition-colors flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                          <CompanyLogo src={logo} fallback={avatarFallback}
                            alt={job.Company?.name || "Logo"} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <Link href={`/jobs/${job.slug}`}
                            className="text-lg font-black text-[#002868] hover:text-[#C8102E] transition-colors block truncate mb-1">
                            {job.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-semibold">
                            <span className="flex items-center gap-1.5"><Building size={14} className="text-red-500" />{job.Company?.name}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500" />{job.location}</span>
                            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-red-500" />{job.jobType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-center justify-center gap-3 px-6 py-5 border-t md:border-t-0 md:border-l border-gray-100 min-w-[155px]">
                        <div className="text-xl font-black text-[#002868] whitespace-nowrap">
                          ${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k
                        </div>
                        <Link href={`/jobs/${job.slug}`}
                          className="px-5 py-2 bg-gray-50 text-[#002868] font-black rounded-lg group-hover:bg-[#C8102E] group-hover:text-white transition-all text-sm border border-gray-100 whitespace-nowrap">
                          View Job
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && jobs.length > 0 && totalJobs > jobsPerPage && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:bg-[#C8102E] hover:text-white'}`}
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  
                  {Array.from({ length: Math.ceil(totalJobs / jobsPerPage) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button 
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${p === page ? 'bg-[#C8102E] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button 
                    disabled={page >= Math.ceil(totalJobs / jobsPerPage)}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 transition-all ${page >= Math.ceil(totalJobs / jobsPerPage) ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:bg-[#C8102E] hover:text-white'}`}
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