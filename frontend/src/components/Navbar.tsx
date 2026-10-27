import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Moon, 
  Sun, 
  Home, 
  CheckCircle2, 
  Layers, 
  SlidersHorizontal, 
  FileCode2,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'questionnaire' | 'prioritization' | 'blueprint' | 'admin';
  setCurrentView: (view: 'dashboard' | 'questionnaire' | 'prioritization' | 'blueprint' | 'admin') => void;
  activeProjectName?: string;
  completenessScore?: number;
  onBackToDashboard: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  productName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeProjectName,
  completenessScore = 0,
  onBackToDashboard,
  darkMode,
  setDarkMode,
  productName = "Pilot AI",
}) => {
  const steps: { id: 'questionnaire' | 'prioritization' | 'blueprint'; label: string; icon: React.ElementType }[] = [
    { id: 'questionnaire', label: '1. Requirements', icon: Layers },
    { id: 'prioritization', label: '2. Prioritization', icon: SlidersHorizontal },
    { id: 'blueprint', label: '3. Blueprint Studio', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          {activeProjectName ? (
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
              title="Return to Projects Dashboard"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          ) : null}

          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none" 
            onClick={onBackToDashboard}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-sky-200 dark:to-slate-300 bg-clip-text text-transparent">
                  {productName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  SPECCRAFT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Autonomous Architecture Engine</p>
            </div>
          </div>
        </div>

        {/* Step Wizard Stepper Bar (Active when project is selected) */}
        {activeProjectName && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentView === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentView(step.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Actions & Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Active project pill with completeness badge */}
          {activeProjectName && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
              <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-300 font-semibold">
                {activeProjectName}
              </span>
              <div className="flex items-center space-x-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                <CheckCircle2 className="w-3 h-3 text-brand-500" />
                <span>{completenessScore}% Ready</span>
              </div>
            </div>
          )}

          {/* Admin Template Console */}
          <button
            onClick={() => setCurrentView(currentView === 'admin' ? 'dashboard' : 'admin')}
            className={`p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              currentView === 'admin' ? 'bg-slate-200 dark:bg-slate-800 text-brand-600' : ''
            }`}
            title="Question Template & Rule Admin"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
