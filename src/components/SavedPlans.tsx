import React, { useState, useEffect } from 'react';
import { SavedRacePlan } from '../types/pace';
import { formatTime, STANDARD_DISTANCES } from '../utils/paceMath';
import { History, Plus, Trash2, Printer, Bookmark, Check } from 'lucide-react';

export const SavedPlans: React.FC = () => {
  const [plans, setPlans] = useState<SavedRacePlan[]>([]);
  const [planName, setPlanName] = useState<string>('Goal Marathon Strategy');
  const [distId, setDistId] = useState<string>('marathon');
  const [timeStr, setTimeStr] = useState<string>('03:15:00');
  const [notes, setNotes] = useState<string>('Focus on negative split after mile 18. Gel every 45 mins.');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const loaded = localStorage.getItem('pace_race_plans');
    if (loaded) {
      try {
        setPlans(JSON.parse(loaded));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default sample plan
      const defaultPlan: SavedRacePlan = {
        id: '1',
        name: 'Boston Qualifier Sub-3:10',
        date: new Date().toISOString().split('T')[0],
        distanceName: 'Marathon (26.2 mi)',
        distanceMeters: 42195,
        targetTimeSeconds: 11400, // 3:10:00
        strategy: 'negative',
        envConditions: {
          tempF: 55,
          humidityPercent: 50,
          altitudeFeet: 0,
          windMph: 5,
          windType: 'none',
          gradePercent: 0,
        },
        notes: 'Target 7:15/mi for first 13 miles, build to 7:05/mi for second half.',
      };
      setPlans([defaultPlan]);
      localStorage.setItem('pace_race_plans', JSON.stringify([defaultPlan]));
    }
  }, []);

  const handleSavePlan = () => {
    const distObj = STANDARD_DISTANCES.find((d) => d.id === distId) || STANDARD_DISTANCES[11];
    const totalSec = formatTime(0) === timeStr ? 11400 : parseTimeStr(timeStr);

    const newPlan: SavedRacePlan = {
      id: Date.now().toString(),
      name: planName || 'My Race Plan',
      date: new Date().toISOString().split('T')[0],
      distanceName: distObj.name,
      distanceMeters: distObj.distanceMeters,
      targetTimeSeconds: totalSec,
      strategy: 'negative',
      envConditions: {
        tempF: 65,
        humidityPercent: 50,
        altitudeFeet: 0,
        windMph: 0,
        windType: 'none',
        gradePercent: 0,
      },
      notes,
    };

    const updated = [newPlan, ...plans];
    setPlans(updated);
    localStorage.setItem('pace_race_plans', JSON.stringify(updated));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeletePlan = (id: string) => {
    const filtered = plans.filter((p) => p.id !== id);
    setPlans(filtered);
    localStorage.setItem('pace_race_plans', JSON.stringify(filtered));
  };

  const parseTimeStr = (str: string) => {
    const parts = str.split(':').map((p) => parseInt(p) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 1200;
  };

  return (
    <div className="space-y-6">
      
      {/* Create New Plan Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#ff6b00]" />
          <span>Save New Race Plan Workspace</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Plan Title</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
              placeholder="e.g. Chicago A-Goal Plan"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Event Distance</label>
            <select
              value={distId}
              onChange={(e) => setDistId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
            >
              {STANDARD_DISTANCES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Target Time</label>
            <input
              type="text"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-[#facc15] font-mono font-bold"
              placeholder="03:15:00"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Strategy & Coach Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            placeholder="Hydration strategy, split pacing guidelines..."
          />
        </div>

        <button
          onClick={handleSavePlan}
          className="bg-[#ff6b00] hover:bg-[#e05e00] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-[#ff6b00]/20 flex items-center gap-2 min-h-[44px]"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Plus className="w-4 h-4" />}
          <span>{savedSuccess ? 'Saved to Workspace!' : 'Save Race Plan'}</span>
        </button>
      </div>

      {/* Saved Plans List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <History className="w-4 h-4 text-[#06b6d4]" />
          <span>Saved Race Execution Plans ({plans.length})</span>
        </h3>

        {plans.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No saved plans yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => {
              const avgPaceMile = (p.targetTimeSeconds / p.distanceMeters) * 1609.344;
              return (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{p.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {p.distanceName} • Saved {p.date}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Target Time</span>
                      <span className="font-extrabold text-[#facc15]">{formatTime(p.targetTimeSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Avg Pace</span>
                      <span className="font-extrabold text-[#ff6b00]">{formatTime(avgPaceMile)} /mi</span>
                    </div>
                  </div>

                  {p.notes && (
                    <p className="text-xs text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800/60 leading-relaxed">
                      {p.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
