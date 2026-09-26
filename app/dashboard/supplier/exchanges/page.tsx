'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  LayoutDashboard, CalendarClock, Settings, LogOut, Truck, Loader2, 
  MapPin, Phone, ShieldCheck, CheckCircle, PackageCheck, AlertCircle
} from 'lucide-react';

export default function SupplierExchanges() {
  const [isMounted, setIsMounted] = useState(false);
  const [businessName, setBusinessName] = useState('');
  
  // Data States
  const [activeExchanges, setActiveExchanges] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem('venuex_demo_business') || 'Hospitality Business';
    setBusinessName(savedName);
    fetchExchangesData(savedName);
    setIsMounted(true);
  }, []);

  const fetchExchangesData = async (supplierName: string) => {
    setIsLoading(true);
    
    // Fetch Approved (Active) Requests
    const { data: activeData } = await supabase
      .from('requests')
      .select('*')
      .eq('supplier_name', supplierName)
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });

    // Fetch Pending count for the sidebar badge
    const { count } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_name', supplierName)
      .eq('status', 'Pending Review');

    if (activeData) setActiveExchanges(activeData);
    if (count !== null) setPendingCount(count);
    
    setIsLoading(false);
  };

  const handleMarkReturned = async (id: string) => {
    const confirmReturn = window.confirm("Has the resource been returned in good condition? This will close the exchange and release the security deposit.");
    if (!confirmReturn) return;

    const { error } = await supabase.from('requests').update({ status: 'Completed' }).eq('id', id);
    if (error) {
      alert("Error updating exchange: " + error.message);
    } else {
      fetchExchangesData(businessName);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Exchanges...</div>;

  // Calculate total money currently held in escrow/deposits
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
          <SidebarItem href="/dashboard/supplier" icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarItem href="/dashboard/supplier/confirmations" icon={<CalendarClock />} label="Confirmations" badge={pendingCount > 0 ? pendingCount : undefined} />
          <SidebarItem href="/dashboard/supplier/exchanges" icon={<Truck />} label="Active Exchanges" active />
          <SidebarItem href="/dashboard/supplier/settings" icon={<Settings />} label="Settings & Profile" />
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase overflow-hidden">
              {businessName.charAt(0)}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Active Exchanges</h1>
            <p className="text-sm text-slate-500">Track logistics, monitor resources in use, and manage returns.</p>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
            
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

            {/* ACTIVE EXCHANGES LIST */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Current Logistics Overview</h2>
              </div>
              
              {isLoading ? (
                <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : activeExchanges.length === 0 ? (
                <div className="p-16 text-center">
                  <PackageCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No active exchanges</h3>
                  <p className="text-slate-500">All your inventory is currently in the warehouse.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeExchanges.map(req => (
                    <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Left: Resource & Buyer Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                            <Truck className="w-3.5 h-3.5 mr-1" /> In Use
                          </span>
                          <p className="text-sm font-semibold text-slate-500">{req.duration}</p>
                        </div>
                        <h3 className="font-bold text-slate-900 text-xl mb-1">{req.resource_name}</h3>
                        <p className="text-sm text-slate-600 font-medium flex items-center">
                          Rented by: <span className="font-bold text-slate-900 ml-1">{req.buyer_name}</span>
                        </p>
                      </div>

                      {/* Middle: Financials */}
                      <div className="flex space-x-8 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Rental Revenue</p>
                          <p className="font-black text-blue-600">₹{req.proposed_price}</p>
                        </div>
                        <div className="border-l border-slate-200 pl-8">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Deposit Held</p>
                          <p className="font-semibold text-slate-700">₹{req.security_deposit}</p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col space-y-3 lg:w-48">
                        <button className="w-full bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center transition-all">
                          <Phone className="w-4 h-4 mr-2" /> Contact Buyer
                        </button>
                        <button 
                          onClick={() => handleMarkReturned(req.id)}
                          className="w-full bg-slate-900 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold flex justify-center items-center transition-all shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark as Returned
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Link Component
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