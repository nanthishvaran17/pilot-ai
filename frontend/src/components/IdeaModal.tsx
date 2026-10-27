import React, { useState } from 'react';
import { 
  X, Sparkles, ArrowRight, CheckCircle2, 
  HelpCircle, AlertTriangle, Layers, BookOpen, Smartphone, Globe
} from 'lucide-react';
import { api } from '../api';
import { IdeaAnalysisResponse } from '../types';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: any) => void;
}

export const IdeaModal: React.FC<IdeaModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [ideaText, setIdeaText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IdeaAnalysisResponse | null>(null);
  const [mode, setMode] = useState<'beginner' | 'advanced'>('beginner');
  const [depth, setDepth] = useState<'basic' | 'detailed' | 'advanced'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    {
      title: "Enterprise AI Document & Analytics Hub",
      desc: "An enterprise platform where teams upload multi-format spreadsheets, perform automated semantic extraction, validate anomalies, and generate production-ready executive reports.",
      icon: BookOpen
    },
    {
      title: "B2B SaaS Analytics & Reporting Portal",
      desc: "A multi-tenant cloud dashboard where company managers upload monthly Excel spreadsheets, validate anomalies, and export board-ready PDF and Word briefing documents.",
      icon: Globe
    },
    {
      title: "Mobile Field Inspection App",
      desc: "An Android mobile application for field inspectors to capture site photos with camera, log GPS coordinates, work completely offline, and auto-sync when online.",
      icon: Smartphone
    }
  ];

  const handleAnalyze = async () => {
    if (!ideaText.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await api.analyzeIdea(ideaText);
      setAnalysisResult(res);
      if (!projectName) {
        setProjectName(res.detected_project_name || "New Requirements Blueprint");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze idea. You can still proceed directly.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreate = async () => {
    const finalName = projectName.trim() || "Untitled Project Blueprint";
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await api.createProject({
        name: finalName,
        raw_idea: ideaText,
        target_audience: analysisResult?.target_audience,
        template_id: analysisResult?.recommended_template_key || "web_saas",
        mode,
        depth
      });
      onProjectCreated(created);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step 1 & 2: Project Idea & Scope Intake
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Describe what you want to build in plain English or Tamil-English.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Example Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Or Try a Starter Example
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {samplePrompts.map((sample, idx) => {
                const IconComponent = sample.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIdeaText(sample.desc);
                      setProjectName(sample.title);
                    }}
                    className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 mb-1">
                      <IconComponent className="w-3.5 h-3.5" />
                      <span>{sample.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {sample.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea for Idea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Describe what you want to build
              </label>
              <span className="text-[11px] text-slate-400">
                Natural Language / Tamil-English
              </span>
            </div>
            <textarea
              rows={4}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="e.g. An automated web platform for college staff to upload student marks, compute pass percentages, generate Bloom's taxonomy question papers, and issue QR-verified event certificates."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
            />
          </div>

          {/* Analyze Button */}
          {!analysisResult && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !ideaText.trim()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 transition-all shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze & Extract Structure</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* AI Extracted Summary Confirmation Card */}
          {analysisResult && (
            <div className="p-5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wide">
                    Extracted Project Structure
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 hover:underline"
                >
                  Re-analyze
                </button>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Working Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-200 dark:border-brand-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Suggested Modules & Objective */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Detected Objective
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 line-clamp-3">
                    {analysisResult.objective}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Target Users
                  </span>
                  <p className="text-slate-800 dark:text-slate-200">
                    {analysisResult.target_audience}
                  </p>
                </div>
              </div>

              {/* Modules Tags */}
              <div>
                <span className="font-semibold text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5">
                  Pre-configured Modules
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.suggested_modules.map((m, idx) => (
                    <span 
                      key={idx}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-brand-200 dark:border-brand-800"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferences: Mode and Depth */}
              <div className="pt-2 border-t border-brand-100 dark:border-brand-900 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Experience Mode:</span>
                  <select
                    value={mode}
                    onChange={(e: any) => setMode(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                  >
                    <option value="beginner">Beginner Friendly (Plain Explanations)</option>
                    <option value="advanced">Advanced Technical (Architectural Depth)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Question Depth:</span>
                  <select
                    value={depth}
                    onChange={(e: any) => setDepth(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                  >
                    <option value="basic">Basic Scope (MVP Focus)</option>
                    <option value="detailed">Detailed (Full Feature Set)</option>
                    <option value="advanced">Advanced (Enterprise Hardening)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting || (!ideaText.trim() && !projectName.trim())}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-40 transition-all"
          >
            {isSubmitting ? (
              <span>Initializing Questionnaire...</span>
            ) : (
              <>
                <span>Launch Adaptive Questionnaire</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
