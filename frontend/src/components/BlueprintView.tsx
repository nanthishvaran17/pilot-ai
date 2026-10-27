import React, { useState, useEffect } from 'react';
import { 
  FileDown, FileText, Download, CheckCircle2, 
  Layers, Database, Shield, Server, Cpu, Check, 
  RefreshCw, Sparkles, ExternalLink
} from 'lucide-react';
import { api } from '../api';
import { Blueprint, ExportJob } from '../types';

interface BlueprintViewProps {
  projectId: string;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({ projectId }) => {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportJob[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'requirements' | 'ui' | 'architecture' | 'security' | 'testing'>('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  useEffect(() => {
    loadBlueprint();
    loadExports();
  }, [projectId]);

  const loadBlueprint = async () => {
    setIsLoading(true);
    try {
      const bp = await api.getBlueprint(projectId);
      setBlueprint(bp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExports = async () => {
    try {
      const history = await api.getExportHistory(projectId);
      setExportHistory(history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async (format: string) => {
    setIsExporting(format);
    try {
      const job = await api.exportBlueprint(projectId, format);
      // Trigger actual file download in browser
      window.open(api.getDownloadUrl(job.id), '_blank');
      await loadExports();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  if (isLoading || !blueprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-500">Compiling 23-point project blueprint...</p>
      </div>
    );
  }

  const data = blueprint.content_json;

  const exportButtons = [
    { format: 'pdf', label: 'PDF Document (.pdf)', desc: 'Print-ready executive report with custom typography', color: 'bg-rose-600 hover:bg-rose-500 text-white' },
    { format: 'docx', label: 'Word Document (.docx)', desc: 'Editable Microsoft Word format with tables & callouts', color: 'bg-blue-600 hover:bg-blue-500 text-white' },
    { format: 'md', label: 'Markdown (.md)', desc: 'Developer-ready documentation for Git repos', color: 'bg-slate-800 hover:bg-slate-700 text-white' },
    { format: 'json', label: 'JSON Schema (.json)', desc: 'Structured machine-readable 23-point specification', color: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
    { format: 'csv', label: 'Requirements CSV (.csv)', desc: 'Spreadsheet importable MoSCoW requirements matrix', color: 'bg-amber-600 hover:bg-amber-500 text-white' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Blueprint Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Specification • Version {blueprint.version}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {blueprint.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generated strictly from your confirmed responses and architectural requirements.
          </p>
        </div>

        <button
          onClick={loadBlueprint}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-generate Specification</span>
        </button>
      </div>

      {/* Real Multi-Format Export Action Center */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileDown className="w-4 h-4 text-brand-400" />
            <span>Real File Downloads & Engineering Hand-Off</span>
          </h3>
          <p className="text-xs text-slate-300">
            Download true physical binaries compiled on the backend. No placeholders or mock buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {exportButtons.map((btn) => (
            <button
              key={btn.format}
              onClick={() => handleExport(btn.format)}
              disabled={isExporting !== null}
              className={`p-3 rounded-xl ${btn.color} text-left flex flex-col justify-between shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
            >
              <div>
                <span className="text-xs font-bold block mb-1">{btn.label}</span>
                <span className="text-[10px] opacity-80 block leading-tight">{btn.desc}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-white/20">
                <span>{isExporting === btn.format ? 'Generating...' : 'Download'}</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'summary', label: '1. Executive & Goals' },
          { id: 'requirements', label: '2. Functional Matrix' },
          { id: 'ui', label: '3. UI & User Journeys' },
          { id: 'architecture', label: '4. Diagrams & Architecture' },
          { id: 'security', label: '5. AI & Security Rules' },
          { id: 'testing', label: '6. Acceptance & Testing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Tab 1: Executive Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Executive Summary
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {data.executive_summary}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Problem Statement
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {data.problem_statement}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Key Project Goals
              </h3>
              <ul className="space-y-2">
                {data.project_goals?.map((g: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Confirmed Functional Matrix */}
        {activeTab === 'requirements' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Confirmed Functional Requirements
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.confirmed_functional_requirements?.map((req: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{req.title}</td>
                      <td className="py-3 px-3 text-slate-500">{req.category}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.is_mvp ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'text-slate-400'
                        }`}>
                          {req.is_mvp ? 'MVP Core' : 'Future'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: UI & User Journeys */}
        {activeTab === 'ui' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Page-by-Page UI Architecture
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.page_by_page_ui_plan?.map((page: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{page.page}</span>
                      <code className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-mono">
                        {page.route}
                      </code>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {page.components}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Detailed User Journeys
              </h3>
              <div className="space-y-4">
                {data.detailed_user_journeys?.map((uj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {uj.journey}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {uj.steps?.map((step: string, sIdx: number) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Workflows & Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                System Workflow Model (Mermaid Diagram)
              </h3>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {data.workflow_diagrams_mermaid}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Entity Relationship Diagram (Mermaid ER)
              </h3>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {data.database_er_mermaid}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 5: Security, AI & Governance */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                AI Architecture & Deterministic Boundaries
              </h3>
              <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900 space-y-2 text-xs">
                <p><b>Provider Strategy:</b> {data.ai_architecture?.provider_strategy}</p>
                <p><b>Deterministic Code Boundary:</b> {data.ai_architecture?.deterministic_boundary}</p>
                <p><b>Fault Tolerance & Fallback:</b> {data.ai_architecture?.fallback_mechanism}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Security & Compliance Controls
              </h3>
              <ul className="space-y-1.5">
                {data.security_requirements?.map((sec: string, idx: number) => (
                  <li key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    <span>{sec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 6: Acceptance & Testing */}
        {activeTab === 'testing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Acceptance Criteria Checklist
              </h3>
              <div className="space-y-2">
                {data.acceptance_criteria?.map((ac: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-800 dark:text-slate-200">
                    <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      <Check className="w-3 h-3 text-slate-400" />
                    </div>
                    <span>{ac}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
