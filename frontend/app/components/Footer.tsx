"use client";

import React from "react";
import Link from "next/link";
import AppLogo from "./AppLogo";
import { 
  Mail, Phone, MapPin, ChevronRight, 
  ExternalLink, ArrowUpRight, Globe, 
  Award, Briefcase, Users 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerGroups = [
    {
      title: "Solutions for Nurses",
      links: [
        { label: "Find Nursing Jobs", href: "/jobs" },
        { label: "Career Dashboard", href: "/profile" },
        { label: "Resume Builder", href: "#" },
        { label: "Saved Listings", href: "/saved-jobs" },
        { label: "Nursing Blog", href: "/blog" },
      ]
    },
    {
      title: "Employers & Facilities",
      links: [
        { label: "Post a Job", href: "/employer/post-job" },
        { label: "Talent Search", href: "#" },
        { label: "Hiring Plans", href: "/pricing" },
        { label: "Facility Profiles", href: "#" },
        { label: "Recruitment Blog", href: "#" },
      ]
    },
    {
      title: "America Needs Nurses",
      links: [
        { label: "About Our Mission", href: "/about" },
        { label: "Partner with Us", href: "#" },
        { label: "Contact Support", href: "/contact" },
        { label: "Newsroom", href: "#" },
        { label: "Careers at ANN", href: "#" },
      ]
    },
    {
      title: "Compliance & Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Accessibility Status", href: "#" },
        { label: "Safety Center", href: "#" },
        { label: "Sitemap", href: "#" },
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 font-sans mt-auto selection:bg-red-50">
      {/* 1. Branding High-Visibility Header */}
      <div className="bg-gray-50/50 border-b border-gray-100/10">
        <div className="max-w-[1440px] mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
           <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="p-4 bg-[#1B3A6B] rounded-2xl shadow-xl shadow-blue-900/10 hover:scale-105 transition-transform duration-500">
                 <AppLogo className="h-12 w-auto brightness-0 invert" />
              </div>
              <div className="max-w-md">
                 <h2 className="text-xl font-black text-[#1B3A6B] leading-tight mb-2 uppercase tracking-tighter italic">America Needs Nurses<span className="text-[#CC2229]">.</span></h2>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed">
                   The leading healthcare recruitment marketplace connecting top-tier talent with America's most prestigious medical facilities.
                 </p>
              </div>
           </div>
           
           <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: "Twitter", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z", label: "Follow us" },
                { name: "Linkedin", path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z", label: "Network" },
                { name: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", label: "Community" },
                { name: "Instagram", path: "M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.28.058 1.688.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.505.18 5.405 2.084 5.587 5.587.055 1.265.07 1.648.07 4.851 0 3.203-.015 3.585-.07 4.85-.182 3.504-2.085 5.407-5.587 5.588-1.264.055-1.647.07-4.85.07-3.203 0-3.585-.015-4.85-.07-3.504-.181-5.408-2.084-5.588-5.588-.055-1.264-.07-1.646-.07-4.85 0-3.203.015-3.585.07-4.85.181-3.504 2.084-5.408 5.588-5.587 1.264-.055 1.646-.07 4.85-.07zm0 3.678c-3.413 0-6.162 2.748-6.162 6.162 0 3.413 2.749 6.162 6.162 6.162 3.413 0 6.162-2.749 6.162-6.162 0-3.414-2.749-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.645-1.44-1.44 0-.794.645-1.439 1.44-1.439.794 0 1.44.645 1.44 1.439z", label: "Life at ANN" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="group flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-black text-[#1B3A6B] hover:border-[#CC2229] hover:text-[#CC2229] hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300"
                  aria-label={social.name}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className="text-gray-300 group-hover:text-[#CC2229] transition-colors"
                  >
                    <path d={social.path} />
                  </svg>
                  <span className="hidden sm:inline">{social.label}</span>
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* 2. Professional Deep Links Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-20">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-16">
            
            {footerGroups.map((group) => (
              <div key={group.title} className="flex flex-col">
                 <h4 className="text-[#1B3A6B] font-black text-xs uppercase tracking-[0.25em] mb-10 pb-4 border-b-2 border-gray-50 leading-none">
                    {group.title}
                 </h4>
                 <ul className="space-y-4">
                    {group.links.map((link) => (
                      <li key={link.label}>
                         <Link 
                           href={link.href} 
                           className="group flex items-center justify-between text-gray-500 text-sm font-semibold hover:text-[#CC2229] transition-all"
                         >
                           {link.label}
                           <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#CC2229]" />
                         </Link>
                      </li>
                    ))}
                 </ul>
              </div>
            ))}

            {/* Newsletter Column */}
            <div className="xl:col-span-1 lg:col-span-2">
               <div className="bg-[#1B3A6B]/5 p-8 rounded-3xl border border-[#1B3A6B]/10 relative overflow-hidden group">
                  <h4 className="text-[#1B3A6B] font-black text-xs uppercase tracking-[0.25em] mb-4">Stay ahead</h4>
                  <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">Join 45,000+ top nurses receiving our weekly career insights and job alerts.</p>
                  
                  <form className="relative">
                     <Mail className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#CC2229] transition-colors" size={20} />
                     <input 
                       type="email" 
                       placeholder="Professional email" 
                       className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC2229] transition-all"
                     />
                     <button className="w-full mt-4 bg-[#CC2229] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1B3A6B] hover:shadow-xl hover:shadow-red-500/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                        Subscribe <ArrowUpRight size={16} />
                     </button>
                  </form>
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/50 rounded-full blur-2xl group-hover:bg-[#CC2229]/5 transition-colors pointer-events-none" />
               </div>
            </div>
         </div>

         {/* 3. Integrated Stats & Trust Seals */}
         <div className="mt-24 pt-16 border-t border-gray-50 flex flex-wrap items-center justify-between gap-12">
            <div className="flex flex-wrap items-center gap-12">
               {[
                 { icon: <Globe size={20}/>, label: "Active in 50 states", color: "text-blue-500" },
                 { icon: <Award size={20}/>, label: "SOC-2 Certified Secure", color: "text-green-500" },
                 { icon: <Users size={20}/>, label: "Equal Opportunity Employer", color: "text-orange-500" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className={item.color}>{item.icon}</span>
                    {item.label}
                 </div>
               ))}
            </div>
            <div className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/App_Store_Badge.svg/1200px-App_Store_Badge.svg.png" className="h-8 w-auto" alt="" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/1200px-Google_Play_Store_badge_EN.svg.png" className="h-8 w-auto" alt="" />
            </div>
         </div>
      </div>

      {/* 4. Minimal Legal Copyright Bar */}
      <div className="bg-gray-50/30 border-t border-gray-50 py-8">
         <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <Globe className="text-[#CC2229]" size={16} />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 © {currentYear} America Needs Nurses · Global Recruitment Platform
               </p>
            </div>
            <div className="flex items-center gap-8 grayscale opacity-50">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Visa_2014.svg" className="h-4 w-auto" alt="" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 w-auto" alt="" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_logo_2014.svg" className="h-4 w-auto" alt="" />
            </div>
         </div>
      </div>
    </footer>
  );
}