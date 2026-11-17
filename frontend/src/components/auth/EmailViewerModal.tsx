import React from 'react';
import { X, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { EmailNotification } from '../../types';

interface EmailViewerModalProps {
  email: EmailNotification | null;
  onClose: () => void;
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[85vh] rounded-3xl bg-[#111318] border border-[#FFD600]/40 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#08090B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">Dispatched Email Notification</h3>
              <p className="text-[11px] text-[#00FF88] flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Successfully Delivered to {email.to}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#9297A2] hover:text-white rounded-lg bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="px-6 py-3 bg-[#171A20] border-b border-white/5 text-xs space-y-1">
          <div className="text-white font-medium">{email.subject}</div>
          <div className="text-[#9297A2] text-[11px]">
            To: <span className="text-[#FFD600] font-mono">{email.to}</span> &bull; {email.timestamp}
          </div>
        </div>

        {/* Rendered HTML Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#08090B]">
          <div
            className="prose prose-invert max-w-none text-xs"
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#08090B] flex items-center justify-between text-xs">
          <span className="text-[#9297A2] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D8FF]" /> Encrypted Session Notice
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#FFD600] text-[#08090B] font-semibold text-xs shadow-md"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
