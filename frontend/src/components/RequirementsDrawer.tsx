import React, { useEffect, useState } from 'react';
import { 
  X, CheckCircle, Sparkles, HelpCircle, AlertCircle, 
  Layers, Shield, ExternalLink, RefreshCw
} from 'lucide-react';
import { api } from '../api';
import { LiveRequirementsSummary } from '../types';

interface RequirementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const RequirementsDrawer: React.FC<RequirementsDrawerProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const [summary, setSummary] = useState<LiveRequirementsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen, projectId]);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLiveSummary(projectId);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Live Requirements Summary</span>
              {summary && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
                  {summary.completeness_score}% Complete
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Continuously aggregated from your confirmed answers.
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={loadSummary}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {isLoading && !summary ? (
            <div className="text-center py-12 text-slate-400">Aggregating requirements...</div>
          ) : summary ? (
            <>
              {/* Confirmed Answers Section */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2.5 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Confirmed Specifications ({Object.keys(summary.confirmed_answers).length})</span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(summary.confirmed_answers).length === 0 ? (
                    <p className="text-slate-400 italic">No answers confirmed yet.</p>
                  ) : (
                    Object.entries(summary.confirmed_answers).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {Array.isArray(v) ? v.join(', ') : String(v)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Inferred Suggestions */}
              {Object.keys(summary.inferred_suggestions).length > 0 && (
                <div>
                  <h4 className="font-bold text-brand-700 dark:text-brand-300 mb-2.5 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>Inferred Suggestions ({Object.keys(summary.inferred_suggestions).length})</span>
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(summary.inferred_suggestions).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900">
                        <span className="font-semibold text-brand-600 dark:text-brand-400 uppercase text-[10px] tracking-wider block mb-1">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {Array.isArray(v) ? v.join(', ') : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MoSCoW MVP Scope */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2.5 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Must-Have MVP Scope</span>
                </h4>
                <div className="space-y-1.5">
                  {summary.moscow_summary.must_have.length === 0 ? (
                    <p className="text-slate-400 italic">No must-have items prioritized yet.</p>
                  ) : (
                    summary.moscow_summary.must_have.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          MVP
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
          >
            Close Summary
          </button>
        </div>

      </div>
    </div>
  );
};
