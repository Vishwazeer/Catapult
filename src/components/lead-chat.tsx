"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Trash2 } from "lucide-react";
import { QUICK_CHAT_PROMPTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeadChatProps {
  leadId: number;
  initialMessages?: Message[];
}

export default function LeadChat({ leadId, initialMessages }: LeadChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadedLeadId, setLoadedLeadId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history for specific leadId cleanly on mount or when leadId changes
  useEffect(() => {
    if (typeof window !== "undefined" && leadId) {
      const saved = localStorage.getItem(`catapult_chat_${leadId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setLoadedLeadId(leadId);
            return;
          }
        } catch {
          // Skip
        }
      }
      setMessages(initialMessages && initialMessages.length > 0 ? initialMessages : []);
      setLoadedLeadId(leadId);
    }
  }, [leadId]);

  // Save chat history ONLY after the state has been successfully loaded for THIS leadId
  useEffect(() => {
    if (typeof window !== "undefined" && leadId && loadedLeadId === leadId) {
      if (messages.length > 0) {
        localStorage.setItem(`catapult_chat_${leadId}`, JSON.stringify(messages));
      } else {
        localStorage.removeItem(`catapult_chat_${leadId}`);
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
    <div className="glass-card flex flex-col h-[650px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-hairline bg-surface-1/40">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary-hover" />
          <h3 className="text-sm font-semibold text-ink">Lead Assistant</h3>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-ink-subtle hover:text-hot flex items-center gap-1 transition-colors px-2 py-1 rounded bg-surface-2/60 border border-hairline/40"
              title="Clear chat history for this lead"
            >
              <Trash2 className="w-3 h-3" />
              Clear History
            </button>
          )}
          <span className="text-xs text-ink-subtle">
            Powered by Groq
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-8 h-8 text-primary/40 mb-3" />
            <p className="text-sm font-medium text-ink-muted mb-1">
              Ask questions about this lead
            </p>
            <p className="text-xs text-ink-subtle">
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
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary-hover" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[88%] rounded-xl px-4 py-3 text-sm overflow-hidden shadow-sm",
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
                        Thinking...
                      </span>
                    )}
                  </>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-ink-muted" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_CHAT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-surface-1 border border-hairline hover:border-hairline-strong text-ink-muted hover:text-ink rounded-full px-3 py-1.5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-hairline bg-surface-1/40">
        <div className="flex items-center gap-2 bg-surface-1 rounded-xl border border-hairline p-2 focus-within:border-primary/50 transition-colors shadow-inner">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI lead assistant..."
            className="flex-1 bg-transparent border-0 px-3 py-1 text-sm text-ink placeholder:text-ink-subtle focus:outline-none resize-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary p-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
