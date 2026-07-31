import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PaceTriadCalculator } from './components/PaceTriadCalculator';
import { SplitTableGenerator } from './components/SplitTableGenerator';
import { EnvironmentAdjuster } from './components/EnvironmentAdjuster';
import { RacePredictor } from './components/RacePredictor';
import { CoachStopwatch } from './components/CoachStopwatch';
import { SavedPlans } from './components/SavedPlans';
import { Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('triad');
  const [preferredUnit, setPreferredUnit] = useState<'mi' | 'km'>('mi');

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
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 font-black text-white text-sm tracking-wide uppercase">
            <Zap className="w-4 h-4 text-[#ff6b00]" />
            <span>PACE <span className="text-[#ff6b00]">RACE</span></span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            "Track Your Pace, Win Your Race!" — Precision Pacing, Splits & SMS Share for College, High School & Club Athletes
          </p>
        </div>
      </footer>

    </div>
  );
}
