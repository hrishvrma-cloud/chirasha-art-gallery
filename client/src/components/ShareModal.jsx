import React, { useState } from 'react';
import { X, Copy, Check, MessageSquareShare, Send } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, title, messageText, whatsappUrl }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageSquareShare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">{title || 'Share Message'}</h3>
            <p className="text-xs text-stone-500">Ready to post on WhatsApp or Social Media</p>
          </div>
        </div>

        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-5 font-mono text-xs text-stone-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {messageText}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Text'}
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition-all"
            >
              <Send className="w-4 h-4" />
              Open WhatsApp
            </a>
          ) : (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(messageText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition-all"
            >
              <Send className="w-4 h-4" />
              Share to WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
