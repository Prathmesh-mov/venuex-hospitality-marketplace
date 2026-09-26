'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Box, ShoppingBag, MessageSquare, Settings, 
  LogOut, Plus, Search, MapPin, Bell, CalendarClock, ShieldCheck, Camera
} from 'lucide-react';

export default function VenueXDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState<'supplier' | 'buyer'>('buyer');
  const [businessName, setBusinessName] = useState('Hospitality Business');

  // Load the user data from our Hackathon Bypass / LocalStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('venuex_demo_role') as 'supplier' | 'buyer';
    const savedName = localStorage.getItem('venuex_demo_business');
    
    if (savedRole) setRole(savedRole);
    if (savedName) setBusinessName(savedName);
    
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Don't render until client side to prevent hydration errors
  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading VenueX...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">venueX</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active />
          {role === 'supplier' ? (
            <>
              <SidebarItem icon={<Box />} label="My Inventory" />
              <SidebarItem icon={<CalendarClock />} label="Bookings" />
            </>
          ) : (
            <>
              <SidebarItem icon={<Search />} label="Discover Resources" />
              <SidebarItem icon={<ShoppingBag />} label="My Rentals" />
            </>
          )}
          <SidebarItem icon={<MessageSquare />} label="Messages" badge="2" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase">
              {businessName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{businessName}</p>
              <p className="text-xs text-slate-400 capitalize">{role} Account</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {businessName}</h1>
            <p className="text-sm text-slate-500">
              {role === 'supplier' ? 'Manage your idle hospitality assets.' : 'Find the resources you need for your next event.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-100"></span>
            </button>
            {role === 'supplier' && (
              <button className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                <span>List Resource</span>
              </button>
            )}
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-8 flex-1 overflow-y-auto">
          {role === 'supplier' ? <SupplierView /> : <BuyerView />}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUPPLIER UI: Managing Inventory & Requests                                 */
/* -------------------------------------------------------------------------- */
function SupplierView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Active Listings" value="12" subtitle="+2 added this week" color="blue" />
        <MetricCard title="Resources in Use" value="4" subtitle="Generating revenue right now" color="green" />
        <MetricCard title="Pending Requests" value="3" subtitle="Require your approval" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Inventory</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { name: 'Premium Banquet Chairs', qty: '200 units', status: 'Available', price: '₹50/day' },
              { name: 'JBL Line Array Sound System', qty: '1 set', status: 'Booked', price: '₹5000/day' },
              { name: 'Buffet Chafing Dishes', qty: '15 units', status: 'Available', price: '₹200/day' },
            ].map((item, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.qty} • {item.price}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Verification Banner (Matches PDF Specs) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg">
            <ShieldCheck className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Security Deposits Active</h3>
            <p className="text-sm text-slate-300 mb-4">All your high-value exchanges are protected by condition-based security deposits.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors">
              Manage Deposits
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* BUYER UI: Discovering & Booking Resources                                  */
/* -------------------------------------------------------------------------- */
function BuyerView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="pl-4 text-slate-400"><Search className="w-6 h-6" /></div>
        <input 
          type="text" 
          placeholder="Search for chairs, sound systems, furniture, equipment..." 
          className="flex-1 py-4 px-4 bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium"
        />
        <div className="hidden md:flex items-center px-4 border-l border-slate-200 text-slate-400">
          <MapPin className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Navi Mumbai</span>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors ml-2">
          Search
        </button>
      </div>

      {/* Quick Categories */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Popular Categories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {['Banquet Chairs', 'Sound Systems', 'Event Furniture', 'Kitchen Equipment', 'Decor'].map((cat, i) => (
            <button key={i} className="px-6 py-3 bg-white border border-slate-200 rounded-xl whitespace-nowrap text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Marketplace Feed */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Available Near You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ResourceCard 
            title="Tiffany Banquet Chairs (Gold)" 
            supplier="Grand Horizon Banquets" 
            price="₹40" 
            unit="per chair/day"
            available="150 units" 
            image="bg-amber-100" 
          />
          <ResourceCard 
            title="Yamaha Professional Audio Setup" 
            supplier="Beats & Events Co." 
            price="₹4,500" 
            unit="per day"
            available="1 set" 
            image="bg-slate-200" 
          />
          <ResourceCard 
            title="Round Dining Tables (8-seater)" 
            supplier="Royal Catering Services" 
            price="₹250" 
            unit="per table/day"
            available="20 units" 
            image="bg-blue-50" 
          />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* REUSABLE UI COMPONENTS                                                     */
/* -------------------------------------------------------------------------- */
function SidebarItem({ icon, label, active = false, badge }: any) {
  return (
    <a href="#" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      {badge && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </a>
  );
}

function MetricCard({ title, value, subtitle, color }: any) {
  const colorMaps: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-slate-500 font-medium mb-4">{title}</h3>
      <div className="flex items-baseline space-x-3">
        <span className="text-4xl font-extrabold text-slate-900">{value}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${colorMaps[color]}`}>{subtitle}</span>
      </div>
    </div>
  );
}

function ResourceCard({ title, supplier, price, unit, available, image }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Placeholder for Authentic Resource Photo */}
      <div className={`h-48 w-full ${image} flex items-center justify-center relative overflow-hidden`}>
        <Camera className="w-8 h-8 text-slate-400 opacity-50" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-800 flex items-center">
          <ShieldCheck className="w-3 h-3 text-green-500 mr-1" /> Verified Photos
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 flex items-center"><Store className="w-3 h-3 mr-1" /> {supplier}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Available</p>
            <p className="font-semibold text-slate-700">{available}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-600">{price}</p>
            <p className="text-xs text-slate-400">{unit}</p>
          </div>
        </div>
        <button className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors">
          Check Availability Calendar
        </button>
      </div>
    </div>
  );
}