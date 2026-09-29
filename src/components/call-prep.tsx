"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Send,
  Bot,
  User,
  Building2,
  MapPin,
  IndianRupee,
  Loader2,
  Search,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";

interface Property {
  id: number;
  name: string;
  location: string;
  city: string;
  type: string;
  bhk: string | null;
  sqft: number;
  priceInr: number;
  amenities: string[];
  builder: string;
  possessionStatus: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CallPrepProps {
  leadId: number;
  leadName: string;
  leadLocation?: string;
  leadPropertyType?: string;
  leadBhk?: string;
  leadBudgetMax?: number;
  callPrepQuestions: string[];
}

export default function CallPrep({
  leadId,
  leadName,
  leadLocation,
  leadPropertyType,
  leadBhk,
  leadBudgetMax,
  callPrepQuestions,
}: CallPrepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && leadId) {
      const saved = localStorage.getItem(`catapult_callprep_${leadId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch {
          // Skip
        }
      }
    }
  }, [leadId]);

  useEffect(() => {
    if (typeof window !== "undefined" && leadId && messages.length > 0) {
      localStorage.setItem(`catapult_callprep_${leadId}`, JSON.stringify(messages));
    }
  }, [messages, leadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-fetch property matches for this lead on mount
  useEffect(() => {
    fetchInitialProperties();
  }, [leadId, leadLocation]);

  const fetchInitialProperties = async () => {
    setLoadingProps(true);
    try {
      let queryUrl = "/api/properties";
      if (leadLocation) {
        queryUrl += `?city=${encodeURIComponent(leadLocation)}`;
      }
      const res = await fetch(queryUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.properties && data.properties.length > 0) {
          setProperties(data.properties);
        } else {
          // Fallback fetch all properties if city search gave empty
          const fallbackRes = await fetch("/api/properties");
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            setProperties(fallbackData.properties || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load property matches:", err);
    } finally {
      setLoadingProps(false);
    }
  };

  const searchProperties = async (query: string) => {
    setLoadingProps(true);
    try {
      // Extract city if present in string
      const cityMatch = query.match(/gurugram|gurgaon|noida|mumbai|bangalore|bengaluru|hyderabad|pune/i);
      let queryUrl = "/api/properties";
      if (cityMatch) {
        queryUrl += `?city=${encodeURIComponent(cityMatch[0])}`;
      } else {
        queryUrl += `?q=${encodeURIComponent(query)}`;
      }

      const res = await fetch(queryUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.properties && data.properties.length > 0) {
          setProperties(data.properties);
        } else {
          // If no specific match, refresh default city properties
          await fetchInitialProperties();
        }
      }
    } catch (err) {
      console.error("Property search error:", err);
    } finally {
      setLoadingProps(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Filter/search properties on user message
    searchProperties(content);

    try {
      const response = await fetch("/api/call-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, message: content.trim() }),
      });

      if (!response.ok) throw new Error("Call prep failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                assistantContent += text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return newMessages;
                });
              } catch {
                // Skip
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Call prep error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Call Prep Questions + Chat */}
      <div className="glass-card flex flex-col h-[650px]">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-hairline bg-surface-1/40">
          <Phone className="w-4 h-4 text-primary-hover" />
          <h3 className="text-sm font-semibold text-ink">
            AI Call Prep — {leadName}
          </h3>
        </div>

        {/* Questions Checklist */}
        <div className="px-4 py-3 border-b border-hairline bg-surface-1/60">
          <p className="text-[11px] font-semibold text-ink-subtle uppercase tracking-wider mb-2">
            Pre-call Qualification Checklist
          </p>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
            {callPrepQuestions.map((q, i) => (
              <label
                key={i}
                className="flex items-start gap-2 text-xs text-ink-muted cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-primary rounded cursor-pointer"
                />
                <span className="group-hover:text-ink transition-colors leading-relaxed">
                  {q}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Sparkles className="w-8 h-8 text-primary/40 mb-3" />
              <p className="text-sm font-medium text-ink-muted mb-1">
                Prepare for call with {leadName}
              </p>
              <p className="text-xs text-ink-subtle max-w-xs">
                Ask for property comparisons, objection handling, or quick picks.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary-hover" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[88%] rounded-lg px-3.5 py-2.5 text-sm overflow-hidden",
                    msg.role === "user"
                      ? "bg-primary text-white font-medium"
                      : "bg-surface-2 text-ink-muted border border-hairline"
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <>
                      {msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-ink-subtle text-xs">
                          <Loader2 className="w-3 h-3 animate-spin text-primary-hover" />
                          Preparing call prep advice...
                        </span>
                      )}
                    </>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-ink-muted" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {[
              "Give list of properties that match",
              `Properties in ${leadLocation || 'Gurugram'} under ${leadBudgetMax || 150}L`,
              "What objections might they raise?",
              "Recommend top match for this client",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-1 text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all border border-hairline"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-hairline bg-surface-1/40">
          <div className="flex items-center gap-2 bg-surface-1 rounded-lg border border-hairline p-1.5 focus-within:border-primary/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search properties or ask prep questions..."
              className="flex-1 bg-transparent border-0 px-2 py-1 text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-md transition-all",
                input.trim() && !isLoading
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "bg-surface-2 text-ink-subtle cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Property Matches Window */}
      <div className="glass-card flex flex-col h-[650px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-hairline bg-surface-1/40">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-hover" />
            <h3 className="text-sm font-semibold text-ink">Property Matches</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInitialProperties}
              className="p-1 rounded text-ink-subtle hover:text-ink transition-colors"
              title="Refresh property matches"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loadingProps && "animate-spin")} />
            </button>
            <span className="text-xs font-mono text-primary-hover bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {properties.length} matched
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loadingProps && properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
              <p className="text-xs text-ink-subtle">Searching property inventory...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Building2 className="w-8 h-8 text-ink-subtle/30 mb-3" />
              <p className="text-sm text-ink-subtle">No matching properties found</p>
              <button
                onClick={fetchInitialProperties}
                className="mt-3 text-xs text-primary-hover hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Load all properties
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {properties.map((prop, i) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-surface-2/90 hover:bg-surface-2 rounded-xl p-4 border border-hairline hover:border-primary/40 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-ink group-hover:text-primary-hover transition-colors">
                          {prop.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-ink-subtle" />
                          <span className="text-xs text-ink-muted font-medium">
                            {prop.location}, {prop.city}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-primary-hover">
                          {formatCurrency(prop.priceInr)}
                        </div>
                        <span className="text-[11px] text-ink-subtle font-mono">
                          {prop.sqft} sq.ft
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-hairline/40">
                      {prop.bhk && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/15 text-primary-hover border border-primary/20">
                          {prop.bhk}
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface-3 text-ink-muted capitalize">
                        {prop.type}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface-3 text-ink-muted capitalize">
                        {prop.possessionStatus}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface-3 text-ink-subtle">
                        {prop.builder}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
