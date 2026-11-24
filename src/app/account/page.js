"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { 
  User, 
  Package, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2,
  CreditCard,
  Heart,
  HelpCircle,
  Bell
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, openAuthModal, refreshProfile } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  // Profile Edit modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    if (!isLoggedIn && typeof window !== "undefined") {
      // agar login nahi hai to OTP modal kholo
      const timer = setTimeout(() => {
        if (!isLoggedIn) {
          openAuthModal();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, openAuthModal]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      if (user.savedAddresses) {
        setAddresses(user.savedAddresses);
      }
    }
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("texora_token");
      const res = await fetch("http://localhost:5000/api/auth/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (data.addresses) {
        setAddresses(data.addresses);
        setShowAddressModal(false);
        setNewAddr({ name: "", phone: "", street: "", city: "", state: "", pincode: "", isDefault: false });
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("texora_token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });
      const data = await res.json();
      if (data.user) {
        setShowEditProfile(false);
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 text-[#f4511e] rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Please Sign In First</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Log in with your mobile number to view your profile, delivery addresses and order history.
          </p>
          <button
            onClick={() => openAuthModal()}
            className="w-full bg-[#f4511e] hover:bg-[#d84315] text-white py-3 rounded-xl font-bold text-base transition-all shadow-md shadow-orange-500/20"
          >
            Sign In with Mobile OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top User Greeting Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-[#f4511e] to-orange-600 rounded-2xl p-6 text-white shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-[#f4511e] flex items-center justify-center font-black text-2xl shadow-inner border-2 border-orange-200">
              {user?.name ? user.name[0].toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{user?.name || "Customer"}</h1>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="bg-white/20 hover:bg-white/30 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold backdrop-blur-sm"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <p className="text-orange-100 text-sm mt-0.5 flex items-center gap-1.5">
                <Phone size={14} /> +91 {user?.phone || "XXXXXXXXXX"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-white/20"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Quick Action Badges (Shopsy Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Link
            href="/orders"
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#f4511e] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Your Orders</p>
              <p className="text-sm font-bold text-gray-900">Track & Buy</p>
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Saved Items</p>
              <p className="text-sm font-bold text-gray-900">Wishlist</p>
            </div>
          </Link>

          <div
            onClick={() => setActiveTab("addresses")}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Delivery</p>
              <p className="text-sm font-bold text-gray-900">Addresses</p>
            </div>
          </div>

          <Link
            href="/contact"
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Need Help?</p>
              <p className="text-sm font-bold text-gray-900">24x7 Support</p>
            </div>
          </Link>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3.5 text-center font-bold text-sm border-b-2 transition-all ${
                activeTab === "profile"
                  ? "border-[#f4511e] text-[#f4511e] bg-orange-50/30"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Account Information
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex-1 py-3.5 text-center font-bold text-sm border-b-2 transition-all ${
                activeTab === "addresses"
                  ? "border-[#f4511e] text-[#f4511e] bg-orange-50/30"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Saved Delivery Addresses ({addresses.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <div className="max-w-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{user?.name || "Not set"}</p>
                  </div>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="text-xs font-bold text-[#f4511e] hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">+91 {user?.phone}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{user?.email || "Not linked yet"}</p>
                  </div>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="text-xs font-bold text-[#f4511e] hover:underline"
                  >
                    {user?.email ? "Edit" : "+ Add Email"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-base">Delivery Addresses</h3>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-1.5 bg-[#f4511e] hover:bg-[#d84315] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <MapPin size={36} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-700">No saved address found</p>
                    <p className="text-xs text-gray-500 mt-1 mb-4">Add your home or work address for fast 1-click checkout</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f4511e] bg-orange-50 px-4 py-2 rounded-lg"
                    >
                      <Plus size={14} /> Add Address Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border relative transition-all ${
                          addr.isDefault
                            ? "border-orange-500 bg-orange-50/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider bg-[#f4511e] text-white px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                        <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{addr.street}</p>
                        <p className="text-xs text-gray-600">
                          {addr.city}, {addr.state} - <span className="font-bold text-gray-900">{addr.pincode}</span>
                        </p>
                        <p className="text-xs text-gray-700 font-semibold mt-2">📱 +91 {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Update Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Manish Sharma"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="e.g. manish@gmail.com"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#f4511e] rounded-lg hover:bg-[#d84315]"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Add Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  placeholder="Receiver's full name"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  placeholder="10 digit mobile number"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Flat / House No. / Street Address *</label>
                <input
                  type="text"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="Street, colony, area"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700">City / District *</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="e.g. Kolkata"
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">State *</label>
                  <input
                    type="text"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    placeholder="e.g. West Bengal"
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  placeholder="6 digit pincode"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  required
                />
              </div>
              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddr.isDefault}
                  onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                  className="rounded text-[#f4511e] focus:ring-orange-500"
                />
                <span className="text-xs text-gray-700 font-medium">Make this my default delivery address</span>
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#f4511e] rounded-lg hover:bg-[#d84315]"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}