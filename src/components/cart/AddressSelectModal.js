"use client";

import React, { useState } from "react";
import { X, Plus, MapPin, Check } from "lucide-react";

export default function AddressSelectModal({
  isOpen,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNewAddress,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onAddNewAddress(formData);
    setShowAddForm(false);
    setFormData({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-[#f4511e]" />
            <h3 className="font-bold text-gray-900 text-base">Select Delivery Address</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!showAddForm ? (
            <>
              <div className="space-y-3">
                {addresses && addresses.length > 0 ? (
                  addresses.map((addr, idx) => {
                    const isSelected =
                      selectedAddress &&
                      selectedAddress.street === addr.street &&
                      selectedAddress.pincode === addr.pincode;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onSelectAddress(addr);
                          onClose();
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? "border-[#f4511e] bg-orange-50/20 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                            isSelected ? "border-[#f4511e] bg-[#f4511e]" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{addr.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                              {addr.pincode}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{addr.street}</p>
                          <p className="text-xs text-gray-600">
                            {addr.city}, {addr.state}
                          </p>
                          <p className="text-xs text-gray-800 font-semibold mt-1">📱 +91 {addr.phone}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-sm text-gray-500 py-6">No saved addresses yet.</p>
                )}
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-[#f4511e] text-[#f4511e] hover:bg-orange-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={16} /> Add New Address
              </button>
            </>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900">New Address Details</h4>
              <div>
                <label className="text-xs font-semibold text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Receiver's name"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Mobile Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10 digit mobile number"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">House No. / Building / Street *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Street and area"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#f4511e] rounded-lg hover:bg-[#d84315]"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}