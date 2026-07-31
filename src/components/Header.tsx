import React from 'react';
import { Timer, Zap, Flame, BarChart3, Compass, History, Activity, Sun, Moon, DollarSign, Heart } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  preferredUnit: 'mi' | 'km';
  setPreferredUnit: (unit: 'mi' | 'km') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenDonate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  preferredUnit,
  setPreferredUnit,
  theme,
  toggleTheme,
  onOpenDonate,
}) => {
  const tabs = [
    { id: 'triad', label: 'Pace Calculator', icon: Timer },
    { id: 'splits', label: 'Race Splits', icon: BarChart3 },
    { id: 'env', label: 'Weather & Elevation', icon: Flame },
    { id: 'stopwatch', label: 'On my whistle', icon: Activity },
    { id: 'predictor', label: 'Race Predictor', icon: Compass },
    { id: 'saved', label: 'Saved Plans', icon: History },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('triad')}>
              <div className="w-10 h-10 bg-[#ff6b00] rounded-sm flex items-center justify-center font-black text-white text-2xl shadow-md">
                P
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">
                    PACE <span className="text-[#ff6b00]">RACE</span>
                  </h1>
                  <span className="text-[10px] uppercase tracking-[0.15em] font-black px-2 py-0.5 rounded-sm bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/40">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-[#06b6d4] font-bold tracking-[0.2em] uppercase mt-1">
                  Track Your Pace, Win Your Race!
                </p>
              </div>
            </div>

            {/* Global Controls: Cash App Donate, Unit Switcher & Dark/Light Mode Button */}
            <div className="flex items-center gap-2">
              {onOpenDonate && (
                <button
                  type="button"
                  onClick={onOpenDonate}
                  aria-label="Donate via Cash App"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all min-h-[38px] cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
                  title="Donate via Cash App for your success!"
                >
                  <DollarSign className="w-4 h-4 fill-current stroke-[2.5]" />
                  <span className="font-black">Donate Cash App</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Dark and Light Mode"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all min-h-[38px] cursor-pointer shadow-sm active:scale-95"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    <span className="hidden sm:inline font-black">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
                    <span className="hidden sm:inline font-black">Dark</span>
                  </>
                )}
              </button>

              <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setPreferredUnit('mi')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all min-h-[32px] min-w-[42px] ${
                    preferredUnit === 'mi'
                      ? 'bg-[#ff6b00] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MILES
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredUnit('km')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all min-h-[32px] min-w-[42px] ${
                    preferredUnit === 'km'
                      ? 'bg-[#06b6d4] text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  KM
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap min-h-[44px] ${
                    isActive
                      ? 'bg-[#1e293b] text-[#ff6b00] border border-[#ff6b00]/50 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff6b00]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
};
