import React, { useState, useMemo } from 'react';
import {
  formatTime,
  generateSplits,
  secondsPerMileToKm,
  STANDARD_DISTANCES,
} from '../utils/paceMath';
import { SplitStrategy } from '../types/pace';
import { PaceBandModal } from './PaceBandModal';
import {
  BarChart3,
  Copy,
  Check,
  Zap,
  TrendingDown,
  TrendingUp,
  Flame,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  Mountain,
  Watch,
  Scroll,
} from 'lucide-react';

interface SplitTableGeneratorProps {
  initialDistanceMeters?: number;
  initialPaceSecPerMile?: number;
  preferredUnit: 'mi' | 'km';
  onSendToSms?: (distanceMeters: number, paceSecPerMile: number) => void;
}

export const SplitTableGenerator: React.FC<SplitTableGeneratorProps> = ({
  initialDistanceMeters = 5000,
  initialPaceSecPerMile = 480, // 8:00/mi
  preferredUnit,
  onSendToSms,
}) => {
  const [distanceMeters, setDistanceMeters] = useState<number>(initialDistanceMeters);
  const [customInputVal, setCustomInputVal] = useState<string>(
    (initialDistanceMeters / 1609.344).toFixed(2)
  );
  const [customUnit, setCustomUnit] = useState<'mi' | 'km' | 'm'>('mi');
  const [paceSecPerMile, setPaceSecPerMile] = useState<number>(initialPaceSecPerMile);

  const handleCustomInputChange = (valStr: string, unit: 'mi' | 'km' | 'm') => {
    setCustomInputVal(valStr);
    setCustomUnit(unit);
    const val = parseFloat(valStr);
    if (!isNaN(val) && val > 0) {
      let meters = val;
      if (unit === 'mi') meters = val * 1609.344;
      else if (unit === 'km') meters = val * 1000;
      setDistanceMeters(meters);
    }
  };

  const handleSelectPreset = (distMeters: number) => {
    setDistanceMeters(distMeters);
    const mi = distMeters / 1609.344;
    setCustomUnit('mi');
    setCustomInputVal(Number.isInteger(mi) ? mi.toString() : mi.toFixed(2));
  };

  const [splitUnit, setSplitUnit] = useState<'mi' | 'km' | 'lap400'>(
    preferredUnit === 'km' ? 'km' : 'mi'
  );
  const [strategy, setStrategy] = useState<SplitStrategy>('even');
  const [terrainProfile, setTerrainProfile] = useState<'flat' | 'rolling' | 'steep' | 'mountain'>('flat');
  const [customHillTaxSec, setCustomHillTaxSec] = useState<number>(0);

  const [isPaceBandModalOpen, setIsPaceBandModalOpen] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);

  // Generate splits using memoization with Terrain Profile Hill Tax
  const splits = useMemo(() => {
    return generateSplits(
      distanceMeters,
      paceSecPerMile,
      splitUnit,
      strategy,
      terrainProfile,
      customHillTaxSec
    );
  }, [distanceMeters, paceSecPerMile, splitUnit, strategy, terrainProfile, customHillTaxSec]);

  const totalTimeSeconds = useMemo(() => {
    return splits.reduce((acc, s) => acc + s.splitTimeSeconds, 0);
  }, [splits]);

  // Min and Max split paces for visual graph rendering
  const minPace = Math.min(...splits.map((s) => s.paceSecondsPerMile));
  const maxPace = Math.max(...splits.map((s) => s.paceSecondsPerMile));

  const handleCopySummary = () => {
    const distMi = (distanceMeters / 1609.344).toFixed(2);
    let summary = `PACE RACE - SPLIT PLAN\nEvent Distance: ${distMi} mi (${formatTime(totalTimeSeconds)})\nStrategy: ${strategy.toUpperCase()} | Terrain: ${terrainProfile.toUpperCase()}\n\n`;

    splits.forEach((s) => {
      const hillInfo = s.hillTaxSeconds ? ` [Hill Tax: ${s.hillTaxSeconds > 0 ? '+' : ''}${s.hillTaxSeconds}s/mi]` : '';
      summary += `${s.distanceLabel}: Split ${formatTime(s.splitTimeSeconds)} | Cum ${formatTime(s.cumulativeTimeSeconds)} | Pace ${formatTime(s.paceSecondsPerMile)}/mi${hillInfo}\n`;
    });

    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyCsv = () => {
    let csv = `Segment,Split Time,Cumulative Time,Mile Pace,Km Pace,Hill Tax Sec/Mi\n`;
    splits.forEach((s) => {
      csv += `"${s.distanceLabel}","${formatTime(s.splitTimeSeconds)}","${formatTime(s.cumulativeTimeSeconds)}","${formatTime(s.paceSecondsPerMile)}","${formatTime(s.paceSecondsPerKm)}","${s.hillTaxSeconds || 0}"\n`;
    });

    navigator.clipboard.writeText(csv);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#06b6d4] text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                TARGET SPLITS GENERATED
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Your Race Splits & Lap Guide</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Below are your exact mile, kilometer, or 400m track lap splits for a finish time of{' '}
              <strong className="text-[#facc15] font-mono">{formatTime(totalTimeSeconds)}</strong>!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPaceBandModalOpen(true)}
              className="bg-[#ff6b00] hover:bg-[#ea580c] active:scale-95 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#ff6b00]/20 flex items-center justify-center gap-2 min-h-[42px]"
            >
              <Watch className="w-4 h-4 text-white" />
              <span>Generate Pace Band / Wrist Card ⌚</span>
            </button>

            <a
              href={`sms:?body=${encodeURIComponent(
                `🏃 PACE RACE - Target Splits\nEvent: ${(distanceMeters / 1609.344).toFixed(2)} mi | Target: ${formatTime(totalTimeSeconds)}\nStrategy: ${strategy.toUpperCase()}\n\n` +
                splits.map(s => `${s.distanceLabel}: Split ${formatTime(s.splitTimeSeconds)} | Total ${formatTime(s.cumulativeTimeSeconds)}`).join('\n')
              )}`}
              className="bg-[#06b6d4] hover:bg-[#0891b2] active:scale-95 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 min-h-[42px]"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Text Splits</span>
            </a>
          </div>
        </div>
      </div>

      {/* Top Configuration Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-black text-white uppercase tracking-wider">
            Split Interval Unit:
          </div>

          {/* Unit selector for splits */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSplitUnit('mi')}
              className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all min-h-[38px] ${
                splitUnit === 'mi'
                  ? 'bg-[#ff6b00] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MILE SPLITS
            </button>
            <button
              onClick={() => setSplitUnit('km')}
              className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all min-h-[38px] ${
                splitUnit === 'km'
                  ? 'bg-[#06b6d4] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              KM SPLITS
            </button>
            <button
              onClick={() => setSplitUnit('lap400')}
              className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all min-h-[38px] ${
                splitUnit === 'lap400'
                  ? 'bg-[#facc15] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              400m TRACK LAPS
            </button>
          </div>
        </div>

        {/* Distance Selector with Direct Custom Typing & Presets */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Race Distance:
            </label>
            <span className="text-xs font-mono font-bold text-[#06b6d4]">
              {(distanceMeters / 1609.344).toFixed(2)} mi / {(distanceMeters / 1000).toFixed(2)} km
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Direct Input */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-400">Type:</span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={customInputVal}
                onChange={(e) => handleCustomInputChange(e.target.value, customUnit)}
                onFocus={(e) => e.target.select()}
                placeholder="e.g. 1.5"
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-black text-white focus:outline-none focus:border-[#06b6d4] font-mono text-center"
              />
              <select
                value={customUnit}
                onChange={(e) => handleCustomInputChange(customInputVal, e.target.value as 'mi' | 'km' | 'm')}
                className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] font-black text-[#06b6d4] focus:outline-none"
              >
                <option value="mi">mi</option>
                <option value="km">km</option>
                <option value="m">m</option>
              </select>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {STANDARD_DISTANCES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelectPreset(d.distanceMeters)}
                  className={`px-3 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all min-h-[38px] ${
                    Math.abs(distanceMeters - d.distanceMeters) < 10
                      ? 'bg-[#ff6b00] text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURE 1: Terrain Profile & Hill Tax Multiplier */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-[#06b6d4]" />
              <span>Terrain Profile & Course Hill Tax Multiplier:</span>
            </label>
            <span className="text-[11px] font-bold text-slate-400">
              Adjusts split pacing for uphill & downhill segments
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                setTerrainProfile('flat');
                setCustomHillTaxSec(0);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                terrainProfile === 'flat' && customHillTaxSec === 0
                  ? 'bg-slate-800 border-[#06b6d4] ring-1 ring-[#06b6d4]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-black text-xs text-white flex items-center gap-1">
                <span>Flat Course</span>
                <span className="text-[10px] text-emerald-400 font-mono">(0s Tax)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Track / flat road race</p>
            </button>

            <button
              onClick={() => {
                setTerrainProfile('rolling');
                setCustomHillTaxSec(0);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                terrainProfile === 'rolling'
                  ? 'bg-slate-800 border-[#ff6b00] ring-1 ring-[#ff6b00]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-black text-xs text-white flex items-center gap-1">
                <span>Rolling Hills</span>
                <span className="text-[10px] text-[#ff6b00] font-mono">(+3s/-2s)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Standard XC / park course</p>
            </button>

            <button
              onClick={() => {
                setTerrainProfile('steep');
                setCustomHillTaxSec(0);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                terrainProfile === 'steep'
                  ? 'bg-slate-800 border-[#facc15] ring-1 ring-[#facc15]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-black text-xs text-white flex items-center gap-1">
                <span>Steep Grade</span>
                <span className="text-[10px] text-[#facc15] font-mono">(+6s/-4s)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Significant hill climbs</p>
            </button>

            <button
              onClick={() => {
                setTerrainProfile('mountain');
                setCustomHillTaxSec(0);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                terrainProfile === 'mountain'
                  ? 'bg-slate-800 border-[#06b6d4] ring-1 ring-[#06b6d4]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-black text-xs text-white flex items-center gap-1">
                <span>Max Grade Limit</span>
                <span className="text-[10px] text-[#06b6d4] font-mono">(+9s Max)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Upper hill tax cap limit</p>
            </button>
          </div>
        </div>

        {/* Strategy Selector Pills */}
        <div className="pt-3 border-t border-slate-800">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">
            Pacing Plan Strategy:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            <button
              onClick={() => setStrategy('even')}
              className={`p-3 rounded-xl border text-left transition-all min-h-[50px] ${
                strategy === 'even'
                  ? 'bg-slate-800 border-[#06b6d4] ring-1 ring-[#06b6d4]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs text-white">
                <Zap className="w-3.5 h-3.5 text-[#06b6d4]" />
                <span>Steady / Even Pace</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Smooth & steady every lap</p>
            </button>

            <button
              onClick={() => setStrategy('negative')}
              className={`p-3 rounded-xl border text-left transition-all min-h-[50px] ${
                strategy === 'negative'
                  ? 'bg-slate-800 border-[#ff6b00] ring-1 ring-[#ff6b00]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs text-white">
                <TrendingDown className="w-3.5 h-3.5 text-[#ff6b00]" />
                <span>Strong Finish</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Start smart, finish faster</p>
            </button>

            <button
              onClick={() => setStrategy('positive')}
              className={`p-3 rounded-xl border text-left transition-all min-h-[50px] ${
                strategy === 'positive'
                  ? 'bg-slate-800 border-[#facc15] ring-1 ring-[#facc15]'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs text-white">
                <TrendingUp className="w-3.5 h-3.5 text-[#facc15]" />
                <span>Fast Start</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Out hard, hold on strong</p>
            </button>

            <button
              onClick={() => setStrategy('surge')}
              className={`p-3 rounded-xl border text-left transition-all min-h-[50px] ${
                strategy === 'surge'
                  ? 'bg-slate-800 border-purple-500 ring-1 ring-purple-500'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs text-white">
                <Flame className="w-3.5 h-3.5 text-purple-400" />
                <span>Start & Kick Surge</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Fast first & last lap kick</p>
            </button>

          </div>
        </div>

      </div>

      {/* Main Splits Table & Visual Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="text-sm font-black text-white">
              Target Finish Time:{' '}
              <span className="text-[#facc15] font-mono text-lg ml-1">
                {formatTime(totalTimeSeconds)}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Distance: {(distanceMeters / 1609.344).toFixed(2)} mi ({splits.length} splits)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaceBandModalOpen(true)}
              className="bg-[#ff6b00] hover:bg-[#ea580c] active:scale-95 text-white text-xs font-black py-2 px-3 rounded-lg transition-all shadow-md flex items-center gap-1.5 min-h-[40px]"
            >
              <Scroll className="w-4 h-4 text-white" />
              <span>Print Pace Band ⌚</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Copied Summary' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleCopyCsv}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              {copiedCsv ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4 text-[#06b6d4]" />}
              <span>{copiedCsv ? 'Copied CSV' : 'Copy CSV'}</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Segment / Lap</th>
                <th className="py-2.5 px-3">Split Time</th>
                <th className="py-2.5 px-3">Cumulative</th>
                <th className="py-2.5 px-3">Mile Pace</th>
                <th className="py-2.5 px-3">Terrain Tax</th>
                <th className="py-2.5 px-3">Pace Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {splits.map((s) => {
                // Calculate pace relative bar width
                const range = maxPace - minPace || 1;
                const ratio = (s.paceSecondsPerMile - minPace) / range;
                const barPercent = Math.max(15, Math.min(100, 100 - ratio * 70));

                return (
                  <tr key={s.number} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-sans font-black text-slate-200 whitespace-nowrap">
                      {s.distanceLabel}
                    </td>
                    <td className="py-3 px-3 font-black text-[#facc15] text-base">
                      {formatTime(s.splitTimeSeconds)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {formatTime(s.cumulativeTimeSeconds)}
                    </td>
                    <td className="py-3 px-3 text-[#ff6b00]">
                      {formatTime(s.paceSecondsPerMile)} /mi
                    </td>
                    <td className="py-3 px-3 font-sans text-xs">
                      {s.hillTaxSeconds && s.hillTaxSeconds > 0 ? (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1">
                          ⛰️ +{s.hillTaxSeconds}s/mi Tax
                        </span>
                      ) : s.hillTaxSeconds && s.hillTaxSeconds < 0 ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1">
                          📉 {s.hillTaxSeconds}s/mi Down
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium text-[11px]">
                          Flat
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 min-w-[120px]">
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ff6b00] to-[#06b6d4] transition-all duration-300"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Pace Band & Wrist Card Modal */}
      <PaceBandModal
        isOpen={isPaceBandModalOpen}
        onClose={() => setIsPaceBandModalOpen(false)}
        splits={splits}
        distanceMeters={distanceMeters}
        totalTimeSeconds={totalTimeSeconds}
        paceSecPerMile={paceSecPerMile}
      />

    </div>
  );
};

