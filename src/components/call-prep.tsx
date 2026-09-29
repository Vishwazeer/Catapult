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
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

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
  callPrepQuestions: string[];
}

export default function CallPrep({
  leadId,
  leadName,
  callPrepQuestions,
}: CallPrepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showProperties, setShowProperties] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const searchProperties = async (query: string) => {
    try {
      const res = await fetch(`/api/properties?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setShowProperties(true);
      }
    } catch (err) {
      console.error("Property search error:", err);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Check if message looks like a property query
    const looksLikePropertyQuery =
      /location|budget|bhk|city|gurugram|noida|mumbai|bangalore|hyderabad|pune|cr|lakh/i.test(
        content
      );

    if (looksLikePropertyQuery) {
      await searchProperties(content);
    }

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

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
      {/* Left: Call Prep Questions + Chat */}
      <div className="glass-card flex flex-col h-[600px]">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-hairline">
          <Phone className="w-4 h-4 text-primary-hover" />
          <h3 className="text-sm font-semibold text-ink">
            AI Call Prep — {leadName}
          </h3>
        </div>

        {/* Questions Checklist */}
        <div className="px-4 py-3 border-b border-hairline bg-surface-1/50">
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wider mb-2">
            Pre-call Questions
          </p>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
            {callPrepQuestions.map((q, i) => (
              <label
                key={i}
                className="flex items-start gap-2 text-xs text-ink-muted cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-primary"
                />
                <span className="group-hover:text-ink transition-colors">
                  {q}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-8 h-8 text-primary/30 mb-3" />
              <p className="text-sm text-ink-muted mb-2">Property Search & Call Prep</p>
              <p className="text-xs text-ink-subtle max-w-xs">
                Try: &quot;location Gurugram budget 1 CR&quot; or &quot;Which property suits this
                client best?&quot;
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
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-primary-hover" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-surface-2 text-ink-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                    {isLoading &&
                      i === messages.length - 1 &&
                      msg.role === "assistant" &&
                      msg.content === "" && (
                        <Loader2 className="w-3 h-3 animate-spin inline ml-1" />
                      )}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-ink-muted" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {[
              "Location Gurugram budget 1 CR",
              "3 BHK in Noida under 80L",
              "Best property for this client?",
              "Compare top 3 options",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-2 text-ink-subtle hover:text-ink hover:bg-surface-3 transition-all border border-hairline"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-hairline p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search properties or ask prep questions..."
              rows={1}
              className="input-dark flex-1 resize-none min-h-[36px] max-h-[80px] text-sm"
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

      {/* Right: Property Results */}
      <div className="glass-card flex flex-col h-[600px]">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-hairline">
          <Search className="w-4 h-4 text-primary-hover" />
          <h3 className="text-sm font-semibold text-ink">Property Matches</h3>
          {properties.length > 0 && (
            <span className="ml-auto text-xs text-ink-subtle">
              {properties.length} found
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!showProperties || properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Building2 className="w-8 h-8 text-ink-subtle/30 mb-3" />
              <p className="text-sm text-ink-subtle">
                Search for properties to see matches here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {properties.map((prop, i) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface-2 rounded-lg p-4 border border-hairline hover:border-hairline-strong transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">
                          {prop.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-ink-subtle" />
                          <span className="text-xs text-ink-muted">
                            {prop.location}, {prop.city}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-primary-hover">
                          {formatCurrency(prop.priceInr)}
                        </div>
                        <span className="text-xs text-ink-subtle">
                          {prop.sqft} sq.ft
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {prop.bhk && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-hover">
                          {prop.bhk}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-3 text-ink-muted">
                        {prop.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-3 text-ink-muted">
                        {prop.possessionStatus}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-3 text-ink-subtle">
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
