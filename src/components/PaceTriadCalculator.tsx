import React, { useState, useMemo } from 'react';
import {
  formatTime,
  parseTimeToSeconds,
  secondsPerKmToMile,
  secondsPerMileToKm,
  STANDARD_DISTANCES,
} from '../utils/paceMath';
import { Timer, Zap, Gauge, Flame, ArrowRightLeft, Plus, Minus, Send, Sparkles, MessageSquare } from 'lucide-react';

interface PaceTriadCalculatorProps {
  preferredUnit: 'mi' | 'km';
  onSendToSplits?: (distanceMeters: number, paceSecPerMile: number) => void;
  onSendToEnv?: (distanceMeters: number, paceSecPerMile: number) => void;
  onSendToSms?: (distanceMeters: number, paceSecPerMile: number) => void;
}

export const PaceTriadCalculator: React.FC<PaceTriadCalculatorProps> = ({
  preferredUnit,
  onSendToSplits,
  onSendToEnv,
  onSendToSms,
}) => {
  // Distance selection (preset or custom)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('5k');
  const [customDistanceMeters, setCustomDistanceMeters] = useState<number>(5000);
  const [customInputVal, setCustomInputVal] = useState<string>('3.11');
  const [customUnit, setCustomUnit] = useState<'mi' | 'km' | 'm'>('mi');

  // Raw time input string
  const [goalTimeString, setGoalTimeString] = useState<string>('20:00');
  const [copiedSms, setCopiedSms] = useState<boolean>(false);
  
  // Convert goal time string to seconds
  const goalTimeSeconds = useMemo(() => {
    return parseTimeToSeconds(goalTimeString) || 1200; // 20:00 default
  }, [goalTimeString]);

  // Handle direct custom distance typing
  const handleCustomInputChange = (valStr: string, unit: 'mi' | 'km' | 'm') => {
    setCustomInputVal(valStr);
    setCustomUnit(unit);

    const val = parseFloat(valStr);
    if (!isNaN(val) && val > 0) {
      let meters = val;
      if (unit === 'mi') meters = val * 1609.344;
      else if (unit === 'km') meters = val * 1000;
      setCustomDistanceMeters(meters);

      // Check if matches standard distance preset
      const match = STANDARD_DISTANCES.find((d) => Math.abs(d.distanceMeters - meters) < 1);
      if (match) {
        setSelectedPresetId(match.id);
      } else {
        setSelectedPresetId('custom');
      }
    }
  };

  // Handle Preset distance selection
  const handleSelectPreset = (distId: string) => {
    setSelectedPresetId(distId);
    const distObj = STANDARD_DISTANCES.find((d) => d.id === distId);
    if (distObj) {
      setCustomDistanceMeters(distObj.distanceMeters);
      if (distObj.defaultUnit === 'm') {
        setCustomUnit('m');
        setCustomInputVal(distObj.distanceMeters.toString());
      } else if (distObj.defaultUnit === 'km') {
        setCustomUnit('km');
        setCustomInputVal((distObj.distanceMeters / 1000).toString());
      } else {
        setCustomUnit('mi');
        const mi = distObj.distanceMeters / 1609.344;
        setCustomInputVal(Number.isInteger(mi) ? mi.toString() : mi.toFixed(2));
      }
    }
  };

  // Calculations
  const calculatedResult = useMemo(() => {
    const distMeters = customDistanceMeters;
    const timeSec = goalTimeSeconds;
    
    // Calculate Pace from Distance & Time
    let paceMileSec = 480; // default 8:00
    if (distMeters > 0 && timeSec > 0) {
      paceMileSec = (timeSec / distMeters) * 1609.344;
    }

    const paceKmSec = secondsPerMileToKm(paceMileSec);
    const miles = distMeters / 1609.344;
    const km = distMeters / 1000;
    const mph = paceMileSec > 0 ? 3600 / paceMileSec : 0;
    const kph = paceKmSec > 0 ? 3600 / paceKmSec : 0;

    const track400mSec = (paceMileSec * 400) / 1609.344;
    const track200mSec = track400mSec / 2;

    const estCalories = Math.round(miles * 105);

    return {
      distMeters,
      miles,
      km,
      timeSec,
      paceMileSec,
      paceKmSec,
      mph,
      kph,
      track400mSec,
      track200mSec,
      estCalories,
    };
  }, [customDistanceMeters, goalTimeSeconds]);

  // Modifiers
  const adjustGoalTime = (deltaSeconds: number) => {
    const nextSec = Math.max(1, goalTimeSeconds + deltaSeconds);
    setGoalTimeString(formatTime(nextSec));
  };

  // Popular youth / team goal presets
  const popularGoals = [
    { label: 'Sub-20 5K', distId: '5k', time: '19:59' },
    { label: 'Sub-18 5K', distId: '5k', time: '17:59' },
    { label: 'Sub-5 Mile', distId: '1600m', time: '4:59' },
    { label: 'Sub-6 Mile', distId: '1600m', time: '5:59' },
    { label: 'Sub-2:10 800m', distId: '800m', time: '2:09' },
    { label: 'Sub-60s 400m', distId: '400m', time: '0:59' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Friendly Colorful Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#ff6b00] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                SUPER SIMPLE
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Pace & Split Calculator</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Pick your race distance, type your goal time, and see instant splits & lap paces!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 px-3 py-1.5 rounded-full border border-[#06b6d4]/30 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#06b6d4]" />
              <span>For College, High School & Club Athletes!</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Easy 2-Step Input Form */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* STEP 1: Select or Type Distance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ff6b00] text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-white">
                  Choose or Type Race Distance
                </label>
              </div>
              <span className="text-xs font-bold text-[#06b6d4]">
                {calculatedResult.miles.toFixed(2)} mi / {calculatedResult.km.toFixed(2)} km
              </span>
            </div>

            {/* Direct Type Input Box */}
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Type Custom Distance (e.g. 1.5, 3.25, 1200)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={customInputVal}
                  onChange={(e) => handleCustomInputChange(e.target.value, customUnit)}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 1.5"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-lg font-black text-white focus:outline-none focus:border-[#ff6b00] font-mono text-center"
                />
                <select
                  value={customUnit}
                  onChange={(e) => handleCustomInputChange(customInputVal, e.target.value as 'mi' | 'km' | 'm')}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-[#06b6d4] focus:outline-none focus:border-[#06b6d4]"
                >
                  <option value="mi">Miles (mi)</option>
                  <option value="km">Kilometers (km)</option>
                  <option value="m">Meters (m)</option>
                </select>
              </div>
            </div>

            {/* Or Select Standard Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Or Select Preset Event
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                {STANDARD_DISTANCES.map((dist) => {
                  const isSelected = selectedPresetId === dist.id;
                  return (
                    <button
                      key={dist.id}
                      onClick={() => handleSelectPreset(dist.id)}
                      className={`px-2 py-2 rounded-xl font-black text-xs transition-all text-center min-h-[40px] flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/30 border-2 border-white/20'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {dist.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Input Goal Time Here */}
          <div className="bg-slate-900 border-2 border-[#06b6d4] rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#06b6d4] text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-[#06b6d4]">
                  Input Goal Time Here
                </label>
              </div>
              <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Type e.g. 20:00 or 5:30
              </span>
            </div>

            {/* Big Prominent Goal Time Box */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={goalTimeString}
                  onChange={(e) => setGoalTimeString(e.target.value)}
                  placeholder="Input Goal Time Here (e.g., 20:00)"
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-4 py-3.5 text-3xl font-black text-white focus:outline-none focus:border-[#06b6d4] text-center font-mono tracking-wider placeholder:text-slate-600 placeholder:text-base placeholder:font-sans"
                />
              </div>

              {/* Quick Time Adjuster Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  onClick={() => adjustGoalTime(-60)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 py-2.5 rounded-xl transition-all min-h-[42px]"
                >
                  -1 Min
                </button>
                <button
                  onClick={() => adjustGoalTime(-5)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 py-2.5 rounded-xl transition-all min-h-[42px]"
                >
                  -5 Sec
                </button>
                <button
                  onClick={() => adjustGoalTime(5)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 py-2.5 rounded-xl transition-all min-h-[42px]"
                >
                  +5 Sec
                </button>
                <button
                  onClick={() => adjustGoalTime(60)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 py-2.5 rounded-xl transition-all min-h-[42px]"
                >
                  +1 Min
                </button>
              </div>
            </div>

            {/* Quick Goal Presets for Kids & Teens */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[10px] font-black uppercase text-slate-400 mb-2">
                Popular Target Goals:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularGoals.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSelectPreset(g.distId);
                      setGoalTimeString(g.time);
                    }}
                    className="text-[11px] font-bold bg-slate-950 hover:bg-slate-800 text-[#facc15] px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all min-h-[34px]"
                  >
                    ⚡ {g.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Instant Calculated Target Paces & Actions */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#ff6b00]" />
                <span>Target Paces Generated</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Instant Calculation
              </span>
            </div>

            {/* Big Result Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Mile Pace */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400">Target Mile Pace</div>
                <div className="text-2xl sm:text-3xl font-black text-[#ff6b00] font-mono">
                  {formatTime(calculatedResult.paceMileSec)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">per mile</div>
              </div>

              {/* KM Pace */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400">Target KM Pace</div>
                <div className="text-2xl sm:text-3xl font-black text-[#06b6d4] font-mono">
                  {formatTime(calculatedResult.paceKmSec)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">per kilometer</div>
              </div>

            </div>

            {/* Track 400m Lap Speed - Essential for track kids */}
            <div className="bg-slate-950 p-4 rounded-xl border-2 border-[#facc15]/40 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase text-slate-300 flex items-center gap-1">
                  🏃 <span>400m Track Lap Target</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Your exact pace for 1 lap around a standard track
                </div>
              </div>
              <div className="text-2xl font-black text-[#facc15] font-mono">
                {formatTime(calculatedResult.track400mSec, true)}
              </div>
            </div>

            {/* Secondary Speed Details */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-sans font-bold">Speed</div>
                <div className="font-bold text-white mt-0.5">{calculatedResult.mph.toFixed(1)} mph</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-sans font-bold">Metric</div>
                <div className="font-bold text-white mt-0.5">{calculatedResult.kph.toFixed(1)} kph</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-sans font-bold">200m Lap</div>
                <div className="font-bold text-[#facc15] mt-0.5">{formatTime(calculatedResult.track200mSec, true)}</div>
              </div>
            </div>

            {/* ACTION BUTTONS: View Splits & Send via Text */}
            <div className="space-y-2 pt-2">
              
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`sms:?body=${encodeURIComponent(
                    `🏃 PACE RACE Target Plan\nEvent: ${STANDARD_DISTANCES.find((d) => d.id === selectedPresetId)?.name || 'Race'}\nGoal Time: ${formatTime(calculatedResult.timeSec)}\nTarget Pace: ${formatTime(calculatedResult.paceMileSec)}/mi (${formatTime(calculatedResult.paceKmSec)}/km)\n400m Lap: ${formatTime(calculatedResult.track400mSec, true)}`
                  )}`}
                  className="bg-[#06b6d4] hover:bg-[#0891b2] active:scale-95 text-slate-950 font-black text-xs py-3 px-3 rounded-xl transition-all shadow-md shadow-[#06b6d4]/20 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Text Paces (SMS)</span>
                </a>

                <button
                  onClick={() => {
                    const distName = STANDARD_DISTANCES.find((d) => d.id === selectedPresetId)?.name || 'Race';
                    const text = `🏃 PACE RACE Target Plan\nEvent: ${distName}\nGoal Time: ${formatTime(calculatedResult.timeSec)}\nTarget Pace: ${formatTime(calculatedResult.paceMileSec)}/mi (${formatTime(calculatedResult.paceKmSec)}/km)\n400m Lap: ${formatTime(calculatedResult.track400mSec, true)}\nSpeed: ${calculatedResult.mph.toFixed(1)} mph`;
                    navigator.clipboard.writeText(text);
                    setCopiedSms(true);
                    setTimeout(() => setCopiedSms(false), 2000);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs py-3 px-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {copiedSms ? 'Copied Paces!' : 'Copy Text'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onSendToSplits && (
                  <button
                    onClick={() =>
                      onSendToSplits(
                        calculatedResult.distMeters,
                        calculatedResult.paceMileSec
                      )
                    }
                    className="bg-[#ff6b00] hover:bg-[#e05e00] active:scale-98 text-white font-black text-xs py-3 px-3 rounded-xl transition-all shadow-md shadow-[#ff6b00]/20 flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>View Race Splits</span>
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                )}

                {onSendToEnv && (
                  <button
                    onClick={() =>
                      onSendToEnv(
                        calculatedResult.distMeters,
                        calculatedResult.paceMileSec
                      )
                    }
                    className="bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold text-xs py-3 px-3 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Flame className="w-4 h-4 text-[#06b6d4]" />
                    <span>Adjust for Weather</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
