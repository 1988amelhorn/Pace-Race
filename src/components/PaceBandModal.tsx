import React, { useState } from 'react';
import { SplitItem } from '../types/pace';
import { formatTime, STANDARD_DISTANCES } from '../utils/paceMath';
import { Printer, X, Copy, Check, Smartphone, Watch, Scroll, Sparkles, User } from 'lucide-react';

interface PaceBandModalProps {
  isOpen: boolean;
  onClose: () => void;
  splits: SplitItem[];
  distanceMeters: number;
  totalTimeSeconds: number;
  paceSecPerMile: number;
}

export const PaceBandModal: React.FC<PaceBandModalProps> = ({
  isOpen,
  onClose,
  splits,
  distanceMeters,
  totalTimeSeconds,
  paceSecPerMile,
}) => {
  const [athleteName, setAthleteName] = useState<string>('Runner');
  const [bibNumber, setBibNumber] = useState<string>('#101');
  const [cardMode, setCardMode] = useState<'wristband' | 'lockscreen' | 'watch'>('wristband');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen) return null;

  const eventName =
    STANDARD_DISTANCES.find((d) => Math.abs(d.distanceMeters - distanceMeters) < 10)?.name ||
    `${(distanceMeters / 1609.344).toFixed(2)} Miles`;

  const paceMileFormatted = formatTime(paceSecPerMile);
  const totalTimeFormatted = formatTime(totalTimeSeconds);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let cardText = `⌚ ${eventName} PACE BAND - ${athleteName} (${bibNumber})\nTarget Time: ${totalTimeFormatted} | Avg Pace: ${paceMileFormatted}/mi\n`;
    cardText += `------------------------------------\n`;
    splits.forEach((s) => {
      cardText += `${s.distanceLabel.padEnd(14)} Split: ${formatTime(s.splitTimeSeconds)} | Cum: ${formatTime(s.cumulativeTimeSeconds)}\n`;
    });
    navigator.clipboard.writeText(cardText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Printable Wrapper for CSS print mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-wristband, #printable-wristband * {
            visibility: visible !important;
          }
          #printable-wristband {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 1.25in !important;
            padding: 0.1in !important;
            background: white !important;
            color: black !important;
            border: 2px solid black !important;
            font-family: monospace !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff6b00] text-white flex items-center justify-center font-black">
              ⌚
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Pace Band & Wrist Card Generator</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Printable 1" Wristband, Phone Lock Screen Wallpaper & Watch Tattoo
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

        {/* Customization Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-[#06b6d4]" /> Athlete Name
            </label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Bib # or Goal
            </label>
            <input
              type="text"
              value={bibNumber}
              onChange={(e) => setBibNumber(e.target.value)}
              placeholder="e.g. #204 or PR Goal"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]"
            />
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setCardMode('wristband')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              cardMode === 'wristband'
                ? 'bg-[#ff6b00] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>1" Paper Wristband</span>
          </button>
          <button
            onClick={() => setCardMode('lockscreen')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              cardMode === 'lockscreen'
                ? 'bg-[#06b6d4] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Lockscreen</span>
          </button>
          <button
            onClick={() => setCardMode('watch')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              cardMode === 'watch'
                ? 'bg-[#facc15] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Watch className="w-3.5 h-3.5" />
            <span>Watch Tattoo</span>
          </button>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="flex justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800 min-h-[300px]">
          
          {/* MODE 1: 1-inch Printable Paper Wristband */}
          {cardMode === 'wristband' && (
            <div
              id="printable-wristband"
              className="bg-white text-slate-950 font-mono w-[160px] sm:w-[180px] p-3 rounded-md shadow-2xl border-2 border-slate-900 text-[11px] leading-tight select-all flex flex-col justify-between space-y-2"
            >
              <div className="border-b-2 border-slate-900 pb-1.5 text-center">
                <div className="font-black text-xs uppercase tracking-tighter truncate">{eventName}</div>
                <div className="font-bold text-[10px] text-slate-700">{athleteName} {bibNumber}</div>
                <div className="bg-slate-950 text-white font-black text-[11px] px-1.5 py-0.5 rounded mt-1">
                  GOAL: {totalTimeFormatted}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-black text-[9px] uppercase border-b border-slate-300 pb-0.5 text-slate-600">
                  <span>MARK</span>
                  <span>SPLIT</span>
                  <span>CUMUL</span>
                </div>
                {splits.map((s) => (
                  <div key={s.number} className="flex justify-between items-center text-[10px] font-bold">
                    <span className="truncate max-w-[45px]">{s.distanceLabel.replace('Mile ', 'M').replace('Lap ', 'L').replace('Finish', 'FIN')}</span>
                    <span className="text-slate-600">{formatTime(s.splitTimeSeconds)}</span>
                    <span className="font-black text-slate-950">{formatTime(s.cumulativeTimeSeconds)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-slate-900 pt-1 text-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                ✂️ Cut out & Tape to Wrist
              </div>
            </div>
          )}

          {/* MODE 2: Phone Lockscreen Wallpaper Tattoo */}
          {cardMode === 'lockscreen' && (
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-slate-800 rounded-[32px] w-[240px] sm:w-[260px] p-4 text-white shadow-2xl flex flex-col justify-between space-y-3 font-sans">
              <div className="text-center border-b border-slate-800 pb-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#06b6d4] flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> RACE DAY TATTOO
                </div>
                <h4 className="text-base font-black uppercase text-white mt-0.5 tracking-tight">{eventName}</h4>
                <div className="text-2xl font-black font-mono text-[#ff6b00] mt-1">{totalTimeFormatted}</div>
                <p className="text-[10px] font-bold text-slate-400">Target Pace: {paceMileFormatted}/mi</p>
              </div>

              <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                  <span>SEGMENT</span>
                  <span>SPLIT</span>
                  <span>CLOCK</span>
                </div>
                {splits.map((s) => (
                  <div key={s.number} className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="text-slate-300">{s.distanceLabel}</span>
                    <span className="text-slate-400">{formatTime(s.splitTimeSeconds)}</span>
                    <span className="text-[#06b6d4] font-black">{formatTime(s.cumulativeTimeSeconds)}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 border-t border-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                Screenshot & set as Lock Screen
              </div>
            </div>
          )}

          {/* MODE 3: Watch Lap Tattoo */}
          {cardMode === 'watch' && (
            <div className="bg-slate-900 border-2 border-[#facc15]/50 rounded-2xl w-full max-w-md p-4 text-white shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] font-black text-[#facc15] uppercase tracking-wider">
                    ⌚ TRACK LAP CUE CARD
                  </span>
                  <h4 className="text-sm font-black">{eventName} — {totalTimeFormatted}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-slate-300">{paceMileFormatted}/mi</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {splits.map((s) => (
                  <div key={s.number} className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase truncate">{s.distanceLabel}</div>
                    <div className="text-sm font-black font-mono text-[#facc15] mt-0.5">
                      {formatTime(s.cumulativeTimeSeconds)}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500">
                      Split: {formatTime(s.splitTimeSeconds)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-[#ff6b00] hover:bg-[#ea580c] active:scale-95 text-white font-black text-xs py-3 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print 1" Wristband Cutout</span>
          </button>

          <button
            onClick={handleCopyText}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-black text-xs py-3 px-5 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Pace Band Text!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#06b6d4]" />
                <span>Copy Band Text</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
