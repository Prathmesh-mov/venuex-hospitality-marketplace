'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, CheckCircle2, CreditCard, Sparkles } from 'lucide-react';

export default function SupplierSubscriptionPage() {
  const [isSubscribed, setIsSubscribed] = useState(true);

  const handleRenewSubscription = () => {
    // Trigger Razorpay payment gateway for Provider Subscription Fee
    alert("Redirecting to Razorpay for Provider Platform Subscription renewal...");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Provider Operations & Subscription</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your independent platform listing subscription and secure payout channels.</p>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Provider Tier</span>
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Standard Listing Plan</h3>
            <p className="text-xs text-slate-500 mt-1">Independent subscription fee covering inventory hosting, search indexing, and dispute management tools.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Status: Active</span>
            <span className="text-xs text-green-600 font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
            </span>
          </div>
        </div>

        {/* Subscription Renewal / Payment Card */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/20">Billing Cycle</span>
              <CreditCard className="w-5 h-5 text-purple-300" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white">₹2,999</span>
              <span className="text-xs text-purple-300 font-bold">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Next auto-renewal scheduled via Razorpay in 30 days.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button 
              onClick={handleRenewSubscription}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Manage Subscription & Billing</span>
            </button>
          </div>
        </div>

        {/* Revenue Model Rule Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Direct Payouts</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero Commission Structure</h3>
            <p className="text-xs text-slate-500 mt-1">100% of rental payments and security deposits flow directly between Seeker and Provider. VenueX takes no transaction cuts here[cite: 1].</p>
          </div>
        </div>
      </div>
    </div>
  );
}