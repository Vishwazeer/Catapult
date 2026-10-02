"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Trash2, NotebookPen, X, Save, Check } from "lucide-react";
import { QUICK_CHAT_PROMPTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeadChatProps {
  leadId: number;
  leadName?: string;
  initialMessages?: Message[];
}

export default function LeadChat({ leadId, leadName, initialMessages }: LeadChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadedLeadId, setLoadedLeadId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history for specific leadId cleanly on mount or when leadId changes
  useEffect(() => {
    if (typeof window !== "undefined" && leadId) {
      localStorage.removeItem(`catapult_chat_${leadId}`);

      const saved = localStorage.getItem(`catapult_chat_v2_${leadId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setLoadedLeadId(leadId);
            fetchNotes();
            return;
          }
        } catch {
          // Skip
        }
      }
      setMessages([]);
      setLoadedLeadId(leadId);
      fetchNotes();
    }
  }, [leadId]);

  // Fetch lead's call notes from DB
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

  // Save notes to DB via PATCH /api/leads/[id]
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

  // Save chat history ONLY after state is verified for THIS leadId
  useEffect(() => {
    if (typeof window !== "undefined" && leadId && loadedLeadId === leadId) {
      if (messages.length > 0) {
        localStorage.setItem(`catapult_chat_v2_${leadId}`, JSON.stringify(messages));
      } else {
        localStorage.removeItem(`catapult_chat_v2_${leadId}`);
      }
    }
  }, [messages, leadId, loadedLeadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== "undefined" && leadId) {
      localStorage.removeItem(`catapult_chat_${leadId}`);
      localStorage.removeItem(`catapult_chat_v2_${leadId}`);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/leads/${leadId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim() }),
      });

      if (!response.ok) throw new Error("Chat failed");

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
                // Skip non-JSON lines
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
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
    <div className="glass-card flex flex-col h-[650px] w-full relative p-0 overflow-hidden bg-white border border-[#EADFD5] rounded-3xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#EADFD5] bg-[#FAF6F1]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4 text-emerald-700" />
          </div>
          <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
            Lead Assistant {leadName ? `— ${leadName}` : ""}
          </h3>
        </div>

        {/* ALWAYS Visible Action Buttons in Top Right Corner */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchNotes();
              setShowNotesModal(true);
            }}
            className="text-xs font-mono font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1.5 transition-all px-3 py-1 rounded-full bg-white border border-[#EADFD5] shadow-xs"
            title="Open Call Notes"
          >
            <NotebookPen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Notes</span>
          </button>

          <button
            onClick={clearChat}
            className="text-xs font-mono text-stone-500 hover:text-terracotta flex items-center gap-1 transition-all px-3 py-1 rounded-full bg-white border border-[#EADFD5]/70 hover:bg-terracotta-light hover:border-terracotta/30"
            title="Clear chat history for this lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>

          <span className="text-xs font-mono text-stone-400 hidden sm:inline ml-1">
            Powered by Groq
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-8 h-8 text-emerald-600/50 mb-3" />
            <p className="text-sm font-extrabold text-stone-900 mb-1">
              Ask questions about {leadName || "this lead"}
            </p>
            <p className="text-xs text-stone-500">
              Get actionable advice grounded in lead context
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-700" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl p-4 text-sm overflow-hidden shadow-xs",
                  msg.role === "user"
                    ? "bg-[#059669] text-white font-medium"
                    : "bg-[#FAF6F1] text-stone-900 border border-[#EADFD5]"
                )}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                ) : (
                  <>
                    {msg.content ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-stone-500 text-xs font-mono">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        Thinking...
                      </span>
                    )}
                  </>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-stone-700" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_CHAT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-xs font-medium bg-white border border-[#EADFD5] hover:border-stone-400 text-stone-700 hover:text-stone-900 rounded-full px-3.5 py-1.5 transition-all shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[#EADFD5] bg-[#FAF6F1]/50">
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#EADFD5] p-2 focus-within:border-stone-400 transition-colors shadow-xs">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI lead assistant..."
            className="flex-1 bg-transparent border-0 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none font-sans"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-40 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
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
                    Call Notes {leadName ? `— ${leadName}` : ""}
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
