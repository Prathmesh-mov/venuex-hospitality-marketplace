'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { 
  Building2, Mail, KeyRound, ArrowRight, Loader2, 
  Store, Camera, CalendarClock, ShieldCheck, Truck
} from 'lucide-react';

export default function VenueXAuth() {
  const [role, setRole] = useState<'supplier' | 'buyer'>('supplier');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. GENERATE, SAVE, AND MOCK OTP (Bypassing Gmail entirely)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Generate a random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Insert the OTP into your custom Supabase table
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .insert([{ email, otp: generatedOtp }]);

    if (dbError) {
      setError(dbError.message);
      setIsLoading(false);
      return;
    }

    // 🚀 HACKATHON DEMO BYPASS: Show it directly on screen instead of fighting Gmail
    console.log(`🔑 DEMO OTP FOR ${email}:`, generatedOtp);
    alert(`Hackathon Demo Mode\n\nYour OTP is: ${generatedOtp}\n\n(This bypasses Google's email block so you can keep building)`);

    setStep('otp');
    setIsLoading(false);
  };

  // 2. VERIFY CUSTOM OTP & AUTO-FETCH EXISTING DATA
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if the email and OTP exist in your custom table
    const { data, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !data || data.length === 0) {
      setError("Invalid or expired OTP. Please try again.");
      setIsLoading(false);
      return;
    }

    // 🚀 NEW: AUTO-FETCH EXISTING USER DATA
    let finalBusinessName = businessName;
    
    // Check if this email already has a saved profile in the database
    const { data: existingProfile } = await supabase
      .from('business_profiles')
      .select('business_name')
      .eq('email', email)
      .limit(1)
      .single();

    if (existingProfile && existingProfile.business_name) {
      // If found, override what they typed with their exact database name
      // This guarantees ALL their inventory, requests, and settings load perfectly.
      finalBusinessName = existingProfile.business_name;
    }

    // Success! Save user data to localStorage for the dashboard and redirect based on role
    localStorage.setItem('venuex_demo_role', role);
    localStorage.setItem('venuex_demo_business', finalBusinessName || 'My Business');
    localStorage.setItem('venuex_demo_email', email);
    
    window.location.href = role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans overflow-hidden">
      
      {/* Left Panel - Animated Brand Identity */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-slate-900 z-0" />
        <div className="relative z-10 w-full max-w-lg text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-cyan-400 rounded-2xl shadow-2xl">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">venueX</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            The B2B Resource Marketplace.
          </h2>
          <p className="text-slate-300 text-lg mb-12">
            Connect banquet halls, hotels, and event venues to securely exchange idle hospitality inventory.
          </p>
        </div>
      </div>

      {/* Right Panel - Custom OTP Flow */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white z-10 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] relative">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                
                <div className="flex rounded-xl bg-slate-100 p-1.5 mb-10 border border-slate-200">
                  <button type="button" onClick={() => setRole('supplier')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 ${role === 'supplier' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Store className="w-4 h-4" /> Supplier
                  </button>
                  <button type="button" onClick={() => setRole('buyer')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 ${role === 'buyer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Truck className="w-4 h-4" /> Buyer
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {role === 'supplier' ? 'List your resources.' : 'Find spare resources.'}
                  </h2>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Business Name</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Store className="h-5 w-5" />
                      </div>
                      <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="e.g. Grand Horizon Banquets" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Official Email</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="contact@hotel.com" />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                  <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20">
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Send OTP'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Verify Identity</h2>
                  <p className="text-slate-500 mt-2">Enter the 6-digit code for {email}</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-3xl tracking-[0.5em] font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="••••••" />
                  
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                  <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full py-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl">
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Confirm & Enter Marketplace'}
                  </button>
                  <button type="button" onClick={() => setStep('form')} className="w-full py-4 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">
                    Go Back
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}