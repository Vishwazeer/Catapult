"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import {
  Building2,
  MapPin,
  Search,
  Loader2,
  IndianRupee,
  Filter,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CITIES, PROPERTY_TYPES } from "@/lib/constants";

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
      <main className="flex-1 ml-[260px] p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-semibold text-ink tracking-wide">
            Property Database
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {properties.length} properties across India
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search properties, builders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark w-full pl-9"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="input-dark min-w-[150px]"
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
            className="input-dark min-w-[150px]"
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
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card-hover p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-ink text-sm">
                      {prop.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-ink-subtle" />
                      <span className="text-xs text-ink-muted">
                        {prop.location}, {prop.city}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-primary-hover">
                      {formatCurrency(prop.priceInr)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {prop.bhk && (
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-hover font-medium">
                      {prop.bhk}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-2 text-ink-muted">
                    {prop.sqft} sq.ft
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-2 text-ink-muted capitalize">
                    {prop.type}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      prop.possessionStatus === "ready"
                        ? "bg-success/10 text-success"
                        : prop.possessionStatus === "under-construction"
                        ? "bg-warm/10 text-warm"
                        : "bg-cold/10 text-cold"
                    )}
                  >
                    {prop.possessionStatus}
                  </span>
                </div>

                <p className="text-xs text-ink-subtle mb-3">
                  By {prop.builder}
                </p>

                {prop.amenities && prop.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prop.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-ink-subtle"
                      >
                        {a}
                      </span>
                    ))}
                    {prop.amenities.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-ink-subtle">
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
            <Building2 className="w-10 h-10 text-ink-subtle/30 mb-3" />
            <p className="text-sm text-ink-muted">No properties match your filters</p>
          </div>
        )}
      </main>
    </>
  );
}
