"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  Trash2,
  NotebookPen,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  MessageCircle,
  Clock,
  Sparkles,
  Building2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import MessageActionButtons from "./message-action-buttons";

interface CustomerSimulatorProps {
  leadId: number;
  leadName: string;
  leadPhone?: string | null;
  leadEmail?: string | null;
  leadLocation?: string;
  leadPropertyType?: string;
  leadBhk?: string;
  leadBudgetMax?: number;
  callPrepQuestions: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant" | "salesperson" | "customer";
  content: string;
  timestamp: string;
}

interface AnalysisResult {
  oldScore: number;
  newScore: number;
  oldTag: string;
  newTag: string;
  reasoning: string;
  buyingSignals?: string[];
  objections?: string[];
  newObjections?: string[];
  newRequirements?: string[];
  informationDiscovered?: string[];
  recommendedNextAction?: string;
  suggestedResponse?: string;
  matchedProperty?: {
    id: number;
    name: string;
    location: string;
    city: string;
    type: string;
    bhk: string | null;
    priceInr: number;
    sqft: number;
    builder: string;
    possessionStatus: string;
  } | null;
}

const getTagEmoji = (tag: string) => {
  const t = tag.toUpperCase();
  if (t === "HOT" || t.includes("HIGH")) return "🔥";
  if (t === "WARM" || t.includes("MODERATE")) return "🟠";
  if (t === "COLD" || t.includes("LOW")) return "❄️";
  return "⚪";
};

const formatTagLabel = (tag: string) => {
  const t = tag.toUpperCase();
  if (t === "HOT" || t.includes("HIGH")) return "HIGH INTENT";
  if (t === "WARM" || t.includes("MODERATE")) return "MODERATE INTENT";
  if (t === "COLD" || t.includes("LOW")) return "LOW INTENT";
  return tag.toUpperCase();
};

const getTagClass = (tag: string) => {
  const t = tag.toUpperCase();
  if (t === "HOT" || t.includes("HIGH")) return "text-hot bg-hot/10 border-hot/20 whitespace-nowrap shrink-0";
  if (t === "WARM" || t.includes("MODERATE")) return "text-warm bg-warm/10 border-warm/20 whitespace-nowrap shrink-0";
  if (t === "COLD" || t.includes("LOW")) return "text-cold bg-cold/10 border-cold/20 whitespace-nowrap shrink-0";
  return "text-ink-muted bg-surface-2 border-hairline whitespace-nowrap shrink-0";
};

export default function CustomerSimulator({
  leadId,
  leadName,
  leadPhone,
  leadEmail,
  leadLocation,
  leadPropertyType,
  leadBhk,
  leadBudgetMax,
  callPrepQuestions: initialCallPrepQuestions
}: CustomerSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Call Prep Checklist
  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>([]);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Notes Modal & Portal Mounting
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `catapult_sim_v2_${leadId}`;

  // Initialize checklist
  useEffect(() => {
    setChecklist(initialCallPrepQuestions.map(q => ({ text: q, done: false })));
  }, [initialCallPrepQuestions]);

  // Fetch call notes from DB
  const fetchCallNotes = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.lead?.callNotes || "");
      }
    } catch (err) {
      console.error("Failed to fetch lead call notes", err);
    }
  };

  // Load history & call notes on mount and leadId change
  useEffect(() => {
    const loadHistory = async () => {
      try {
        fetchCallNotes();

        const localData = localStorage.getItem(storageKey);
        if (localData) {
          setMessages(JSON.parse(localData));
        }

        const res = await fetch(`/api/leads/${leadId}/simulate`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            const normalized = data.messages.map((m: any) => ({
              id: m.id ? m.id.toString() : Math.random().toString(),
              role: (m.role === "salesperson" || m.role === "user") ? "user" : "assistant",
              content: m.content,
              timestamp: m.createdAt || m.created_at || m.timestamp || new Date().toISOString(),
            }));
            setMessages(normalized);
            localStorage.setItem(storageKey, JSON.stringify(normalized));
          }
        }
      } catch (err) {
        console.error("Failed to load simulation history", err);
      }
    };
    loadHistory();
  }, [leadId, storageKey]);

  // Scroll inner chat container smoothly to bottom only when user is near bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, analysisResult]);

  const saveMessagesLocally = (msgs: Message[]) => {
    setMessages(msgs);
    localStorage.setItem(storageKey, JSON.stringify(msgs));
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMessage];
    saveMessagesLocally(updatedMessages);
    setInputValue("");
    setIsLoading(true);
    setAnalysisResult(null);

    // Placeholder for streaming AI response
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { id: aiMessageId, role: "assistant", content: "", timestamp: new Date().toISOString() }
    ]);

    try {
      const response = await fetch(`/api/leads/${leadId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newUserMessage.content })
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No readable stream available");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiFullResponse = "";
      let buffer = "";

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
              aiFullResponse += text;
              setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, content: aiFullResponse } : msg
              ));
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }

      // Save complete AI response
      const finalMessages = [...updatedMessages, {
        id: aiMessageId,
        role: "assistant",
        content: aiFullResponse,
        timestamp: new Date().toISOString()
      }];
      
      saveMessagesLocally(finalMessages as Message[]);

      await fetch(`/api/leads/${leadId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveCustomerResponse: aiFullResponse })
      }).catch(console.error);

      // Auto-trigger re-analysis & property matching after customer replies
      handleAnalyze();

    } catch (error) {
      console.error("Error during simulation:", error);
      setMessages(prev => {
        const fallback = [...prev];
        const last = fallback[fallback.length - 1];
        if (last.role === "assistant" && !last.content) {
          last.content = "Sorry, I encountered an error connecting to the customer simulation.";
        }
        return fallback;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear the simulation history?")) return;
    saveMessagesLocally([]);
    setAnalysisResult(null);
    try {
      await fetch(`/api/leads/${leadId}/simulate`, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to clear DB history", e);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/reanalyze`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis || data);
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callNotes: notes })
      });
      setIsNotesModalOpen(false);
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatTime = (timeInput?: string | Date) => {
    if (!timeInput) return "";
    try {
      const d = new Date(timeInput);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const hasExchange = messages.filter(m => m.role === "user" || m.role === "salesperson").length > 0 && 
                      messages.filter(m => m.role === "assistant" || m.role === "customer").length > 0;

  return (
    <div className="flex flex-col glass-card overflow-hidden h-[750px] border border-slate-200 bg-white shadow-sm rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-700 border border-emerald-200/60 shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">WhatsApp Chat Simulator</h3>
            <p className="text-xs text-slate-500">Practicing with {leadName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasExchange && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze
            </button>
          )}
          <button
            onClick={() => {
              fetchCallNotes();
              setIsNotesModalOpen(true);
            }}
            className="p-2 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-md transition-colors"
            title="Call Notes"
          >
            <NotebookPen className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 text-ink-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Checklist */}
      <div className="border-b border-hairline bg-surface-1">
        <button
          onClick={() => setIsChecklistOpen(!isChecklistOpen)}
          className="flex items-center justify-between w-full p-3 text-sm font-medium text-ink-muted hover:bg-surface-2/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Pre-call Qualification Checklist
            <span className="px-2 py-0.5 rounded-full bg-surface-2 text-xs">
              {checklist.filter(c => c.done).length}/{checklist.length}
            </span>
          </div>
          {isChecklistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {isChecklistOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 group">
                    <button
                      onClick={() => {
                        const newC = [...checklist];
                        newC[idx].done = !newC[idx].done;
                        setChecklist(newC);
                      }}
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        item.done ? "bg-primary border-primary text-white" : "border-hairline text-transparent hover:border-primary/50"
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <span className={cn("text-sm transition-colors", item.done ? "text-ink-subtle line-through" : "text-ink")}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))}
                      className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-ink-subtle hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2 mt-2 pt-2 border-t border-hairline">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newChecklistItem.trim()) {
                        setChecklist([...checklist, { text: newChecklistItem.trim(), done: false }]);
                        setNewChecklistItem("");
                      }
                    }}
                    placeholder="Add a custom goal..."
                    className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-0 text-ink placeholder:text-ink-subtle"
                  />
                  <button
                    onClick={() => {
                      if (newChecklistItem.trim()) {
                        setChecklist([...checklist, { text: newChecklistItem.trim(), done: false }]);
                        setNewChecklistItem("");
                      }
                    }}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6" style={{ backgroundImage: "radial-gradient(circle at center, var(--surface-2) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
              <Bot className="w-8 h-8 text-ink-muted" />
            </div>
            <div>
              <p className="text-ink font-medium">Start the simulation</p>
              <p className="text-sm text-ink-muted max-w-xs mt-1">
                Send a message to practice your pitch with a simulated {leadName}.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 w-full max-w-md mt-6">
              {[
                `Hi ${leadName}, following up on your inquiry about ${leadPropertyType ? leadPropertyType.toLowerCase() + "s" : "properties"}.`,
                "I found some options that might match your requirements. Do you have a moment?",
                "Quick question about your preferred timeline for moving?"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(undefined, prompt)}
                  className="p-3 text-sm text-left border border-hairline rounded-lg bg-surface-1 hover:bg-surface-2 hover:border-primary/30 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.role === "user" || msg.role === "salesperson";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[80%] gap-3",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}>
                    {/* Avatar */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm",
                        isUser ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700 border border-slate-300"
                      )}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-700" />}
                      </div>
                    </div>

                    {/* Bubble */}
                    <div className="flex flex-col gap-1">
                      {!isUser && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1 ml-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Simulated Customer
                        </span>
                      )}
                      <div className={cn(
                        "px-4 py-3 rounded-2xl relative group text-sm",
                        isUser 
                          ? "bg-emerald-600 text-white rounded-tr-none shadow-sm" 
                          : "bg-white text-slate-900 border border-slate-200 shadow-sm rounded-tl-none"
                      )}>
                        {isUser ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <div className="text-sm text-slate-900 leading-relaxed max-w-none">
                            {msg.content ? (
                              <MarkdownRenderer content={msg.content} />
                            ) : (
                              <div className="flex gap-1 items-center h-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "text-[10px] text-slate-400 flex items-center gap-1 mt-0.5",
                        isUser ? "justify-end mr-1" : "justify-start ml-1"
                      )}>
                        <Clock className="w-3 h-3" />
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Analysis Loading Bubble in Chat stream */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full justify-start"
              >
                <div className="flex max-w-[85%] gap-3 flex-row items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary animate-pulse shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-surface-2 border border-primary/30 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-ink flex items-center gap-3 shadow-md">
                    <span className="flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    </span>
                    <span className="font-semibold text-ink">
                      AI is evaluating customer intent & matching live inventory from database...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analysis Result Panel */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto my-6 border border-primary/20 bg-primary/5 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                  <h4 className="font-semibold text-ink flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Conversation Analysis
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 whitespace-nowrap shrink-0", getTagClass(analysisResult.oldTag))}>
                      <span>{analysisResult.oldScore}</span>
                      <span>{getTagEmoji(analysisResult.oldTag)}</span>
                      <span>{formatTagLabel(analysisResult.oldTag)}</span>
                    </div>
                    <div className="text-ink-subtle">→</div>
                    <div className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 whitespace-nowrap shrink-0", getTagClass(analysisResult.newTag))}>
                      <span>{analysisResult.newScore}</span>
                      <span>{getTagEmoji(analysisResult.newTag)}</span>
                      <span>{formatTagLabel(analysisResult.newTag)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <p className="text-sm text-ink leading-relaxed">
                    {analysisResult.reasoning}
                  </p>
                  
                  {/* Signals & Objections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(analysisResult.buyingSignals) && analysisResult.buyingSignals.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Buying Signals</h5>
                        <ul className="space-y-1">
                          {analysisResult.buyingSignals.map((signal, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0" />
                              <span className="text-ink">{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {((Array.isArray(analysisResult.objections) && analysisResult.objections.length > 0) ||
                      (Array.isArray(analysisResult.newObjections) && analysisResult.newObjections.length > 0)) && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Objections / Concerns</h5>
                        <ul className="space-y-1">
                          {(analysisResult.objections || analysisResult.newObjections || []).map((obj, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                              <span className="text-ink">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* AI Suggested Reply */}
                  {analysisResult.suggestedResponse && (
                    <div className="p-3 bg-surface-2/90 rounded-lg border border-hairline space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary-hover flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Suggested AI Reply
                        </span>
                        <button
                          type="button"
                          onClick={() => setInputValue(analysisResult.suggestedResponse || "")}
                          className="text-[11px] font-semibold text-primary-hover hover:underline bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
                        >
                          Fill Simulator Input
                        </button>
                      </div>
                      <p className="text-xs text-ink italic leading-relaxed">
                        "{analysisResult.suggestedResponse}"
                      </p>
                      <div className="pt-2 border-t border-hairline/40">
                        <MessageActionButtons
                          text={analysisResult.suggestedResponse}
                          phone={leadPhone}
                          email={leadEmail}
                          size="sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Matched Property */}
                  {analysisResult.matchedProperty && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary-hover" />
                          Recommended Property Match: {analysisResult.matchedProperty.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const prop = analysisResult.matchedProperty;
                            if (!prop) return;
                            const priceLakhs = (prop as any).priceInr ?? (prop as any).price_inr ?? 0;
                            const priceFormatted = formatCurrency(priceLakhs);
                            const status = (prop as any).possessionStatus || (prop as any).possession_status || 'ready';
                            const msg = `I have an inventory option matching your criteria: ${prop.name} in ${prop.location}, ${prop.city} (${prop.bhk ? prop.bhk + ', ' : ''}${priceFormatted}). Possession: ${status}. Would you like to schedule a site visit?`;
                            setInputValue(msg);
                          }}
                          className="text-[11px] font-bold text-white bg-primary hover:bg-primary-hover px-2.5 py-1 rounded-md transition-all shadow-sm"
                        >
                          Attach Property Info
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span>{analysisResult.matchedProperty.location}, {analysisResult.matchedProperty.city} {analysisResult.matchedProperty.bhk ? `• ${analysisResult.matchedProperty.bhk}` : ''}</span>
                        <span className="font-mono font-bold text-primary-hover">
                          {formatCurrency((analysisResult.matchedProperty as any).priceInr ?? (analysisResult.matchedProperty as any).price_inr ?? 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface-1 border-t border-hairline">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Type your message to the customer..."
            className="input-dark flex-1 min-h-[44px] max-h-[120px] resize-none py-3 pr-12 rounded-xl"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:bg-surface-3 transition-colors flex items-center justify-center h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-center text-ink-subtle mt-2">
          Press <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-hairline font-sans">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-hairline font-sans">Shift + Enter</kbd> for new line
        </div>
      </div>

      {/* Notes Modal Overlay rendered directly on document.body */}
      {mounted && createPortal(
        <AnimatePresence>
          {isNotesModalOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white border border-[#EADFD5] rounded-3xl shadow-2xl overflow-hidden relative"
              >
                <div className="flex items-center justify-between p-5 border-b border-[#EADFD5] bg-[#FAF6F1]">
                  <h3 className="font-black text-stone-900 text-base tracking-tight flex items-center gap-2">
                    <NotebookPen className="w-4 h-4 text-[#059669]" />
                    Call Notes {leadName ? `— ${leadName}` : ""}
                  </h3>
                  <button
                    onClick={() => setIsNotesModalOpen(false)}
                    className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jot down important details, action items, or objections..."
                    className="w-full bg-white border border-[#EADFD5] rounded-2xl p-4 text-stone-900 text-sm font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400 h-44 resize-none"
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsNotesModalOpen(false)}
                      className="px-6 py-2.5 rounded-full border border-[#EADFD5] text-stone-700 font-mono text-xs uppercase tracking-wider font-bold hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes || !notes.trim()}
                      className="px-6 py-2.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      {isSavingNotes ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
