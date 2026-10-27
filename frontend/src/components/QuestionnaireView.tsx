import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, CheckCircle2, ChevronRight, ChevronLeft, 
  Lightbulb, AlertTriangle, ArrowRight, ArrowLeft,
  ListFilter, ShieldAlert, Zap, CornerDownRight
} from 'lucide-react';
import { QuestionnaireState, Question, Section } from '../types';
import { api } from '../api';

interface QuestionnaireViewProps {
  projectId: string;
  onOpenSummaryDrawer: () => void;
  onCompleteToPrioritization: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  projectId,
  onOpenSummaryDrawer,
  onCompleteToPrioritization,
  onShowToast
}) => {
  const [state, setState] = useState<QuestionnaireState | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [focusQuestionIndex, setFocusQuestionIndex] = useState<number>(0);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    loadState();
  }, [projectId]);

  const loadState = async () => {
    try {
      setIsLoading(true);
      const res = await api.getQuestionnaireState(projectId);
      setState(res);
      if (res.sections.length > 0 && !activeSectionId) {
        setActiveSectionId(res.sections[0].id);
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast('error', 'Failed to load questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (question: Question, value: any, extraFlags = {}) => {
    setAutoSaveStatus('saving');

    // Optimistically update local state immediately
    if (state) {
      const updatedSections = state.sections.map(sec => ({
        ...sec,
        questions: sec.questions.map(q => {
          if (q.key === question.key) {
            return {
              ...q,
              current_response: value,
              is_confirmed: true,
              is_skipped: false,
              is_undecided: false,
              ...extraFlags
            };
          }
          return q;
        })
      }));
      setState({ ...state, sections: updatedSections });
    }

    // Debounced network persistence
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const updated = await api.autosaveResponse(projectId, {
          question_key: question.key,
          value,
          is_confirmed: true,
          is_skipped: false,
          is_undecided: false,
          ...extraFlags
        });
        setState(updated);
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error("Autosave error", err);
        setAutoSaveStatus('idle');
      }
    }, 400);
  };

  const handleSkip = async (question: Question) => {
    setAutoSaveStatus('saving');
    try {
      const updated = await api.autosaveResponse(projectId, {
        question_key: question.key,
        value: null,
        is_skipped: true,
        is_confirmed: false
      });
      setState(updated);
      setAutoSaveStatus('saved');
      if (onShowToast) onShowToast('info', 'Question Skipped', `Skipped ${question.label.slice(0, 30)}...`);
    } catch (err) {
      console.error(err);
      setAutoSaveStatus('idle');
    }
  };

  const handleMarkUndecided = async (question: Question) => {
    setAutoSaveStatus('saving');
    try {
      const updated = await api.autosaveResponse(projectId, {
        question_key: question.key,
        value: null,
        is_undecided: true,
        is_confirmed: false
      });
      setState(updated);
      setAutoSaveStatus('saved');
      if (onShowToast) onShowToast('info', 'Marked Undecided', 'Saved under Unresolved Decisions for review.');
    } catch (err) {
      console.error(err);
      setAutoSaveStatus('idle');
    }
  };

  // One-click contradiction resolution
  const handleAutoResolveConflict = async (conflictId: string) => {
    setAutoSaveStatus('saving');
    try {
      if (conflictId === 'conflict_ai_mismatch') {
        // Auto resolve by switching ai_integration_level to smart_assistant
        const updated = await api.autosaveResponse(projectId, {
          question_key: 'ai_integration_level',
          value: 'smart_assistant',
          is_confirmed: true
        });
        setState(updated);
        setAutoSaveStatus('saved');
        if (onShowToast) onShowToast('success', 'Conflict Resolved', 'Switched AI Integration Level to Smart Assistant.');
      } else if (conflictId === 'conflict_connectivity') {
        const updated = await api.autosaveResponse(projectId, {
          question_key: 'offline_access_need',
          value: 'local_lan',
          is_confirmed: true
        });
        setState(updated);
        setAutoSaveStatus('saved');
        if (onShowToast) onShowToast('success', 'Conflict Resolved', 'Enabled Local LAN offline synchronization.');
      }
    } catch (err) {
      console.error(err);
      setAutoSaveStatus('idle');
    }
  };

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-500">Loading intelligent questionnaire...</p>
      </div>
    );
  }

  const activeSection = state.sections.find(s => s.id === activeSectionId) || state.sections[0];
  const activeSectionIdx = state.sections.findIndex(s => s.id === activeSection.id);
  const visibleQuestions = activeSection?.questions.filter(q => q.is_visible) || [];

  const handleNextSection = () => {
    if (activeSectionIdx < state.sections.length - 1) {
      setActiveSectionId(state.sections[activeSectionIdx + 1].id);
      setFocusQuestionIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCompleteToPrioritization();
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIdx > 0) {
      setActiveSectionId(state.sections[activeSectionIdx - 1].id);
      setFocusQuestionIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Questionnaire Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{state.project_name}</span>
            <span>•</span>
            <span className="capitalize">{state.mode} Mode</span>
            <span>•</span>
            <span className="text-brand-600 dark:text-brand-400 font-bold">Section {activeSectionIdx + 1} of {state.sections.length}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Adaptive Requirements Questionnaire
          </h2>
        </div>

        {/* Right side controls: Autosave Badge, Summary Drawer Button, Mode toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {autoSaveStatus === 'saving' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto-saved</span>
              </>
            )}
          </div>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              focusMode 
                ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-300 dark:border-brand-800 text-brand-600 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {focusMode ? 'Single Question Mode' : 'All Section Questions'}
          </button>

          <button
            onClick={onOpenSummaryDrawer}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white shadow-sm transition-all"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Live Summary</span>
          </button>
        </div>
      </div>

      {/* Contradiction Warning Banner with One-Click Auto-Resolve */}
      {state.contradictions.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  Requirement Conflict Detected
                </h4>
                {state.contradictions.map((c) => (
                  <div key={c.id} className="text-xs text-amber-800 dark:text-amber-200">
                    <p className="font-semibold">{c.title}</p>
                    <p className="opacity-90">{c.description}</p>
                    <p className="mt-1 font-semibold text-brand-700 dark:text-brand-300 flex items-center space-x-1">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Suggested Fix: {c.suggested_resolution}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Auto-Resolve Button */}
            <button
              onClick={() => handleAutoResolveConflict(state.contradictions[0].id)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Resolve Conflict</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Layout: Sections Sidebar + Central Questionnaire Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section Navigation (Column 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            
            {/* Overall Completeness Bar */}
            <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Completion</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">
                  {state.completeness_score}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${state.completeness_score}%` }} 
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>{state.answered_questions} answered</span>
                <span>{state.visible_questions} active questions</span>
              </div>
            </div>

            {/* Section List */}
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Sections Roadmap
            </h3>
            <div className="space-y-1.5">
              {state.sections.map((section, idx) => {
                const isActive = section.id === activeSection.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSectionId(section.id);
                      setFocusQuestionIndex(0);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        section.is_completed
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {section.is_completed ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span className="line-clamp-1">{section.title}</span>
                    </div>

                    <span className="text-[10px] opacity-70">
                      {section.answered_count}/{section.questions.filter(q => q.is_visible).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Prioritization CTA */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onCompleteToPrioritization}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                <span>Proceed to MoSCoW Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Central Questionnaire Canvas (Column 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section Header */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1 block">
              Section {activeSectionIdx + 1} of {state.sections.length}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {activeSection.title}
            </h3>
            {activeSection.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeSection.description}
              </p>
            )}
          </div>

          {/* Questions Container */}
          {visibleQuestions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No active questions required for this section based on your previous answers.
            </div>
          ) : focusMode ? (
            // Single Question Focus Mode
            (() => {
              const q = visibleQuestions[focusQuestionIndex] || visibleQuestions[0];
              return (
                <div className="space-y-4">
                  <QuestionCard
                    question={q}
                    onChange={(val, flags) => handleResponseChange(q, val, flags)}
                    onSkip={() => handleSkip(q)}
                    onUndecided={() => handleMarkUndecided(q)}
                  />
                  <div className="flex justify-between items-center pt-2">
                    <button
                      disabled={focusQuestionIndex === 0}
                      onClick={() => setFocusQuestionIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                      Previous Question
                    </button>
                    <span className="text-xs text-slate-400">
                      {focusQuestionIndex + 1} of {visibleQuestions.length}
                    </span>
                    <button
                      disabled={focusQuestionIndex === visibleQuestions.length - 1}
                      onClick={() => setFocusQuestionIndex(prev => Math.min(visibleQuestions.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold disabled:opacity-40"
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            // Full Section Flow Mode
            <div className="space-y-6">
              {visibleQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onChange={(val, flags) => handleResponseChange(q, val, flags)}
                  onSkip={() => handleSkip(q)}
                  onUndecided={() => handleMarkUndecided(q)}
                />
              ))}

              {/* Bottom Section Navigator Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrevSection}
                  disabled={activeSectionIdx === 0}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Section</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextSection}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
                >
                  <span>
                    {activeSectionIdx === state.sections.length - 1
                      ? 'Proceed to MoSCoW Prioritizer'
                      : 'Save & Continue to Next Section'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

// Reusable Accessible Question Card Component
interface QuestionCardProps {
  question: Question;
  onChange: (value: any, flags?: any) => void;
  onSkip: () => void;
  onUndecided: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onChange,
  onSkip,
  onUndecided
}) => {
  const currentVal = question.current_response;

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
      question.is_confirmed
        ? 'border-slate-200 dark:border-slate-800 shadow-xs'
        : question.is_inferred
        ? 'border-brand-300 dark:border-brand-800 bg-brand-50/20'
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      
      {/* Label and Badges */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            {question.is_required && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                Required
              </span>
            )}
            {question.is_inferred && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                AI Suggestion
              </span>
            )}
            {question.is_undecided && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Undecided
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {question.label}
          </h4>
        </div>

        {/* Skip & Undecided Options */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={onUndecided}
            className="text-[11px] font-medium text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            title="Mark as not decided yet"
          >
            Not sure yet
          </button>
          {!question.is_required && (
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Skip this question"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Explanation Text */}
      {question.explanation && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          {question.explanation}
        </p>
      )}

      {/* Input Controls Rendering */}
      <div className="space-y-2 mb-3">
        {question.question_type === 'single_choice' && (
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((opt) => {
              const isSelected = currentVal === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 text-brand-900 dark:text-brand-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.key}
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => onChange(opt.value)}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-semibold block">{opt.label}</span>
                    {opt.hint && <span className="text-[11px] text-slate-400 block mt-0.5">{opt.hint}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {question.question_type === 'multiple_choice' && (
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((opt) => {
              const valList: any[] = Array.isArray(currentVal) ? currentVal : [];
              const isChecked = valList.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 text-brand-900 dark:text-brand-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...valList, opt.value]);
                      } else {
                        onChange(valList.filter(v => v !== opt.value));
                      }
                    }}
                    className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-semibold block">{opt.label}</span>
                    {opt.hint && <span className="text-[11px] text-slate-400 block mt-0.5">{opt.hint}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {question.question_type === 'long_text' && (
          <textarea
            rows={3}
            value={currentVal || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.help_text || "Enter details..."}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        )}

        {question.question_type === 'short_text' && (
          <input
            type="text"
            value={currentVal || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.help_text || "Enter text..."}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        )}
      </div>

      {/* Recommendation Hint */}
      {question.recommendation && (
        <div className="flex items-center space-x-2 text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50/60 dark:bg-brand-950/30 p-2.5 rounded-xl border border-brand-100 dark:border-brand-900">
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
          <span><b>Recommendation:</b> {question.recommendation}</span>
        </div>
      )}

    </div>
  );
};
