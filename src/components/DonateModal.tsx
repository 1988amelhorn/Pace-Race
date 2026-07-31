import React, { useState } from 'react';
import { X, Heart, DollarSign, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [cashtag, setCashtag] = useState<string>('$MelhornAaron');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyCashtag = () => {
    navigator.clipboard.writeText(cashtag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cashAppUrl = `https://cash.app/${cashtag.startsWith('$') ? cashtag : '$' + cashtag}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 text-xl">
              $
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>Donate via Cash App</span>
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Support Pace Race Pro development
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cash App Card */}
        <div className="bg-gradient-to-br from-emerald-950/60 via-slate-950 to-emerald-950/40 border-2 border-emerald-500/40 p-5 rounded-2xl text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              GREEN LIGHT ON CASH APP
            </span>
            <h4 className="text-xl font-black text-white mt-1">Thank You For Your Support!</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              Your donations help keep Pace Race Pro fast, ad-free, and packed with new features for coaches and runners.
            </p>
          </div>

          {/* Editable Cashtag box */}
          <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 pl-2 text-emerald-400 font-mono font-black text-base">
              <DollarSign className="w-5 h-5 shrink-0" />
              <input
                type="text"
                value={cashtag}
                onChange={(e) => setCashtag(e.target.value)}
                placeholder="$cashtag"
                className="bg-transparent text-white font-mono font-bold text-sm focus:outline-none w-full"
              />
            </div>
            <button
              onClick={handleCopyCashtag}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              href={cashAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 min-h-[46px] cursor-pointer active:scale-95"
            >
              <DollarSign className="w-5 h-5 fill-slate-950" />
              <span>Open Cash App & Donate Now</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>

            <p className="text-[10px] text-slate-500 font-medium">
              Clicking will open <span className="text-slate-400 font-mono">{cashAppUrl}</span> in a new tab
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 font-medium pt-1">
          Every contribution is greatly appreciated! Happy racing! 🏃‍♂️💨
        </div>

      </div>
    </div>
  );
};
