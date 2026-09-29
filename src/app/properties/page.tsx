"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import {
  Building2,
  MapPin,
  Search,
  Loader2,
  Plus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CITIES, PROPERTY_TYPES } from "@/lib/constants";
import AddPropertyModal from "@/components/add-property-modal";

interface Property {
  id: number;
  name: string;
  location: string;
  city: string;
  state: string;
  type: string;
  bhk: string | null;
  sqft: number;
  priceInr: number;
  amenities: string[];
  builder: string;
  possessionStatus: string;
  description: string | null;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = properties.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.builder.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCity = cityFilter ? p.city === cityFilter : true;
    const matchesType = typeFilter ? p.type === typeFilter : true;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 min-h-screen bg-[#F4EEE8]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
              Property Database
            </h1>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 mt-1">
              {properties.length} properties across India
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-full font-mono text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search properties, builders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 font-sans text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 font-sans text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-[#EADFD5] rounded-2xl px-4 py-2.5 text-stone-900 font-sans text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#059669] animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-[#EADFD5] hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-black text-stone-900 text-base tracking-tight">
                        {prop.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="text-xs font-medium text-stone-500">
                          {prop.location}, {prop.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-[#059669] text-base md:text-lg tracking-tight">
                        {formatCurrency(prop.priceInr)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {prop.bhk && (
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-emerald-950 border border-emerald-200">
                        {prop.bhk}
                      </span>
                    )}
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-[#EADFD5]">
                      {prop.sqft} sq.ft
                    </span>
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-[#EADFD5] capitalize">
                      {prop.type}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-mono font-bold px-2.5 py-1 rounded-full border",
                        prop.possessionStatus === "ready"
                          ? "bg-[#ECFDF5] text-[#059669] border-emerald-200"
                          : prop.possessionStatus === "under-construction"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {prop.possessionStatus}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mb-4">
                    By <strong className="font-bold text-stone-900">{prop.builder}</strong>
                  </p>
                </div>

                {prop.amenities && prop.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#EADFD5]/60">
                    {prop.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-stone-50 text-stone-600 border border-[#EADFD5]"
                      >
                        {a}
                      </span>
                    ))}
                    {prop.amenities.length > 4 && (
                      <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-stone-50 text-stone-600 border border-[#EADFD5]">
                        +{prop.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="w-10 h-10 text-stone-300 mb-3" />
            <p className="text-sm font-mono font-bold text-stone-500">No properties match your filters</p>
          </div>
        )}

        <AddPropertyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchProperties}
        />
      </main>
    </>
  );
}
