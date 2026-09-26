'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { openRazorpayCheckout } from '@/lib/razorpay'; // Import Razorpay payment trigger
import Link from 'next/link';
import { 
  LayoutDashboard, Box, MessageSquare, Settings, 
  LogOut, Plus, Bell, CalendarClock, ShieldCheck, 
  Camera, Truck, CheckCircle, Clock, X, Loader2, 
  Inbox, UploadCloud, Trash2, AlertCircle, Navigation, CreditCard, Star, Building2, MapPin
} from 'lucide-react';

export default function SupplierDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [greeting, setGreeting] = useState('');
  
  // Real Database States
  const [inventory, setInventory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile State for Subscription & Settings Banner
  const [profile, setProfile] = useState({
    subscription_status: 'Trial (Hackathon Demo)',
    provider_rating: 5.0,
    logo_data: ''
  });
  
  // Modal & Form State
  const [showListingModal, setShowListingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [dailyRate, setDailyRate] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  
  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('venuex_demo_business') || 'Hospitality Business';
    setBusinessName(savedName);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchDashboardData(savedName);
    setIsMounted(true);
  }, []);

  const fetchDashboardData = async (supplierName: string) => {
    setIsLoading(true);
    const { data: invData } = await supabase.from('resources').select('*').eq('supplier_name', supplierName).order('created_at', { ascending: false });
    const { data: reqData } = await supabase.from('requests').select('*').eq('supplier_name', supplierName).order('created_at', { ascending: false });
    const { data: profData } = await supabase.from('business_profiles').select('*').eq('business_name', supplierName).maybeSingle();

    if (invData) setInventory(invData);
    if (reqData) setRequests(reqData);
    if (profData) setProfile(prev => ({ ...prev, ...profData }));
    
    setIsLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🚀 PUBLISH LISTING BOUND TO REAL SUPABASE PROFILE COORDINATES
  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: profileData } = await supabase
      .from('business_profiles')
      .select('lat, lon')
      .eq('business_name', businessName)
      .maybeSingle();

    const supplierLat = profileData?.lat ? Number(profileData.lat) : null;
    const supplierLon = profileData?.lon ? Number(profileData.lon) : null;

    if (!supplierLat || !supplierLon) {
      alert("Please update your exact GPS coordinates in 'Settings & Profile' before listing items so geofencing can locate them!");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('resources').insert([{
      supplier_name: businessName,
      name: resourceName,
      category: category,
      daily_rate: Number(dailyRate),
      security_deposit: Number(securityDeposit),
      status: 'Available',
      verified: true,
      image_data: imagePreview,
      lat: supplierLat,
      lon: supplierLon
    }]);

    if (!error) {
      setResourceName('');
      setDailyRate('');
      setSecurityDeposit('');
      setCategory('Furniture');
      setImagePreview(null);
      setShowListingModal(false);
      fetchDashboardData(businessName);
    } else {
      alert("Error saving resource: " + error.message);
    }
    setIsSubmitting(false);
  };

  const handleDeleteResource = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) {
      alert("Error deleting resource: " + error.message);
    } else {
      fetchDashboardData(businessName);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading VenueX...</div>;

  const pendingRequests = requests.filter(r => r.status === 'Pending Review');
  const activeExchanges = requests.filter(r => r.status === 'Approved');
  const totalDepositsHeld = activeExchanges.reduce((sum, req) => sum + Number(req.security_deposit || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SUPPLIER SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 text-white rounded-lg"><LayoutDashboard className="w-6 h-6" /></div>
          <span className="text-2xl font-bold text-white tracking-tight">venueX</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem href="/dashboard/supplier" icon={<LayoutDashboard />} label="Dashboard" active />
          <SidebarItem href="/dashboard/supplier/confirmations" icon={<CalendarClock />} label="Confirmations" badge={pendingRequests.length > 0 ? pendingRequests.length : undefined} />
          <SidebarItem href="/dashboard/supplier/exchanges" icon={<Truck />} label="Active Exchanges" />
          <SidebarItem href="/dashboard/supplier/settings" icon={<Settings />} label="Settings & Profile" />
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase overflow-hidden">
              {profile.logo_data ? <img src={profile.logo_data} className="w-full h-full object-cover" /> : businessName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{businessName}</p>
              <p className="text-xs text-slate-400 capitalize">Supplier Account</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /><span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{greeting}, {businessName}</h1>
            <p className="text-sm text-slate-500">Manage listings, verify inventory, and track active exchanges.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {pendingRequests.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-100"></span>}
            </button>
            <button onClick={() => setShowListingModal(true)} className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">
              <Plus className="w-4 h-4" /><span>List Spare Resource</span>
            </button>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* ESCROW & METRICS BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/10 rounded-lg"><ShieldCheck className="w-6 h-6 text-cyan-400" /></div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full text-cyan-100">Secured</span>
                </div>
                <div>
                  <p className="text-sm text-blue-200 font-medium mb-1">Deposits Held in Escrow</p>
                  <p className="text-3xl font-black">₹{totalDepositsHeld.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg"><Truck className="w-6 h-6 text-blue-600" /></div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Active Rentals</p>
                  <p className="text-3xl font-black text-slate-900">{activeExchanges.length}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 rounded-lg"><AlertCircle className="w-6 h-6 text-amber-600" /></div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Returns Due Today</p>
                  <p className="text-3xl font-black text-slate-900">0</p>
                </div>
              </div>
            </div>

            {/* 🚀 RAZORPAY SUBSCRIPTION & UPGRADE BANNER FOR SUPPLIERS */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-base">Subscription Status: <span className="text-blue-600">{profile.subscription_status}</span></h4>
                  <p className="text-sm text-blue-700">Upgrade to Pro Supplier via Razorpay to unlock zero commission and verified badge priority.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  openRazorpayCheckout({
                    amount: 2999, // ₹2,999 platform subscription
                    name: businessName,
                    description: "venueX Supplier Pro Subscription Fee",
                    onSuccess: async (paymentId) => {
                      const { error } = await supabase
                        .from('business_profiles')
                        .update({ subscription_status: 'Pro Verified (Active)' })
                        .eq('business_name', businessName);

                      if (!error) {
                        setProfile(prev => ({ ...prev, subscription_status: 'Pro Verified (Active)' }));
                        alert(`Payment Successful! (Ref: ${paymentId})\nYour supplier account has been upgraded to Pro.`);
                      } else {
                        alert("Error updating subscription: " + error.message);
                      }
                    }
                  });
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                Upgrade via Razorpay (₹2,999)
              </button>
            </div>

            {/* ALERT FOR PENDING REQUESTS */}
            {pendingRequests.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Action Required</h3>
                    <p className="text-blue-700 text-sm">You have {pendingRequests.length} pending booking request(s) waiting for your approval.</p>
                  </div>
                </div>
                <Link href="/dashboard/supplier/confirmations">
                  <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Review Confirmations</button>
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* INVENTORY LIST */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900">Your Verified Inventory</h2>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{inventory.length} Total</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {isLoading ? (
                     <div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                  ) : inventory.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Box className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p>You have not listed any resources yet.</p>
                      <button onClick={() => setShowListingModal(true)} className="mt-4 text-blue-600 font-semibold hover:underline">Create your first listing</button>
                    </div>
                  ) : (
                    inventory.map((item) => (
                      <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center space-x-5">
                          <div className="w-16 h-16 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-200">
                            {item.image_data ? (
                              <img src={item.image_data} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <Camera className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 flex items-center text-lg">
                              {item.name} {item.verified && <ShieldCheck className="w-4 h-4 ml-2 text-green-500" />}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">{item.category} • <span className="font-medium text-slate-700">₹{item.daily_rate}/day</span></p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.status}
                          </span>
                          <button 
                            onClick={() => handleDeleteResource(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ACTIVE EXCHANGES TRACKER SUMMARY */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center"><Truck className="w-5 h-5 mr-2 text-blue-600" /> Active Exchanges</h3>
                    <Link href="/dashboard/supplier/exchanges" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
                  </div>
                  {activeExchanges.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No active deliveries right now.</p>
                  ) : (
                    <div className="space-y-6">
                      {activeExchanges.slice(0, 3).map(exchange => (
                        <div key={exchange.id} className="relative pl-6 border-l-2 border-blue-200">
                          <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-600 rounded-full"></div>
                          <p className="text-sm font-bold text-slate-900">{exchange.resource_name}</p>
                          <p className="text-xs text-slate-500">In use by {exchange.buyer_name}</p>
                        </div>
                      ))}
                      {activeExchanges.length > 3 && (
                        <p className="text-xs text-slate-400 font-semibold pt-2 text-center">+ {activeExchanges.length - 3} more active</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* LISTING MODAL */}
      <AnimatePresence>
        {showListingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form onSubmit={handlePublishListing} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-900">List & Verify New Resource</h2>
                <button type="button" onClick={() => setShowListingModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Resource Photo (Authentic Verification)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${imagePreview ? 'border-blue-500 bg-black' : 'border-slate-300 hover:border-blue-400 bg-slate-50'}`}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain opacity-80" />
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-600">Click to upload image</p>
                        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, JPG</p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Resource Name</label>
                    <input type="text" required value={resourceName} onChange={e => setResourceName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white placeholder-slate-400" placeholder="e.g. 50x Foldable Tables" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                    <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white">
                      <option className="text-slate-900">Furniture</option>
                      <option className="text-slate-900">Audio/Visual</option>
                      <option className="text-slate-900">Kitchenware</option>
                      <option className="text-slate-900">Decor</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Daily Rate (₹)</label>
                    <input type="number" required value={dailyRate} onChange={e => setDailyRate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white placeholder-slate-400" placeholder="1000" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
                    <input type="number" required value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white placeholder-slate-400" placeholder="5000" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 sticky bottom-0">
                <button type="button" onClick={() => setShowListingModal(false)} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center shadow-sm transition-colors">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Publish Real Listing
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ href, icon, label, active = false, badge }: any) {
  return (
    <Link 
      href={href} 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      {badge && (
        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}