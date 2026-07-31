import React, { useState, useEffect, useRef } from 'react';
import { formatTime, parseTimeToSeconds } from '../utils/paceMath';
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Copy,
  Check,
  User,
  Sparkles,
  Flame,
} from 'lucide-react';

interface LapRecord {
  lapNumber: number;
  splitSeconds: number;
  cumulativeSeconds: number;
  targetSeconds: number;
  deltaSeconds: number; // negative = ahead (faster), positive = behind (slower)
}

export const CoachStopwatch: React.FC = () => {
  const [athleteName, setAthleteName] = useState<string>('Jordan');
  const [workoutTitle, setWorkoutTitle] = useState<string>('Track Workout / Lap Reps');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [targetSplitStr, setTargetSplitStr] = useState<string>('01:15'); // 75s target lap
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const lastLapMsRef = useRef<number>(0);

  const targetSplitSec = parseTimeToSeconds(targetSplitStr) || 75;

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - startTimeRef.current;
        setElapsedMs(accumulatedMsRef.current + delta);
      }, 50); // 20 updates/sec for smooth tenths
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    if (isRunning) {
      accumulatedMsRef.current = elapsedMs;
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedMs(0);
    accumulatedMsRef.current = 0;
    lastLapMsRef.current = 0;
    setLaps([]);
  };

  const handleRecordLap = () => {
    if (elapsedMs === 0) return;

    const currentTotalSec = elapsedMs / 1000;
    const lastLapTotalSec = lastLapMsRef.current / 1000;
    const splitSec = currentTotalSec - lastLapTotalSec;

    const delta = splitSec - targetSplitSec; // negative = faster than target

    const newLap: LapRecord = {
      lapNumber: laps.length + 1,
      splitSeconds: splitSec,
      cumulativeSeconds: currentTotalSec,
      targetSeconds: targetSplitSec,
      deltaSeconds: delta,
    };

    setLaps([newLap, ...laps]);
    lastLapMsRef.current = elapsedMs;
  };

  const currentLapElapsedSec = (elapsedMs - lastLapMsRef.current) / 1000;

  // Generate friendly SMS Text message for stopwatch results
  const generateStopwatchSms = () => {
    let msg = `⏱️ PACE RACE - Coach Workout Results for ${athleteName || 'Athlete'}!\n\n`;
    msg += `📋 Workout: ${workoutTitle || 'Track Practice'}\n`;
    msg += `⏱️ Total Time: ${formatTime(elapsedMs / 1000, true)}\n`;
    msg += `🎯 Target Lap Split: ${formatTime(targetSplitSec)}\n`;

    if (laps.length > 0) {
      msg += `\n📊 Lap Splits (${laps.length} Total Laps):\n`;
      // Show chronologically
      const chronoLaps = [...laps].reverse();
      chronoLaps.forEach((lap) => {
        const gapText = lap.deltaSeconds <= 0 ? `(-${Math.abs(lap.deltaSeconds).toFixed(1)}s)` : `(+${Math.abs(lap.deltaSeconds).toFixed(1)}s)`;
        msg += `Lap ${lap.lapNumber}: ${formatTime(lap.splitSeconds, true)} ${gapText} | Total: ${formatTime(lap.cumulativeSeconds, true)}\n`;
      });
    }

    msg += `\n🔥 Awesome work out there! Keep pushing!`;
    return msg;
  };

  const smsMessage = generateStopwatchSms();

  const handleCopySms = () => {
    navigator.clipboard.writeText(smsMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const smsUri = `sms:?body=${encodeURIComponent(smsMessage)}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#ff6b00]" />
              <span>Coach Live Stopwatch & SMS Split Sender</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Time live laps, record target split gaps, and text the full workout splits directly to your runners!
            </p>
          </div>
          <span className="text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 px-3 py-1.5 rounded-full border border-[#06b6d4]/30 self-start sm:self-auto flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Live Split Logger</span>
          </span>
        </div>
      </div>

      {/* Workout Setup Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Athlete Name</label>
          <input
            type="text"
            value={athleteName}
            onChange={(e) => setAthleteName(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]"
            placeholder="e.g. Jordan, Team"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Workout Title</label>
          <input
            type="text"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#06b6d4]"
            placeholder="e.g. 4x400m Reps"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Target Lap Split Time</label>
          <input
            type="text"
            value={targetSplitStr}
            onChange={(e) => setTargetSplitStr(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-black font-mono text-[#facc15] focus:outline-none focus:border-[#facc15] text-center"
            placeholder="01:15"
          />
        </div>
      </div>

      {/* Stopwatch Hero Timer Card */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
        
        {/* Stopwatch Main Display */}
        <div className="space-y-2">
          <div className="text-5xl sm:text-8xl font-black text-white font-mono tracking-tight drop-shadow-lg">
            {formatTime(elapsedMs / 1000, true)}
          </div>
          <div className="text-xs font-bold text-slate-400 font-mono">
            Current Lap Time: <span className="text-[#06b6d4] font-black text-sm">{formatTime(currentLapElapsedSec, true)}</span>
          </div>
        </div>

        {/* Big Touch Controls */}
        <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl mx-auto">
          
          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold py-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[54px]"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleStartPause}
            className={`font-black py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[54px] ${
              isRunning
                ? 'bg-[#facc15] text-slate-950 hover:bg-yellow-300'
                : 'bg-[#ff6b00] text-white hover:bg-[#e05e00] shadow-[#ff6b00]/30'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isRunning ? 'PAUSE' : 'START'}</span>
          </button>

          <button
            onClick={handleRecordLap}
            disabled={!isRunning && elapsedMs === 0}
            className="bg-[#06b6d4] hover:bg-[#0891b2] active:scale-95 disabled:opacity-50 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-[#06b6d4]/20 flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[54px]"
          >
            <Flag className="w-5 h-5 fill-current" />
            <span>LAP SPLIT</span>
          </button>

        </div>

      </div>

      {/* Recorded Laps & Text Share */}
      {laps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Laps Table */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                Recorded Laps ({laps.length} Total)
              </h3>
              <span className="text-xs font-mono text-[#facc15] font-bold">
                Target: {formatTime(targetSplitSec)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Lap #</th>
                    <th className="py-2.5 px-3">Split Time</th>
                    <th className="py-2.5 px-3">Cumulative</th>
                    <th className="py-2.5 px-3">Vs Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {laps.map((lap) => {
                    const isAhead = lap.deltaSeconds <= 0;
                    const absDelta = Math.abs(lap.deltaSeconds).toFixed(1);

                    return (
                      <tr key={lap.lapNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-200">
                          Lap {lap.lapNumber}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#facc15]">
                          {formatTime(lap.splitSeconds, true)}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {formatTime(lap.cumulativeSeconds, true)}
                        </td>
                        <td className="py-3 px-3 font-extrabold">
                          {isAhead ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              -{absDelta}s
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              +{absDelta}s
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SMS Preview & Text Button */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#06b6d4]" />
              <span>Text Laps to Runner</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner border-l-4 border-l-[#06b6d4]">
              {smsMessage}
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={smsUri}
                className="w-full bg-[#06b6d4] hover:bg-[#0891b2] active:scale-95 text-slate-950 font-black text-xs py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>Open SMS App to Text Athlete</span>
              </a>

              <button
                onClick={handleCopySms}
                className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 min-h-[40px]"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Laps!' : 'Copy Text to Clipboard'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
