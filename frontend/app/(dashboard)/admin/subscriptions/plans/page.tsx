"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Save, Trash2, Check, X, AlertCircle, Loader2, DollarSign, Briefcase, Star, Info, Edit3 } from "lucide-react";
import { getAdminPlans, updateSubscriptionPlan, createSubscriptionPlan, deleteSubscriptionPlan } from "@/app/utils/api";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

export default function TierManagementPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = async (autoSeed = false) => {
    try {
      const data = await getAdminPlans();
      setPlans(data);
      if (data.length === 0 && autoSeed) {
        // Automatically seed if empty on first load to match price page
        const defaults = [
          { name: "Basic", price: "29", billingCycle: "MONTHLY", jobsLimit: 1, features: "1 Active Job Posting, Company Directory Listing, Basic Analytics Dashboard, Email Support, 30-Day Job Visibility", isActive: true, isPopular: false, headerStyle: "basic", buttonLabel: "Get Started", buttonStyle: "outline" },
          { name: "Silver", price: "40", billingCycle: "MONTHLY", jobsLimit: 10, features: "10 Active Job Postings, Featured Company Listing, Advanced Analytics & Reports, Resume Database Access, Priority Email Support, 60-Day Job Visibility, Newsletter Sponsorship Slot", isActive: true, isPopular: true, badge: "Most Popular", headerStyle: "red", buttonLabel: "Get Started", buttonStyle: "solid" },
          { name: "Gold", price: "120", billingCycle: "MONTHLY", jobsLimit: 999, features: "Unlimited Job Postings, Top-Featured Listing, Full Analytics Suite, Dedicated Newsletter Campaign, Dedicated Account Manager, 90-Day Job Visibility, Bulk Nurse Import Tools", isActive: true, isPopular: false, badge: "Enterprise", headerStyle: "navy", buttonLabel: "Contact Sales", buttonStyle: "navy-solid" }
        ];
        for (const plan of defaults) {
          const formattedPlan = {
            ...plan,
            features: plan.features.split(",").map(f => f.trim()).filter(f => f !== "")
          };
          await createSubscriptionPlan(formattedPlan);
        }
        const freshData = await getAdminPlans();
        setPlans(freshData);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(true);
  }, []);

  const seedDefaults = async () => {
    if (!confirm("This will add the 3 default tiers (Basic, Silver, Gold) to your management list. Continue?")) return;
    setLoading(true);
    try {
      const defaults = [
        { name: "Basic", price: "29", billingCycle: "MONTHLY", jobsLimit: 1, features: "1 Active Job Posting, Company Directory Listing, Basic Analytics Dashboard, Email Support, 30-Day Job Visibility", isActive: true, isPopular: false, headerStyle: "basic", buttonLabel: "Get Started", buttonStyle: "outline" },
        { name: "Silver", price: "40", billingCycle: "MONTHLY", jobsLimit: 10, features: "10 Active Job Postings, Featured Company Listing, Advanced Analytics & Reports, Resume Database Access, Priority Email Support, 60-Day Job Visibility, Newsletter Sponsorship Slot", isActive: true, isPopular: true, badge: "Most Popular", headerStyle: "red", buttonLabel: "Get Started", buttonStyle: "solid" },
        { name: "Gold", price: "120", billingCycle: "MONTHLY", jobsLimit: 999, features: "Unlimited Job Postings, Top-Featured Listing, Full Analytics Suite, Dedicated Newsletter Campaign, Dedicated Account Manager, 90-Day Job Visibility, Bulk Nurse Import Tools", isActive: true, isPopular: false, badge: "Enterprise", headerStyle: "navy", buttonLabel: "Contact Sales", buttonStyle: "navy-solid" }
      ];
      for (const plan of defaults) {
        const formattedPlan = {
          ...plan,
          features: plan.features.split(",").map(f => f.trim()).filter(f => f !== "")
        };
        console.log("Seeding plan:", formattedPlan);
        await createSubscriptionPlan(formattedPlan);
      }
      await fetchPlans();
      setStatusMsg({ type: 'success', text: "Default tiers seeded successfully." });
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to seed default tiers." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletePlanId(id);
  };

  const confirmDeletePlan = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteSubscriptionPlan(id);
      setStatusMsg({ type: 'success', text: "Plan deleted successfully." });
      setDeletePlanId(null);
      fetchPlans();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to delete plan." });
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (plan: any) => {
    setEditingId(plan.id);
    setEditForm({ 
      ...plan, 
      features: plan.features.join(", "),
      badge: plan.badge || "",
      headerStyle: plan.headerStyle || "basic",
      buttonLabel: plan.buttonLabel || "Get Started",
      buttonStyle: plan.buttonStyle || "outline"
    });
  };

  const handleSave = async () => {
    try {
      setStatusMsg(null);
      const dataToSave = {
        ...editForm,
        features: editForm.features.split(",").map((f: string) => f.trim()).filter((f: string) => f !== ""),
      };
      
      if (editingId === 'new') {
        await createSubscriptionPlan(dataToSave);
      } else {
        await updateSubscriptionPlan(editingId!, dataToSave);
      }
      
      setStatusMsg({ type: 'success', text: "Plan saved successfully." });
      setEditingId(null);
      fetchPlans();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to save plan." });
    }
  };

  const addNewPlan = () => {
    setEditingId('new');
    setEditForm({
      name: "New Tier",
      price: "0",
      billingCycle: "MONTHLY",
      jobsLimit: 5,
      features: "Feature 1, Feature 2",
      isPopular: false,
      isActive: true,
      badge: "",
      headerStyle: "basic",
      buttonLabel: "Get Started",
      buttonStyle: "outline"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-[#002868]" />
      </div>
    );
  }

  return (
    <div className="tier-management">
      <style jsx global>{`
        .luxury-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .luxury-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 40, 104, 0.1);
        }
        .luxury-header-basic { background: linear-gradient(135deg, #0d1b3e 0%, #1e3a8a 100%); }
        .luxury-header-red { background: linear-gradient(135deg, #C8102E 0%, #990c23 100%); }
        .luxury-header-navy { background: linear-gradient(135deg, #002868 0%, #001a4d 100%); }
      `}</style>

      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#002868] tracking-tight">Subscription Tiers</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your platform's pricing plans and service limits.</p>
        </div>
        <div className="flex gap-4">
          {plans.length === 0 && (
            <button 
              onClick={seedDefaults}
              className="bg-blue-50 hover:bg-blue-100 text-[#002868] px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all border border-blue-100"
            >
              <Layers size={20} />
              Seed Tiers from Pricing
            </button>
          )}
          <button 
            onClick={addNewPlan}
            className="bg-[#C8102E] hover:bg-[#a50d26] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg transform hover:scale-[1.02]"
          >
            <Plus size={20} />
            Create New Tier
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`mb-8 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          <div className={`p-2 rounded-full ${statusMsg.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            {statusMsg.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
          </div>
          <span className="font-bold text-lg">{statusMsg.text}</span>
        </div>
      )}

      {plans.length === 0 && !editingId && (
        <div className="bg-white rounded-[3rem] p-20 border-4 border-dashed border-gray-100 text-center">
            <div className="w-24 h-24 bg-blue-50 text-[#002868] rounded-full flex items-center justify-center mx-auto mb-8">
                <Layers size={48} />
            </div>
            <h2 className="text-3xl font-black text-[#002868] mb-4">No tiers found in database</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">Your subscription management list is currently empty. Click the button below to automatically add the standard tiers from the pricing page.</p>
            <button 
                onClick={seedDefaults}
                className="bg-[#002868] text-white px-12 py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-[#001f52] transition-all transform hover:scale-105"
              >
                Populate with Pricing Tiers
              </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        {plans.map((plan) => (
          <div key={plan.id} className={`luxury-card bg-white rounded-[2.5rem] overflow-hidden border-2 shadow-2xl relative ${editingId === plan.id ? 'border-[#002868] ring-8 ring-blue-50 z-20' : 'border-gray-50'}`}>
            {editingId === plan.id ? (
              <div className="p-10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-50 text-[#002868] rounded-2xl flex items-center justify-center">
                        <Edit3 size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-[#002868]">Edit Configuration</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Tier Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-[#002868] outline-none border border-gray-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Badge</label>
                    <input type="text" value={editForm.badge} onChange={(e) => setEditForm({...editForm, badge: e.target.value})} placeholder="e.g. Enterprise" className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-[#002868] outline-none border border-gray-100" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Price ($)</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-[#002868] outline-none border border-gray-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Jobs Limit</label>
                    <input type="number" value={editForm.jobsLimit} onChange={(e) => setEditForm({...editForm, jobsLimit: parseInt(e.target.value)})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-[#002868] outline-none border border-gray-100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Header Style</label>
                    <select value={editForm.headerStyle} onChange={(e) => setEditForm({...editForm, headerStyle: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-[#002868] outline-none border border-gray-100 appearance-none">
                      <option value="basic">Basic (Blue)</option>
                      <option value="red">Silver (Red)</option>
                      <option value="navy">Gold (Navy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Button Style</label>
                    <select value={editForm.buttonStyle} onChange={(e) => setEditForm({...editForm, buttonStyle: e.target.value})} className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-bold text-[#002868] outline-none border border-gray-100 appearance-none">
                      <option value="outline">Outline Blue</option>
                      <option value="solid">Solid Red</option>
                      <option value="navy-solid">Solid Navy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Features (comma separated)</label>
                  <textarea value={editForm.features} onChange={(e) => setEditForm({...editForm, features: e.target.value})} rows={3} className="w-full bg-gray-50 px-6 py-4 rounded-2xl font-medium text-sm text-[#002868] outline-none border border-gray-100" />
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <button onClick={handleSave} className="flex-1 bg-[#002868] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                    <Save size={18} /> Save Plan
                  </button>
                  <button onClick={() => setEditingId(null)} className="w-20 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl flex items-center justify-center transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className={`p-10 text-center relative luxury-header-${plan.headerStyle || 'basic'}`}>
                  {plan.badge && (
                    <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] border border-white/20">
                      {plan.badge}
                    </div>
                  )}
                  <div className="text-white/60 font-black uppercase tracking-[0.3em] text-[11px] mb-4">{plan.name}</div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-white/40 text-2xl font-bold">$</span>
                    <span className="text-6xl font-black text-white">{plan.price}</span>
                  </div>
                  <div className="text-white/50 font-bold text-xs uppercase tracking-widest">per month</div>
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 bg-white text-[#C8102E] rounded-xl flex items-center justify-center shadow-sm">
                            <Briefcase size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Usage Limit</div>
                            <div className="text-[#002868] font-black">{plan.jobsLimit} Active Postings</div>
                        </div>
                    </div>
                    {plan.features.slice(0, 5).map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-sm font-bold text-gray-600 pl-2">
                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                    {plan.features.length > 5 && (
                        <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest pl-2">
                            + {plan.features.length - 5} more features
                        </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button onClick={() => startEditing(plan)} className="px-6 py-3 bg-[#002868] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#001f52] transition-all shadow-md">
                            Configure
                        </button>
                        <button onClick={() => handleDelete(plan.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all border border-red-100">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${plan.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${plan.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                        {plan.isActive ? 'Active' : 'Paused'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {editingId === 'new' && (
          <div className="bg-white rounded-[2.5rem] p-10 border-4 border-dashed border-gray-100 flex flex-col items-center justify-center min-h-[500px] shadow-sm">
             <div className="w-full space-y-6">
                <div className="w-20 h-20 bg-red-50 text-[#C8102E] rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={40} />
                </div>
                <h3 className="text-center font-black text-[#002868] text-xl uppercase tracking-[0.2em] mb-8">New Tier Configuration</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Tier Name (e.g. Platinum)" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold" />
                  <input type="number" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold" />
                  <textarea placeholder="Features (comma separated)" value={editForm.features} onChange={(e) => setEditForm({...editForm, features: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-medium" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSave} className="flex-1 bg-[#C8102E] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                    Create Tier
                  </button>
                  <button onClick={() => setEditingId(null)} className="w-20 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center">
                    <X size={24} />
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .tier-management { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ConfirmDeleteModal
        isOpen={!!deletePlanId}
        onClose={() => setDeletePlanId(null)}
        onConfirm={() => deletePlanId && confirmDeletePlan(deletePlanId)}
        title="Delete Subscription Plan?"
        message="This will permanently remove this pricing tier. Existing subscribers will not be affected."
        isLoading={isDeleting}
      />
    </div>
  );
}
