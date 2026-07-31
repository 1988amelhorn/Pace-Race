import React, { useState, useMemo } from 'react';
import {
  estimateTrainingPaces,
  formatTime,
  parseTimeToSeconds,
  predictRaceTimes,
  STANDARD_DISTANCES,
} from '../utils/paceMath';
import { Compass, Trophy, Activity, Zap, MessageSquare, Send, Copy, Check, Sparkles } from 'lucide-react';

interface RacePredictorProps {
  preferredUnit: 'mi' | 'km';
}

export const RacePredictor: React.FC<RacePredictorProps> = ({ preferredUnit }) => {
  const [athleteName, setAthleteName] = useState<string>('Jordan');
  const [knownDistId, setKnownDistId] = useState<string>('5k');
  const [knownTimeStr, setKnownTimeStr] = useState<string>('21:00');
  const [copied, setCopied] = useState<boolean>(false);

  const knownDistanceObj = useMemo(() => {
    return STANDARD_DISTANCES.find((d) => d.id === knownDistId) || STANDARD_DISTANCES[7]; // 5k
  }, [knownDistId]);

  const knownTimeSeconds = useMemo(() => {
    return parseTimeToSeconds(knownTimeStr) || 1260; // 21:00
  }, [knownTimeStr]);

  // Race predictions
  const predictions = useMemo(() => {
    return predictRaceTimes(knownDistanceObj.distanceMeters, knownTimeSeconds);
  }, [knownDistanceObj, knownTimeSeconds]);

  // 5k equivalent time for VDOT calculation
  const fiveKEquivalentSec = useMemo(() => {
    const fiveKPred = predictions.find((p) => p.distanceName.includes('5K'));
    return fiveKPred ? fiveKPred.predictedTimeSeconds : 1260;
  }, [predictions]);

  // Training Paces
  const trainingPaces = useMemo(() => {
    return estimateTrainingPaces(fiveKEquivalentSec);
  }, [fiveKEquivalentSec]);

  // Generate friendly SMS for Predicted Times & Training Zones
  const generatePredictorSms = () => {
    let msg = `🏆 PACE RACE - Race Prediction Targets for ${athleteName || 'Athlete'}!\n\n`;
    msg += `⚡ Benchmark PR: ${knownDistanceObj.name} in ${formatTime(knownTimeSeconds)}\n\n`;
    msg += `🎯 Predicted Race Finish Times & Paces:\n`;

    const keyDistances = ['400 Meters (1 Lap)', '800 Meters (2 Laps)', '1 Mile', '5,000 Meters (5K)', '10,000 Meters (10K)'];
    predictions.forEach((p) => {
      if (keyDistances.includes(p.distanceName) || p.distanceName === knownDistanceObj.name) {
        msg += `- ${p.distanceName}: ${formatTime(p.predictedTimeSeconds)} (${formatTime(p.paceMileSeconds)}/mi)\n`;
      }
    });

    msg += `\n🏃 Training Pace Zones:\n`;
    msg += `- Easy Pace: ${formatTime(trainingPaces.easyPaceMileSeconds)}/mi\n`;
    msg += `- Threshold Pace: ${formatTime(trainingPaces.tempoPaceMileSeconds)}/mi\n`;
    msg += `- Interval Pace: ${formatTime(trainingPaces.intervalPaceMileSeconds)}/mi\n`;

    msg += `\n🔥 Trust your training and go achieve these goals!`;
    return msg;
  };

  const smsMessage = generatePredictorSms();

  const handleCopySms = () => {
    navigator.clipboard.writeText(smsMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const smsUri = `sms:?body=${encodeURIComponent(smsMessage)}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Benchmark Input Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#06b6d4]" />
              <span>Race Time Predictor & Target Paces</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Input your fastest race PR time to project target finish times and training zones across all race distances!
            </p>
          </div>

          <span className="text-xs font-bold text-[#facc15] bg-[#facc15]/10 px-3 py-1.5 rounded-full border border-[#facc15]/30 self-start sm:self-auto flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Riegel Endurance Formula</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          
          {/* Athlete Name */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Athlete Name
            </label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#ff6b00]"
              placeholder="e.g. Jordan"
            />
          </div>

          {/* Benchmark Distance */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Your Fastest Race / PR Event
            </label>
            <select
              value={knownDistId}
              onChange={(e) => setKnownDistId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#06b6d4]"
            >
              {STANDARD_DISTANCES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Benchmark Finish Time */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Your PR Finish Time
            </label>
            <input
              type="text"
              value={knownTimeStr}
              onChange={(e) => setKnownTimeStr(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full bg-slate-950 border-2 border-[#facc15] rounded-xl px-3.5 py-2.5 text-lg font-black text-[#facc15] font-mono focus:outline-none text-center"
              placeholder="e.g. 21:00 or 5:30"
            />
          </div>

        </div>
      </div>

      {/* Grid: Predicted Race Times & Training Paces */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Table: Race Predictions */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#facc15]" />
              <span>Projected Race Performance</span>
            </h3>
            <span className="text-xs text-[#06b6d4] font-mono font-bold">
              VDOT ~{trainingPaces.vdot}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Predicted Time</th>
                  <th className="py-2.5 px-3">Mile Pace</th>
                  <th className="py-2.5 px-3">KM Pace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {predictions.map((p, idx) => {
                  const isBenchmark = p.distanceName === knownDistanceObj.name;
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isBenchmark ? 'bg-[#06b6d4]/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-sans font-black text-slate-200">
                        {p.distanceName}
                        {isBenchmark && (
                          <span className="ml-2 text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#06b6d4] text-slate-950 font-black">
                            PR Benchmark
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-black text-[#facc15] text-base">
                        {formatTime(p.predictedTimeSeconds)}
                      </td>
                      <td className="py-3 px-3 text-[#ff6b00]">
                        {formatTime(p.paceMileSeconds)} /mi
                      </td>
                      <td className="py-3 px-3 text-[#06b6d4]">
                        {formatTime(p.paceKmSeconds)} /km
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Training Paces & SMS Texting */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Training Paces Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#ff6b00]" />
              <span>Recommended Training Paces</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-sans font-bold text-slate-300">Easy / Recovery Pace:</span>
                <span className="font-black text-emerald-400">{formatTime(trainingPaces.easyPaceMileSeconds)} /mi</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-sans font-bold text-slate-300">Tempo / Threshold Pace:</span>
                <span className="font-black text-[#06b6d4]">{formatTime(trainingPaces.tempoPaceMileSeconds)} /mi</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-sans font-bold text-slate-300">Interval / Track Reps:</span>
                <span className="font-black text-[#ff6b00]">{formatTime(trainingPaces.intervalPaceMileSeconds)} /mi</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-sans font-bold text-slate-300">400m Speed Rep:</span>
                <span className="font-black text-[#facc15]">{formatTime(trainingPaces.repetition400mSeconds, true)}</span>
              </div>
            </div>
          </div>

          {/* SMS Share Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#06b6d4]" />
              <span>Text Predictions to Athlete</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner border-l-4 border-l-[#ff6b00]">
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
                <span>{copied ? 'Copied Predictions!' : 'Copy Text to Clipboard'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
