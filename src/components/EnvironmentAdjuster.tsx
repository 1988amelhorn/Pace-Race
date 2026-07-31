import React, { useState, useMemo } from 'react';
import {
  calculateEnvironmentFactors,
  formatTime,
  secondsPerKmToMile,
  STANDARD_DISTANCES,
} from '../utils/paceMath';
import { EnvironmentalConditions } from '../types/pace';
import {
  Flame,
  Wind,
  Mountain,
  Gauge,
  Thermometer,
  ShieldAlert,
  Sun,
  TrendingUp,
} from 'lucide-react';

interface EnvironmentAdjusterProps {
  initialDistanceMeters?: number;
  initialPaceSecPerMile?: number;
  preferredUnit: 'mi' | 'km';
}

export const EnvironmentAdjuster: React.FC<EnvironmentAdjusterProps> = ({
  initialDistanceMeters = 5000,
  initialPaceSecPerMile = 480, // 8:00 /mi
  preferredUnit,
}) => {
  const [distanceMeters, setDistanceMeters] = useState<number>(initialDistanceMeters);
  const [customInputVal, setCustomInputVal] = useState<string>(
    (initialDistanceMeters / 1609.344).toFixed(2)
  );
  const [customUnit, setCustomUnit] = useState<'mi' | 'km' | 'm'>('mi');
  const [basePaceSecPerMile, setBasePaceSecPerMile] = useState<number>(initialPaceSecPerMile);

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

  const [env, setEnv] = useState<EnvironmentalConditions>({
    tempF: 82,
    humidityPercent: 65,
    altitudeFeet: 2500,
    windMph: 12,
    windType: 'headwind',
    gradePercent: 1.5,
  });

  // Calculate environmental impacts using memoization
  const result = useMemo(() => {
    return calculateEnvironmentFactors(basePaceSecPerMile, distanceMeters, env);
  }, [basePaceSecPerMile, distanceMeters, env]);

  const baseTotalTimeSec = useMemo(() => {
    return (basePaceSecPerMile * distanceMeters) / 1609.344;
  }, [distanceMeters, basePaceSecPerMile]);

  const cautionBadgeStyles = {
    optimal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'OPTIMAL CONDITIONS' },
    moderate: { bg: 'bg-[#facc15]/10', text: 'text-[#facc15]', border: 'border-[#facc15]/30', label: 'MODERATE HEAT CAUTION' },
    high: { bg: 'bg-[#ff6b00]/10', text: 'text-[#ff6b00]', border: 'border-[#ff6b00]/30', label: 'HIGH HEAT STRESS' },
    hazardous: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'HAZARDOUS HEAT WARNING' },
  }[result.heatCautionLevel];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#ff6b00]" />
              <span>Weather & Altitude Pace Correction</span>
            </h2>
            <p className="text-xs text-slate-400">
              Calculate exact pace slowdowns from Heat, Humidity, Dew Point, Wind, Grade, & Elevation.
            </p>
          </div>

          <div className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-wider flex items-center gap-2 ${cautionBadgeStyles.bg} ${cautionBadgeStyles.text} ${cautionBadgeStyles.border}`}>
            <ShieldAlert className="w-4 h-4" />
            <span>{cautionBadgeStyles.label}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Impact Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input Sliders */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          
          {/* Base Race & Distance Picker */}
          <div className="pb-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Baseline Target Event & Cool-Weather Pace
              </label>
              <span className="text-xs font-mono font-bold text-[#06b6d4]">
                {(distanceMeters / 1609.344).toFixed(2)} mi
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Custom Input */}
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
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {STANDARD_DISTANCES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectPreset(d.distanceMeters)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all min-h-[38px] ${
                      Math.abs(distanceMeters - d.distanceMeters) < 10
                        ? 'bg-[#ff6b00] text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Baseline Mile Pace
                </label>
                <input
                  type="text"
                  value={formatTime(basePaceSecPerMile)}
                  onChange={(e) => {
                    const parsed = (e.target.value);
                    if (parsed) {
                      const sec = parseInt(parsed) || basePaceSecPerMile;
                      setBasePaceSecPerMile(sec);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-lg font-bold text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Baseline Finish Time
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-lg font-bold text-[#facc15] font-mono">
                  {formatTime(baseTotalTimeSec)}
                </div>
              </div>
            </div>
          </div>

          {/* Temperature & Humidity Sliders */}
          <div className="space-y-4">
            
            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-[#ff6b00]" /> Air Temperature
                </span>
                <span className="text-[#ff6b00] font-mono text-sm">{env.tempF} °F ({Math.round((env.tempF - 32) * 5/9)} °C)</span>
              </div>
              <input
                type="range"
                min="40"
                max="110"
                value={env.tempF}
                onChange={(e) => setEnv({ ...env, tempF: parseFloat(e.target.value) })}
                className="w-full accent-[#ff6b00] bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Relative Humidity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1">
                  <Sun className="w-4 h-4 text-[#06b6d4]" /> Relative Humidity
                </span>
                <span className="text-[#06b6d4] font-mono text-sm">{env.humidityPercent} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={env.humidityPercent}
                onChange={(e) => setEnv({ ...env, humidityPercent: parseFloat(e.target.value) })}
                className="w-full accent-[#06b6d4] bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>Calculated Dew Point:</span>
                <span className="font-mono font-extrabold text-[#facc15]">{result.dewPointF} °F</span>
              </div>
            </div>

            {/* Wind Speed & Type */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1">
                  <Wind className="w-4 h-4 text-[#facc15]" /> Wind Speed & Direction
                </span>
                <span className="text-[#facc15] font-mono text-sm">{env.windMph} mph</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="35"
                value={env.windMph}
                onChange={(e) => setEnv({ ...env, windMph: parseFloat(e.target.value) })}
                className="w-full accent-[#facc15] bg-slate-950 h-2 rounded-lg cursor-pointer mb-2"
              />

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'none', label: 'Calm' },
                  { id: 'headwind', label: 'Headwind' },
                  { id: 'tailwind', label: 'Tailwind' },
                  { id: 'crosswind', label: 'Crosswind' },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setEnv({ ...env, windType: w.id as any })}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all min-h-[36px] ${
                      env.windType === w.id
                        ? 'bg-[#facc15] text-slate-950 border-[#facc15]'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Altitude & Grade */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Mountain className="w-4 h-4 text-emerald-400" /> Altitude
                  </span>
                  <span className="text-emerald-400 font-mono text-sm">{env.altitudeFeet} ft ({(env.altitudeFeet * 0.3048).toFixed(0)} m)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="250"
                  value={env.altitudeFeet}
                  onChange={(e) => setEnv({ ...env, altitudeFeet: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-purple-400" /> Elevation Grade / Incline
                  </span>
                  <span className="text-purple-400 font-mono text-sm">{env.gradePercent > 0 ? `+${env.gradePercent}` : env.gradePercent}%</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="10"
                  step="0.5"
                  value={env.gradePercent}
                  onChange={(e) => setEnv({ ...env, gradePercent: parseFloat(e.target.value) })}
                  className="w-full accent-purple-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

            </div>

          </div>

        </div>

        {/* Right Environment Adjustment Output Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#ff6b00]" />
              <span>Real Feel Adjusted Race Output</span>
            </h3>

            {/* Total Adjustment Percentage */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Total Pace Penalty</div>
                <div className="text-2xl font-black text-[#ff6b00]">
                  +{result.totalAdjustmentPercent}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase">Time Loss</div>
                <div className="text-xl font-mono font-extrabold text-[#facc15]">
                  +{formatTime(result.timeDifferenceSeconds)}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-2 text-xs">
              
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 font-medium">Original Cool-Day Pace:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatTime(basePaceSecPerMile)} /mi
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-[#ff6b00]/40">
                <span className="text-slate-300 font-bold">Real Feel Adjusted Pace:</span>
                <span className="font-mono font-black text-lg text-[#ff6b00]">
                  {formatTime(result.adjustedPaceSecondsPerMile)} /mi
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 font-medium">Original Target Time:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatTime(baseTotalTimeSec)}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-[#facc15]/40">
                <span className="text-slate-300 font-bold">Adjusted Expected Finish:</span>
                <span className="font-mono font-black text-lg text-[#facc15]">
                  {formatTime(result.adjustedTotalTimeSeconds)}
                </span>
              </div>

            </div>

            {/* Impact Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Factor Breakdown
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Heat / Humidity:</span>
                  <span className="text-[#ff6b00] font-bold">+{result.heatDewImpactPercent}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Altitude:</span>
                  <span className="text-emerald-400 font-bold">+{result.altitudeImpactPercent}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Wind Drag:</span>
                  <span className="text-[#facc15] font-bold">+{result.windImpactPercent}%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Grade / Incline:</span>
                  <span className="text-purple-400 font-bold">+{result.gradeImpactPercent}%</span>
                </div>
              </div>
            </div>

            {/* Coach & Athlete Guidance Note */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-[#06b6d4] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Coach Strategy Recommendation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Do not force baseline cool-weather splits in these conditions. Adjust your race plan to target <strong className="text-white">{formatTime(result.adjustedPaceSecondsPerMile)} /mi</strong> to prevent early cardiac fatigue and overheating. Hydrate with electrolyte mix every 15-20 minutes.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
