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
  Loader2,
  Sparkles,
  RefreshCw,
  Trash2,
  NotebookPen,
  X,
  Save,
  Check,
  Plus,
  RotateCcw,
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
  const [loadedLeadId, setLoadedLeadId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Active Checklist State (supports removing ANY item + adding custom items)
  const [activeChecklist, setActiveChecklist] = useState<string[]>(callPrepQuestions || []);
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Call Notes Modal State
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load call prep history & active checklist & call notes for specific leadId
  useEffect(() => {
    if (typeof window !== "undefined" && leadId) {
      // Purge old un-isolated legacy key
      localStorage.removeItem(`catapult_callprep_${leadId}`);

      const saved = localStorage.getItem(`catapult_callprep_v2_${leadId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch {
          // Skip
        }
      } else {
        setMessages([]);
      }

      // Load active checklist items (or fallback to callPrepQuestions)
      const savedChecklist = localStorage.getItem(`catapult_active_checklist_v2_${leadId}`);
      if (savedChecklist) {
        try {
          const parsedChecklist = JSON.parse(savedChecklist);
          if (Array.isArray(parsedChecklist)) {
            setActiveChecklist(parsedChecklist);
          } else {
            setActiveChecklist(callPrepQuestions || []);
          }
        } catch {
          setActiveChecklist(callPrepQuestions || []);
        }
      } else {
        setActiveChecklist(callPrepQuestions || []);
      }

      setLoadedLeadId(leadId);
      fetchNotes();
    }
  }, [leadId, callPrepQuestions]);

  // Fetch call notes from DB
  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lead && data.lead.callNotes) {
          setCallNotes(data.lead.callNotes);
        } else {
          setCallNotes("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch lead notes:", err);
    }
  };

  // Save notes to DB via PATCH
  const saveCallNotes = async () => {
    setIsSavingNotes(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callNotes }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Save chat history ONLY when state is verified for THIS leadId
  useEffect(() => {
    if (typeof window !== "undefined" && leadId && loadedLeadId === leadId) {
      if (messages.length > 0) {
        localStorage.setItem(`catapult_callprep_v2_${leadId}`, JSON.stringify(messages));
      } else {
        localStorage.removeItem(`catapult_callprep_v2_${leadId}`);
      }
    }
  }, [messages, leadId, loadedLeadId]);

  // Save active checklist items per lead
  useEffect(() => {
    if (typeof window !== "undefined" && leadId && loadedLeadId === leadId) {
      localStorage.setItem(`catapult_active_checklist_v2_${leadId}`, JSON.stringify(activeChecklist));
    }
  }, [activeChecklist, leadId, loadedLeadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-fetch property matches for this lead on mount
  useEffect(() => {
    fetchInitialProperties();
  }, [leadId, leadLocation]);

  const clearPrepHistory = () => {
    setMessages([]);
    if (typeof window !== "undefined" && leadId) {
      localStorage.removeItem(`catapult_callprep_${leadId}`);
      localStorage.removeItem(`catapult_callprep_v2_${leadId}`);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionInput.trim()) return;
    const updated = [...activeChecklist, newQuestionInput.trim()];
    setActiveChecklist(updated);
    setNewQuestionInput("");
    setShowAddQuestion(false);
  };

  // Allows removing ANY item (both pre-existing and custom added items)
  const handleRemoveQuestion = (index: number) => {
    const updated = activeChecklist.filter((_, i) => i !== index);
    setActiveChecklist(updated);
  };

  // Reset checklist back to default AI questions
  const handleResetChecklist = () => {
    setActiveChecklist(callPrepQuestions || []);
    if (typeof window !== "undefined" && leadId) {
      localStorage.removeItem(`catapult_active_checklist_v2_${leadId}`);
    }
  };

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
    <div className="space-y-6 w-full relative">
      {/* Top: AI Call Prep Chat Window */}
      <div className="glass-card flex flex-col h-[700px] w-full">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline bg-surface-1/40">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-hover" />
            <h3 className="text-sm font-semibold text-ink">
              AI Call Prep — {leadName}
            </h3>
          </div>

          {/* ALWAYS Visible Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNotesModal(true)}
              className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-lg bg-surface-2/80 border border-hairline hover:border-hairline-strong shadow-xs"
              title="Open Call Notes"
            >
              <NotebookPen className="w-3.5 h-3.5 text-primary-hover" />
              <span>Call Notes</span>
            </button>

            <button
              onClick={clearPrepHistory}
              className="text-xs text-ink-subtle hover:text-hot flex items-center gap-1 transition-all px-2.5 py-1 rounded-lg bg-surface-2/60 border border-hairline/40 hover:bg-hot/10 hover:border-hot/30"
              title="Clear call prep history for this lead"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Prep History</span>
            </button>
          </div>
        </div>

        {/* Pre-call Qualification Checklist (with remove option for ALL items + add custom item) */}
        <div className="px-5 py-3.5 border-b border-hairline bg-surface-1/60">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
              Pre-call Qualification Checklist ({activeChecklist.length})
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetChecklist}
                className="text-xs text-ink-subtle hover:text-ink flex items-center gap-1 font-medium transition-colors"
                title="Reset checklist to original AI default questions"
              >
                <RotateCcw className="w-3 h-3" /> Reset defaults
              </button>
              {!showAddQuestion && (
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="text-xs text-primary-hover hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add item
                </button>
              )}
            </div>
          </div>

          {/* Add custom question inline input */}
          {showAddQuestion && (
            <div className="flex items-center gap-2 mb-2 bg-surface-2/80 p-1.5 rounded-lg border border-primary/30">
              <input
                type="text"
                value={newQuestionInput}
                onChange={(e) => setNewQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddQuestion();
                  }
                }}
                placeholder="Type custom checklist question..."
                className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink-subtle px-2 py-1 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleAddQuestion}
                className="px-2.5 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-hover transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddQuestion(false)}
                className="p-1 text-ink-subtle hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeChecklist.length === 0 ? (
            <div className="py-2 text-center text-xs text-ink-subtle italic">
              No checklist items remaining. Click &quot;Add item&quot; or &quot;Reset defaults&quot; to restore.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {activeChecklist.map((q, i) => (
                <div
                  key={`${i}-${q.slice(0, 15)}`}
                  className="flex items-start justify-between gap-2 text-xs text-ink-muted group bg-surface-2/40 p-2.5 rounded-lg border border-hairline/40 hover:border-hairline hover:bg-surface-2/80 transition-all"
                >
                  <label className="flex items-start gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-primary rounded cursor-pointer"
                    />
                    <span className="group-hover:text-ink transition-colors leading-relaxed">
                      {q}
                    </span>
                  </label>
                  {/* Remove X button on EVERY item (pre-existing AND custom added) */}
                  <button
                    onClick={() => handleRemoveQuestion(i)}
                    className="text-ink-subtle hover:text-hot p-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove item from checklist"
                  >
                    <X className="w-3.5 h-3.5 text-hot/80 hover:text-hot" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat History Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Sparkles className="w-8 h-8 text-primary/40 mb-3" />
              <p className="text-sm font-medium text-ink-muted mb-1">
                Prepare for call with {leadName}
              </p>
              <p className="text-xs text-ink-subtle max-w-md">
                Ask for property comparisons, objection handling, or quick picks. Output tables and formatted markdown expand cleanly across the entire window.
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
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-hover" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[94%] rounded-xl px-4 py-3 text-sm overflow-hidden shadow-sm",
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
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-hover" />
                          Preparing call prep advice...
                        </span>
                      )}
                    </>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-ink-muted" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {[
              "Give list of properties that match",
              `Properties in ${leadLocation || 'Gurugram'} under ${leadBudgetMax || 150}L`,
              "What objections might they raise?",
              "Recommend top match for this client",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-surface-1 text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all border border-hairline"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-hairline bg-surface-1/40">
          <div className="flex items-center gap-2 bg-surface-1 rounded-xl border border-hairline p-2 focus-within:border-primary/50 transition-colors shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search properties or ask prep questions..."
              className="flex-1 bg-transparent border-0 px-3 py-1.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2.5 rounded-lg transition-all flex items-center justify-center",
                input.trim() && !isLoading
                  ? "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  : "bg-surface-2 text-ink-subtle cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Horizontal Property Matches Grid */}
      <div className="glass-card p-5 w-full">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-hover" />
            <h3 className="text-sm font-semibold text-ink">
              Property Inventory Matches
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInitialProperties}
              className="p-1 rounded text-ink-subtle hover:text-ink transition-colors"
              title="Refresh property matches"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loadingProps && "animate-spin")} />
            </button>
            <span className="text-xs font-mono text-primary-hover bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 font-bold">
              {properties.length} matched properties
            </span>
          </div>
        </div>

        {loadingProps && properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-xs text-ink-subtle">Searching property inventory...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {properties.map((prop, i) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-surface-2/90 hover:bg-surface-2 rounded-xl p-4 border border-hairline hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-ink group-hover:text-primary-hover transition-colors line-clamp-1">
                        {prop.name}
                      </h4>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-primary-hover whitespace-nowrap">
                          {formatCurrency(prop.priceInr)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
                      <span className="flex items-center gap-1 text-ink-subtle">
                        <MapPin className="w-3 h-3 text-primary-hover" />
                        {prop.location}, {prop.city}
                      </span>
                      <span className="font-mono text-ink-subtle text-[11px]">
                        {prop.sqft} sq.ft
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-hairline/40 mt-2">
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

      {/* Call Notes Modal Pop-up */}
      <AnimatePresence>
        {showNotesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-1 border border-hairline rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
                <div className="flex items-center gap-2">
                  <NotebookPen className="w-5 h-5 text-primary-hover" />
                  <h3 className="text-base font-semibold text-ink">
                    Call Notes — {leadName}
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="p-1 rounded text-ink-subtle hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-ink-subtle mb-3">
                Record and save call notes directly to the database for future reference.
              </p>

              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Type your call notes here..."
                rows={6}
                className="w-full input-dark p-3 text-xs leading-relaxed resize-none font-sans"
              />

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Notes saved to database!
                  </span>
                ) : (
                  <span className="text-[11px] text-ink-subtle">Stored in Neon Postgres</span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-hairline text-xs text-ink-muted hover:text-ink hover:bg-surface-2 transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={saveCallNotes}
                    disabled={isSavingNotes}
                    className="btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Notes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
