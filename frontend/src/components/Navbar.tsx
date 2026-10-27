import React from 'react';
import { 
  Compass, FileText, CheckSquare, 
  Layers, Shield, Moon, Sun, ArrowLeft,
  ChevronRight, CheckCircle2, Home
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'questionnaire' | 'prioritization' | 'blueprint' | 'admin';
  setCurrentView: (view: any) => void;
  activeProjectName?: string;
  onBackToDashboard?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  productName?: string;
  completenessScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeProjectName,
  onBackToDashboard,
  darkMode,
  setDarkMode,
  productName = "ProjectPilot AI",
  completenessScore = 0
}) => {
  const steps = [
    { id: 'questionnaire', label: '1. Questionnaire', icon: FileText },
    { id: 'prioritization', label: '2. MoSCoW Matrix', icon: CheckSquare },
    { id: 'blueprint', label: '3. Blueprint & Exports', icon: Layers },
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
              title="Return to Dashboard"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          ) : null}

          <div 
            className="flex items-center space-x-2.5 cursor-pointer" 
            onClick={onBackToDashboard}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {productName}
              </span>
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Step Wizard Stepper Bar (Active when project is selected) */}
        {activeProjectName && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentView === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentView(step.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions: Progress Pill, Theme Toggle, Admin */}
        <div className="flex items-center space-x-2">
          {activeProjectName && (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Score:</span>
              <span className="text-brand-600 dark:text-brand-400">{completenessScore}%</span>
            </div>
          )}

          <button
            onClick={() => setCurrentView(currentView === 'admin' ? 'dashboard' : 'admin')}
            className={`p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              currentView === 'admin' ? 'bg-slate-100 dark:bg-slate-800 text-brand-600' : ''
            }`}
            title="Administration & Templates"
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
