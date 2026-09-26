'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function SeekerSubscriptionPage() {
  const [tokenBalance, setTokenBalance] = useState(125); // Default 125 D.T. bundle per cycle
  const [isProActive, setIsProActive] = useState(true);

  const handleTopUpTokens = () => {
    // Trigger Razorpay or mock top-up for Extra D.T.
    setTokenBalance(prev => prev + 25);
    alert("Successfully purchased 25 Extra Delivery Tokens (D.T.) top-up!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seeker Membership & Delivery Tokens</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your recurring subscription, delivery token balance, and logistics usage.</p>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Seeker Tier</span>
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Standard Seeker Plan</h3>
            <p className="text-xs text-slate-500 mt-1">Includes 125 Delivery Tokens (D.T.) per billing cycle for managed logistics.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Active</span>
            <span className="text-xs text-green-600 font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
            </span>
          </div>
        </div>

        {/* Token Balance Card */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">Logistics Wallet</span>
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{tokenBalance}</span>
              <span className="text-sm text-cyan-400 font-bold">D.T. Remaining</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Consumed automatically when VenueX arranges delivery via Porter.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button 
              onClick={handleTopUpTokens}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buy Extra D.T. Top-Up</span>
            </button>
          </div>
        </div>

        {/* Delivery Margin & Model Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Model Info</span>
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero Commission Policy</h3>
            <p className="text-xs text-slate-500 mt-1">100% of rental payments and security deposits flow directly between Seeker and Provider. Revenue is driven strictly via subscriptions and delivery margins[cite: 1].</p>
          </div>
        </div>
      </div>
    </div>
  );
}