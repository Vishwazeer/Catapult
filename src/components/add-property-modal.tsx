"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Plus, Loader2 } from "lucide-react";
import { CITIES, PROPERTY_TYPES, BHK_OPTIONS } from "@/lib/constants";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    builder: "",
    location: "",
    city: "Gurugram",
    state: "Haryana",
    type: "apartment",
    bhk: "3 BHK",
    sqft: "",
    priceInr: "", // In Lakhs
    possessionStatus: "ready",
    amenities: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sqft: parseInt(formData.sqft) || 0,
          priceInr: parseFloat(formData.priceInr) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create property");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl p-6 md:p-8 rounded-3xl border border-[#EADFD5] my-8 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#EADFD5] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] border border-emerald-200 flex items-center justify-center text-[#059669]">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Add New Property</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLF The Camellias"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Builder / Developer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLF Homes"
                  value={formData.builder}
                  onChange={(e) => setFormData({ ...formData, builder: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all cursor-pointer"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Location / Sector <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 42, Golf Course Road"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all cursor-pointer"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">BHK Configuration</label>
                <select
                  value={formData.bhk}
                  onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all cursor-pointer"
                >
                  {BHK_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Area (sq.ft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1850"
                  value={formData.sqft}
                  onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">
                  Price in Lakhs (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 150 for ₹1.5 Cr, 85 for ₹85 Lakhs"
                  value={formData.priceInr}
                  onChange={(e) => setFormData({ ...formData, priceInr: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                />
                <p className="text-[10px] font-mono text-stone-400 mt-1">
                  Enter in Lakhs. Example: 150 = ₹1.5 Cr | 80 = ₹80 Lakhs
                </p>
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">Possession Status</label>
                <select
                  value={formData.possessionStatus}
                  onChange={(e) => setFormData({ ...formData, possessionStatus: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all cursor-pointer"
                >
                  <option value="ready">Ready to Move</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="new-launch">New Launch</option>
                </select>
              </div>

              <div>
                <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">State</label>
                <input
                  type="text"
                  placeholder="e.g. Haryana"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">Amenities (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Swimming Pool, Clubhouse, 24x7 Security, Power Backup"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="section-label text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5 block">Description</label>
              <textarea
                rows={3}
                placeholder="Brief highlights or description of the property..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EADFD5] mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full border border-[#EADFD5] text-stone-700 font-mono text-xs uppercase tracking-wider font-bold hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{loading ? "Adding..." : "Add Property"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
