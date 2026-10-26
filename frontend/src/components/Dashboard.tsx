import React, { useState } from 'react';
import { 
  Plus, Copy, Trash2, ArrowRight, Clock, 
  Sparkles, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenNewProjectModal: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onSelectProject,
  onOpenNewProjectModal,
  onDuplicateProject,
  onDeleteProject
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => {
    if (filter === 'in_progress') return p.completeness_score < 100;
    if (filter === 'completed') return p.completeness_score >= 100;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800 mb-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Adaptive Requirements Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Transform ideas into verified, developer-ready blueprints.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
            Eliminate questionnaire fatigue. ProjectPilot asks only relevant questions, 
            detects contradictions, manages MoSCoW priorities, and compiles complete 23-point specifications with real PDF, Word, and Excel exports.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenNewProjectModal}
              className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Start Planning</span>
            </button>
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free-text & Tamil-English transliteration supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Your Project Blueprints</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {projects.length}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a project to continue questionnaire, tweak priorities, or download generated specs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'in_progress'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Layers className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            No projects found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            You don't have any projects in this view yet. Start by entering your concept.
          </p>
          <button
            onClick={onOpenNewProjectModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {project.mode === 'advanced' ? 'Advanced Tech' : 'Beginner Friendly'}
                  </span>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(project.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate Project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(project.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 
                  onClick={() => onSelectProject(project)}
                  className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer mb-2 line-clamp-1"
                >
                  {project.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {project.objective || project.raw_idea || "Structured requirements specification."}
                </p>
              </div>

              <div>
                {/* Completeness Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Completeness</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{project.completeness_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.completeness_score >= 100
                          ? 'bg-emerald-500'
                          : project.completeness_score >= 50
                          ? 'bg-brand-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${project.completeness_score}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    <span>{project.completeness_score > 0 ? 'Resume' : 'Start'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === project.id && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-center items-center text-center z-20"
                >
                  <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Delete this project?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    All questionnaire answers, requirements, and generated exports will be permanently deleted.
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDeleteProject(project.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
