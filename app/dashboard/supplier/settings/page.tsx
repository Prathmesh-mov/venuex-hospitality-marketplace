'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  LayoutDashboard, CalendarClock, Settings, LogOut, Truck, Loader2, 
  Building2, MapPin, CreditCard, Star, Camera, Navigation 
} from 'lucide-react';

export default function SupplierSettings() {
  const [isMounted, setIsMounted] = useState(false);
  const [businessName, setBusinessName] = useState('');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profile, setProfile] = useState({
    business_name: '', business_type: 'Hotel', contact_person: '', phone: '', email: '',
    address: '', lat: '', lon: '', gst_number: '', description: '', operating_city: '', is_provider: true, 
    is_seeker: false, provider_rating: 5.0, subscription_status: 'Trial (Hackathon Demo)', bank_details: '',
    logo_data: '', cover_data: ''
  });
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('venuex_demo_business') || 'Hospitality Business';
    setBusinessName(savedName);
    fetchProfileData(savedName);
    setIsMounted(true);
  }, []);

  const fetchProfileData = async (supplierName: string) => {
    const { data: profData } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('business_name', supplierName)
      .maybeSingle();

    if (profData) {
      setProfile({
        ...profile,
        ...profData,
        lat: profData.lat !== null && profData.lat !== undefined ? String(profData.lat) : '',
        lon: profData.lon !== null && profData.lon !== undefined ? String(profData.lon) : '',
        contact_person: profData.contact_person || '',
        phone: profData.phone || '',
        email: profData.email || '',
        address: profData.address || '',
        gst_number: profData.gst_number || '',
        description: profData.description || '',
        operating_city: profData.operating_city || '',
        bank_details: profData.bank_details || '',
        logo_data: profData.logo_data || '',
        cover_data: profData.cover_data || ''
      });
    } else {
      setProfile(prev => ({ ...prev, business_name: supplierName }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const latVal = profile.lat !== '' ? parseFloat(profile.lat) : null;
    const lonVal = profile.lon !== '' ? parseFloat(profile.lon) : null;

    const profileDataToSave = {
      ...profile,
      lat: latVal,
      lon: lonVal
    };

    const { data } = await supabase.from('business_profiles').select('id').eq('business_name', businessName).maybeSingle();
    let error;
    if (data) {
      const { error: updateError } = await supabase.from('business_profiles').update(profileDataToSave).eq('id', data.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('business_profiles').insert([profileDataToSave]);
      error = insertError;
    }

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      if (latVal && lonVal) {
        await supabase
          .from('resources')
          .update({ lat: latVal, lon: lonVal })
          .eq('supplier_name', businessName);
      }

      alert("Business Profile & Real Location saved! All your listings are now geolocated.");
      localStorage.setItem('venuex_demo_business', profile.business_name);
      setBusinessName(profile.business_name);
    }
    setIsSavingProfile(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 text-white rounded-lg"><LayoutDashboard className="w-6 h-6" /></div>
          <span className="text-2xl font-bold text-white tracking-tight">venueX</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem href="/dashboard/supplier" icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarItem href="/dashboard/supplier/confirmations" icon={<CalendarClock />} label="Confirmations" />
          <SidebarItem href="/dashboard/supplier/exchanges" icon={<Truck />} label="Active Exchanges" />
          <SidebarItem href="/dashboard/supplier/settings" icon={<Settings />} label="Settings & Profile" active />
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
            <h1 className="text-2xl font-bold text-slate-900">Business Profile Settings</h1>
            <p className="text-sm text-slate-500">Manage your public details and exact operational location.</p>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="relative h-48 bg-slate-100 group">
                  {profile.cover_data ? <img src={profile.cover_data} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100" />}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => coverInputRef.current?.click()} className="flex items-center text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm"><Camera className="w-5 h-5 mr-2" /> Change Cover Image</button>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={e => handleImageUpload(e, (res: string) => setProfile({...profile, cover_data: res}))} />
                </div>
                
                <div className="px-8 pb-8">
                  <div className="relative -mt-12 mb-6 flex justify-between items-end">
                    <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                      <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        {profile.logo_data ? <img src={profile.logo_data} className="w-full h-full object-cover" /> : <Building2 className="w-10 h-10 text-slate-300" />}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageUpload(e, (res: string) => setProfile({...profile, logo_data: res}))} />
                    </div>
                    <div className="flex space-x-3">
                      <span className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200"><Star className="w-4 h-4 mr-1 text-amber-500 fill-amber-500" /> {profile.provider_rating} Rating (Avg)</span>
                      <span className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100">{profile.subscription_status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name *</label>
                      <input required type="text" value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Business Type</label>
                      <select value={profile.business_type} onChange={e => setProfile({...profile, business_type: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900">
                        <option className="text-slate-900">Hotel</option><option className="text-slate-900">Event Venue</option><option className="text-slate-900">Catering Co.</option><option className="text-slate-900">Equipment Rental</option><option className="text-slate-900">Transport</option><option className="text-slate-900">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Business Description</label>
                      <textarea rows={3} value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400" placeholder="Short bio shown on your public profile..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-600" /> Contact & Operations</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Person Name</label>
                    <input type="text" value={profile.contact_person} onChange={e => setProfile({...profile, contact_person: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email (Magic Link Verified)</label>
                    <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (OTP Verified)</label>
                    <div className="flex items-center w-full bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                      <span className="bg-slate-100 text-slate-600 font-bold px-4 py-3 border-r border-slate-200 text-sm select-none">+91</span>
                      <input 
                        type="text" 
                        maxLength={10} 
                        value={profile.phone} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setProfile({...profile, phone: val});
                        }} 
                        className="w-full px-4 py-3 bg-white outline-none text-slate-900" 
                        placeholder="9876543210" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Operating City/Region</label>
                    <input type="text" value={profile.operating_city} onChange={e => setProfile({...profile, operating_city: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400" placeholder="e.g. Mumbai" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Business Address</label>
                    <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400" placeholder="123 Main St, Mumbai" />
                  </div>

                  {/* REAL GPS COORDINATES */}
                  <div className="col-span-2 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-bold text-blue-900 flex items-center">
                        <Navigation className="w-4 h-4 mr-2 text-blue-600" /> Precise Geofencing Coordinates (Lat / Lon)
                      </label>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              async pos => {
                                const newLat = String(pos.coords.latitude);
                                const newLon = String(pos.coords.longitude);

                                setProfile(prev => ({
                                  ...prev, 
                                  lat: newLat, 
                                  lon: newLon
                                }));

                                const { data: existingData } = await supabase
                                  .from('business_profiles')
                                  .select('id')
                                  .eq('business_name', businessName)
                                  .maybeSingle();

                                if (existingData) {
                                  await supabase
                                    .from('business_profiles')
                                    .update({ lat: Number(newLat), lon: Number(newLon) })
                                    .eq('id', existingData.id);
                                } else {
                                  await supabase
                                    .from('business_profiles')
                                    .insert([{ business_name: businessName, lat: Number(newLat), lon: Number(newLon), is_provider: true }]);
                                }

                                await supabase
                                  .from('resources')
                                  .update({ lat: Number(newLat), lon: Number(newLon) })
                                  .eq('supplier_name', businessName);

                                alert(`GPS Auto-Locked & Saved to Database!\nLat: ${newLat}\nLon: ${newLon}`);
                              },
                              err => alert("GPS Error: " + err.message)
                            );
                          } else {
                            alert("Geolocation is not supported by your browser");
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center"
                      >
                        📍 Auto-Detect & Save GPS
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs font-semibold text-slate-600 mb-1">Latitude</span>
                        <input 
                          type="number" 
                          step="any" 
                          value={profile.lat} 
                          onChange={e => setProfile({...profile, lat: e.target.value})} 
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm" 
                          placeholder="e.g. 19.0760" 
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-600 mb-1">Longitude</span>
                        <input 
                          type="number" 
                          step="any" 
                          value={profile.lon} 
                          onChange={e => setProfile({...profile, lon: e.target.value})} 
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm" 
                          placeholder="e.g. 72.8777" 
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">GST / Business Registration No.</label>
                    <input type="text" value={profile.gst_number} onChange={e => setProfile({...profile, gst_number: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400" placeholder="Optional for Hackathon Demo" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center"><CreditCard className="w-4 h-4 mr-1"/> Bank / Payout Details</label>
                    <input type="text" value={profile.bank_details} onChange={e => setProfile({...profile, bank_details: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400" placeholder="Mock prototype (Not real payout rails)" />
                  </div>
                  <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Role Flags</label>
                    <div className="flex space-x-8">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={profile.is_provider} onChange={e => setProfile({...profile, is_provider: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="font-medium text-slate-900">is_provider (Supplier Mode Active)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={profile.is_seeker} onChange={e => setProfile({...profile, is_seeker: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="font-medium text-slate-900">is_seeker (Buyer Mode Active)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center transition-colors">
                  {isSavingProfile && <Loader2 className="w-5 h-5 mr-2 animate-spin" />} Save Business Profile & Location
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ href, icon, label, active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">{icon}<span className="font-semibold">{label}</span></div>
    </Link>
  );
}