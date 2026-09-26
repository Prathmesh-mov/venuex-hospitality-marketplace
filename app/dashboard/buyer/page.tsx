'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { 
  LayoutDashboard, ShoppingBag, MessageSquare, Settings, 
  LogOut, Search, MapPin, Bell, Camera, ShieldCheck, Store, 
  Loader2, Clock, X, CheckCircle, CalendarClock
} from 'lucide-react';

// Haversine formula to calculate distance in kilometers between two lat/long points
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BuyerDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [greeting, setGreeting] = useState('');
  
  // Real Database State
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Geofencing State
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50); // Default 50km geofence radius
  
  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Booking Form State
  const [durationDays, setDurationDays] = useState('1');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('venuex_demo_business') || 'Event Planner Co.';
    setBusinessName(savedName);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchMarketplaceData(savedName);
    setIsMounted(true);
  }, []);

  const fetchMarketplaceData = async (buyerName: string) => {
    setIsLoading(true);
    
    // Fetch all available resources
    const { data: resData } = await supabase
      .from('resources')
      .select('*')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });

    // Fetch this buyer's requests
    const { data: reqData } = await supabase
      .from('requests')
      .select('*')
      .eq('buyer_name', buyerName)
      .order('created_at', { ascending: false });

    if (resData) setAvailableResources(resData);
    if (reqData) setMyRequests(reqData);
    
    setIsLoading(false);
  };

  const handleEnableGeofence = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          alert(`GPS Location Acquired!\nLat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => alert("Error getting location: " + error.message)
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleOpenBooking = (resource: any) => {
    setSelectedResource(resource);
    setDurationDays('1');
    setStartDate('');
    setShowBookingModal(true);
  };

  // Razorpay Payment Integrated Booking Submission
  const submitBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const proposedTotalPrice = selectedResource.daily_rate * Number(durationDays);
    const totalUpfront = proposedTotalPrice + Number(selectedResource.security_deposit);
    const durationText = `${startDate} (${durationDays} days)`;

    openRazorpayCheckout({
      amount: totalUpfront,
      name: businessName,
      description: `Escrow Deposit & Rental for ${selectedResource.name}`,
      onSuccess: async (paymentId) => {
        const { error } = await supabase.from('requests').insert([{
          resource_name: selectedResource.name,
          buyer_name: businessName,
          supplier_name: selectedResource.supplier_name,
          duration: durationText,
          proposed_price: proposedTotalPrice,
          security_deposit: selectedResource.security_deposit,
          status: 'Pending Review',
          payment_id: paymentId
        }]);

        if (!error) {
          setShowBookingModal(false);
          setSelectedResource(null);
          fetchMarketplaceData(businessName);
          alert(`Payment Successful! (Ref: ${paymentId})\nBooking request sent to supplier with funds locked in escrow.`);
        } else {
          alert("Error saving request: " + error.message);
        }
        
        setIsSubmitting(false);
      }
    });

    setIsSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading VenueX...</div>;

  const activeRentals = myRequests.filter(r => r.status === 'Approved');
  const pendingRentals = myRequests.filter(r => r.status === 'Pending Review');

  // 🚀 STRICT REAL DATABASE GEOFENCING FILTER (NO MOCK FALLBACKS)
  const filteredResources = availableResources.filter(resource => {
    if (!userCoords) return true; // If GPS is off, show all items
    
    // If supplier hasn't saved real coordinates, exclude it to eliminate dummy data
    if (!resource.lat || !resource.lon) return false; 
    
    const distance = calculateDistanceKm(
      userCoords.lat, 
      userCoords.lon, 
      Number(resource.lat), 
      Number(resource.lon)
    );
    
    return distance <= radiusKm;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 text-white rounded-lg"><LayoutDashboard className="w-6 h-6" /></div>
          <span className="text-2xl font-bold text-white tracking-tight">venueX</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<Search />} label="Discover Resources" active />
          <SidebarItem icon={<ShoppingBag />} label="My Rentals" badge={activeRentals.length > 0 ? activeRentals.length : undefined} />
          <SidebarItem icon={<CalendarClock />} label="Pending Requests" badge={pendingRentals.length > 0 ? pendingRentals.length : undefined} />
          <SidebarItem icon={<MessageSquare />} label="Messages" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold uppercase">
              {businessName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{businessName}</p>
              <p className="text-xs text-slate-400 capitalize">Buyer Account</p>
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
            <p className="text-sm text-slate-500">Find the resources you need for your next event.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {activeRentals.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-100"></span>}
            </button>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {activeRentals.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">You have {activeRentals.length} active rental(s)!</h3>
                    <p className="text-green-700 text-sm">Suppliers have approved your request. Check 'My Rentals' for delivery details.</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 transition-colors">View Rentals</button>
              </div>
            )}

            {/* GEOFENCING & RADIUS FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><MapPin className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Geofencing & Radius Filter</h4>
                  <p className="text-xs text-slate-500">{userCoords ? `Filtering active inventory within ${radiusKm} km of your GPS location` : 'Nationwide view (Click enable geofence to filter locally)'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {userCoords && (
                  <select 
                    value={radiusKm} 
                    onChange={e => setRadiusKm(Number(e.target.value))}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none"
                  >
                    <option value={10}>Within 10 km</option>
                    <option value={50}>Within 50 km</option>
                    <option value={100}>Within 100 km</option>
                  </select>
                )}
                <button 
                  onClick={handleEnableGeofence}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  {userCoords ? 'Update GPS' : 'Enable Geofence'}
                </button>
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
              <div className="pl-4 text-slate-400"><Search className="w-6 h-6" /></div>
              <input type="text" placeholder="Search for chairs, sound systems, furniture..." className="flex-1 py-4 px-4 bg-white outline-none text-slate-900 placeholder-slate-400 font-medium" />
              <div className="hidden md:flex items-center px-4 border-l border-slate-200 text-slate-400">
                <MapPin className="w-5 h-5 mr-2" /><span className="text-sm font-medium">Anywhere</span>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors ml-2 shadow-sm">Search</button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Popular Categories</h2>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {['All', 'Furniture', 'Audio/Visual', 'Kitchenware', 'Decor'].map((cat, i) => (
                  <button key={i} className={`px-6 py-3 border rounded-xl whitespace-nowrap text-sm font-semibold shadow-sm transition-colors ${i === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Available Resources</h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">Showing {filteredResources.length} items</span>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
              ) : filteredResources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <Store className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No resources in this radius</h3>
                  <p className="text-slate-500">Try expanding your geofence radius or ensure suppliers have saved their GPS locations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredResources.map(resource => (
                    <div key={resource.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                      <div className="h-48 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100 p-2">
                        {resource.image_data ? (
                          <img src={resource.image_data} alt={resource.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Camera className="w-10 h-10 text-slate-300" />
                        )}
                        {resource.verified && (
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 flex items-center shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-green-500 mr-1.5" /> Verified Profile
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{resource.name}</h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center"><Store className="w-3.5 h-3.5 mr-1.5" /> {resource.supplier_name}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end flex-1">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Deposit</p>
                            <p className="font-semibold text-slate-700">₹{resource.security_deposit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-blue-600">₹{resource.daily_rate}</p>
                            <p className="text-xs text-slate-400 font-medium uppercase mt-0.5">per day</p>
                          </div>
                        </div>
                        <button onClick={() => handleOpenBooking(resource)} className="w-full mt-5 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
                          Request Dates & Book
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

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {showBookingModal && selectedResource && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form onSubmit={submitBookingRequest} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Request to Book & Pay</h2>
                <button type="button" onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-1">
                    {selectedResource.image_data ? <img src={selectedResource.image_data} className="w-full h-full object-contain" /> : <Camera className="w-6 h-6 text-slate-300" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{selectedResource.name}</h3>
                    <p className="text-sm text-slate-500">from {selectedResource.supplier_name}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                      <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Days)</label>
                      <input type="number" min="1" required value={durationDays} onChange={e => setDurationDays(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-900" />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-3 text-sm uppercase tracking-wide">Transaction Summary</h4>
                    <div className="flex justify-between text-blue-800 text-sm mb-2">
                      <span>Rate (₹{selectedResource.daily_rate} × {durationDays} days)</span>
                      <span className="font-semibold">₹{selectedResource.daily_rate * Number(durationDays || 0)}</span>
                    </div>
                    <div className="flex justify-between text-blue-800 text-sm mb-4">
                      <span>Refundable Security Deposit</span>
                      <span className="font-semibold">₹{selectedResource.security_deposit}</span>
                    </div>
                    <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                      <span className="font-bold text-blue-900">Total Upfront</span>
                      <span className="text-xl font-black text-blue-600">₹{(selectedResource.daily_rate * Number(durationDays || 0)) + Number(selectedResource.security_deposit)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">Powered by Razorpay. Funds are held securely in escrow until return.</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
                <button type="button" onClick={() => setShowBookingModal(false)} className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !startDate || !durationDays} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CalendarClock className="w-5 h-5 mr-2" />} Pay & Book via Razorpay
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, badge }: any) {
  return (
    <a href="#" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center space-x-3">{icon}<span className="font-semibold">{label}</span></div>
      {badge && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </a>
  );
}