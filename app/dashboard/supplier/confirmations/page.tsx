'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  LayoutDashboard, CalendarClock, Settings, LogOut, Truck, Loader2, 
  MessageSquare, CheckCircle, Clock, XCircle, Inbox, Store
} from 'lucide-react';

export default function SupplierConfirmations() {
  const [isMounted, setIsMounted] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem('venuex_demo_business') || 'Hospitality Business';
    setBusinessName(savedName);
    fetchRequests(savedName);
    setIsMounted(true);
  }, []);

  const fetchRequests = async (supplierName: string) => {
    setIsLoading(true);
    const { data: reqData } = await supabase
      .from('requests')
      .select('*')
      .eq('supplier_name', supplierName)
      .order('created_at', { ascending: false });

    if (reqData) setRequests(reqData);
    setIsLoading(false);
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('requests').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Error updating request: " + error.message);
    } else {
      fetchRequests(businessName);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Confirmations...</div>;

  const pendingRequests = requests.filter(r => r.status === 'Pending Review');
  const pastRequests = requests.filter(r => r.status !== 'Pending Review');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SUPPLIER SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 text-white rounded-lg"><LayoutDashboard className="w-6 h-6" /></div>
          <span className="text-2xl font-bold text-white tracking-tight">venueX</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard/supplier"><SidebarItem icon={<LayoutDashboard />} label="Dashboard" /></Link>
          <Link href="/dashboard/supplier/confirmations"><SidebarItem icon={<CalendarClock />} label="Confirmations" active badge={pendingRequests.length > 0 ? pendingRequests.length : undefined} /></Link>
          <Link href="/dashboard/supplier"><SidebarItem icon={<Truck />} label="Active Exchanges" /></Link>
          <Link href="/dashboard/supplier/settings"><SidebarItem icon={<Settings />} label="Settings & Profile" /></Link>
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
            <h1 className="text-2xl font-bold text-slate-900">Booking Confirmations</h1>
            <p className="text-sm text-slate-500">Review, approve, or decline incoming requests from buyers.</p>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10">
            
            {/* ACTION REQUIRED: PENDING REQUESTS */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-blue-600" /> Action Required ({pendingRequests.length})
              </h2>
              
              {isLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : pendingRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <Inbox className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
                  <p className="text-slate-500">No pending booking requests at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-slate-100 flex-1">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-bold text-slate-900 text-xl">{req.buyer_name}</h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center"><Store className="w-4 h-4 mr-1.5" /> Wants to rent: <strong className="text-slate-700 ml-1">{req.resource_name}</strong></p>
                          </div>
                          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 mb-2">
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Rental Total</p>
                            <p className="font-black text-blue-600 text-lg">₹{req.proposed_price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Security Deposit</p>
                            <p className="font-semibold text-slate-700 text-lg">₹{req.security_deposit}</p>
                          </div>
                          <div className="col-span-2 pt-3 border-t border-slate-200 mt-1">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Requested Dates & Duration</p>
                            <p className="font-semibold text-slate-900">{req.duration}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50 flex space-x-3 border-t border-slate-100">
                        <button 
                          onClick={() => updateRequestStatus(req.id, 'Declined')} 
                          className="flex-1 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 py-3 rounded-xl text-sm font-bold flex justify-center items-center transition-all"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Decline
                        </button>
                        <button 
                          onClick={() => updateRequestStatus(req.id, 'Approved')} 
                          className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center transition-all shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve & Confirm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* HISTORY: PAST CONFIRMATIONS */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <CalendarClock className="w-6 h-6 mr-2 text-slate-600" /> Recent Activity
              </h2>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {pastRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium">No past booking activity yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pastRequests.map(req => (
                      <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-slate-900">{req.resource_name}</h4>
                          <p className="text-sm text-slate-500">Requested by <span className="font-semibold text-slate-700">{req.buyer_name}</span> for {req.duration}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right hidden sm:block">
                            <p className="font-bold text-slate-900">₹{req.proposed_price}</p>
                            <p className="text-xs text-slate-400">Total Price</p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold w-24 text-center ${
                            req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </motion.div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, badge }: any) {
  return (
    <div className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center space-x-3">{icon}<span className="font-semibold">{label}</span></div>
      {badge && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}