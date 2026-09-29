"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageActionButtonsProps {
  text: string;
  phone?: string | null;
  email?: string | null;
  size?: "sm" | "md";
}

export default function MessageActionButtons({
  text,
  phone,
  email,
  size = "md",
}: MessageActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

  const mailUrl = email
    ? `mailto:${email}?subject=${encodeURIComponent("Property Information & Follow-up")}&body=${encodeURIComponent(text)}`
    : `mailto:?subject=${encodeURIComponent("Property Information & Follow-up")}&body=${encodeURIComponent(text)}`;

  const buttonPadding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "rounded-lg border border-hairline bg-surface-2 hover:bg-surface-3 text-ink font-medium transition-all flex items-center gap-1.5",
          buttonPadding
        )}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-ink-subtle" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-emerald-900/20",
          buttonPadding
        )}
        title={phone ? `Send WhatsApp message to ${phone}` : "Send on WhatsApp"}
      >
        <MessageCircle className="w-3.5 h-3.5 fill-current" />
        <span>Send on WhatsApp</span>
      </a>

      {/* Email Button */}
      <a
        href={mailUrl}
        className={cn(
          "rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-sky-900/20",
          buttonPadding
        )}
        title={email ? `Send Email to ${email}` : "Send via Email"}
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Send Email</span>
      </a>
    </div>
  );
}
