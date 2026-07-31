import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PaceTriadCalculator } from './components/PaceTriadCalculator';
import { SplitTableGenerator } from './components/SplitTableGenerator';
import { EnvironmentAdjuster } from './components/EnvironmentAdjuster';
import { RacePredictor } from './components/RacePredictor';
import { CoachStopwatch } from './components/CoachStopwatch';
import { SavedPlans } from './components/SavedPlans';
import { DonateModal } from './components/DonateModal';
import { Zap, DollarSign, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('triad');
  const [preferredUnit, setPreferredUnit] = useState<'mi' | 'km'>('mi');
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);

  // Dark/Light theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('pace_race_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('pace_race_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Shared state for seamless navigation between tabs
  const [sharedDistanceMeters, setSharedDistanceMeters] = useState<number>(5000);
  const [sharedPaceSecPerMile, setSharedPaceSecPerMile] = useState<number>(480); // 8:00/mi

  const handleSendToSplits = (distMeters: number, paceSecMile: number) => {
    setSharedDistanceMeters(distMeters);
    setSharedPaceSecPerMile(paceSecMile);
    setActiveTab('splits');
  };

  const handleSendToEnv = (distMeters: number, paceSecMile: number) => {
    setSharedDistanceMeters(distMeters);
    setSharedPaceSecPerMile(paceSecMile);
    setActiveTab('env');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans antialiased selection:bg-[#ff6b00] selection:text-white transition-colors duration-200">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        preferredUnit={preferredUnit}
        setPreferredUnit={setPreferredUnit}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Tab Views */}
        {activeTab === 'triad' && (
          <PaceTriadCalculator
            preferredUnit={preferredUnit}
            onSendToSplits={handleSendToSplits}
            onSendToEnv={handleSendToEnv}
          />
        )}

        {activeTab === 'splits' && (
          <SplitTableGenerator
            initialDistanceMeters={sharedDistanceMeters}
            initialPaceSecPerMile={sharedPaceSecPerMile}
            preferredUnit={preferredUnit}
          />
        )}

        {activeTab === 'env' && (
          <EnvironmentAdjuster
            initialDistanceMeters={sharedDistanceMeters}
            initialPaceSecPerMile={sharedPaceSecPerMile}
            preferredUnit={preferredUnit}
          />
        )}

        {activeTab === 'predictor' && (
          <RacePredictor preferredUnit={preferredUnit} />
        )}

        {activeTab === 'stopwatch' && (
          <CoachStopwatch />
        )}

        {activeTab === 'saved' && (
          <SavedPlans />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          
          {/* Cash App Donate Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-emerald-500/20">
                $
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <span>Donate for Success on Cash App</span>
                  <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Love Pace Race Pro? Support continued updates & features via Cash App!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDonateOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 px-5 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 fill-slate-950" />
              <span>Donate via Cash App ($)</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 font-black text-white text-sm tracking-wide uppercase">
              <Zap className="w-4 h-4 text-[#ff6b00]" />
              <span>PACE <span className="text-[#ff6b00]">RACE</span></span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              "Track Your Pace, Win Your Race!" — Precision Pacing, Splits & SMS Share for College, High School & Club Athletes
            </p>
          </div>
        </div>
      </footer>

      {/* Cash App Donate Modal */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

    </div>
  );
}
