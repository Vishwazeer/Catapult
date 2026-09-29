"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import LeadForm from "./lead-form";

interface LeadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (leadId: number) => void;
  leadId: number;
  leadData: Record<string, any>;
}

export default function LeadEditModal({ isOpen, onClose, onSuccess, leadId, leadData }: LeadEditModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Edit Lead</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-1 text-ink-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <LeadForm 
                editMode={{ leadId, initialData: leadData }} 
                onSuccess={(id) => {
                  onSuccess(id);
                  onClose();
                }} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
