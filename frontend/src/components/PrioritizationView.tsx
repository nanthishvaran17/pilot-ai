import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Clock, Users, BarChart3, 
  Trash2, ArrowRight, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import { Requirement } from '../types';

interface PrioritizationViewProps {
  projectId: string;
  onProceedToBlueprint: () => void;
}

export const PrioritizationView: React.FC<PrioritizationViewProps> = ({
  projectId,
  onProceedToBlueprint
}) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Functional');
  const [newPriority, setNewPriority] = useState<'must_have' | 'should_have' | 'could_have' | 'future_consideration'>('must_have');
  const [newComplexity, setNewComplexity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTimeSavings, setNewTimeSavings] = useState('');
  const [newUsersAffected, setNewUsersAffected] = useState('');

  useEffect(() => {
    loadRequirements();
  }, [projectId]);

  const loadRequirements = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRequirements(projectId);
      setRequirements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePriority = async (req: Requirement, newP: any) => {
    try {
      const updated = await api.updateRequirement(projectId, req.id, {
        ...req,
        moscow_priority: newP,
        is_mvp: newP === 'must_have'
      });
      setRequirements(requirements.map(r => r.id === req.id ? updated : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMvp = async (req: Requirement) => {
    try {
      const updated = await api.updateRequirement(projectId, req.id, {
        ...req,
        is_mvp: !req.is_mvp
      });
      setRequirements(requirements.map(r => r.id === req.id ? updated : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (reqId: string) => {
    try {
      await api.deleteRequirement(projectId, reqId);
      setRequirements(requirements.filter(r => r.id !== reqId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await api.createRequirement(projectId, {
        title: newTitle.trim(),
        category: newCategory,
        moscow_priority: newPriority,
        complexity: newComplexity,
        time_savings: newTimeSavings || undefined,
        users_affected: newUsersAffected || undefined,
        is_mvp: newPriority === 'must_have',
        source: 'user_confirmed'
      });
      setRequirements([...requirements, created]);
      setNewTitle('');
      setNewTimeSavings('');
      setNewUsersAffected('');
      setIsAddingNew(false);
    } catch (err) {
      console.error(err);
    }
  };

  const moscowGroups = {
    must_have: requirements.filter(r => r.moscow_priority === 'must_have'),
    should_have: requirements.filter(r => r.moscow_priority === 'should_have'),
    could_have: requirements.filter(r => r.moscow_priority === 'could_have'),
    future_consideration: requirements.filter(r => r.moscow_priority === 'future_consideration')
  };

  const columns = [
    { key: 'must_have', title: 'Must Have', desc: 'Non-negotiable core scope for MVP delivery', badgeColor: 'bg-emerald-500 text-white' },
    { key: 'should_have', title: 'Should Have', desc: 'Important capabilities scheduled for v1.1 release', badgeColor: 'bg-brand-500 text-white' },
    { key: 'could_have', title: 'Could Have', desc: 'Desirable enhancements if time permits', badgeColor: 'bg-amber-500 text-white' },
    { key: 'future_consideration', title: 'Future Phase', desc: 'Long-term backlog and future roadmap', badgeColor: 'bg-slate-500 text-white' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Scope & Delivery Calibrator</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            MoSCoW Feature Prioritization & MVP Planner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Determine what ships in the initial MVP versus subsequent iterations. Drag, assign, and quantify time savings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Requirement</span>
          </button>

          <button
            onClick={onProceedToBlueprint}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Generate Project Blueprint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Requirement Card Modal / Inline Form */}
      {isAddingNew && (
        <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add New Project Requirement
            </h3>
            <button onClick={() => setIsAddingNew(false)} className="text-xs text-slate-400 hover:text-slate-600">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block font-semibold mb-1">Requirement Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Automated QR Code Certificate Generator"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="Functional">Functional Feature</option>
                <option value="Security">Security & Privacy</option>
                <option value="Reporting">Reporting & Exports</option>
                <option value="Automation">Automation & AI</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">MoSCoW Priority</label>
              <select
                value={newPriority}
                onChange={(e: any) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="must_have">Must Have (MVP)</option>
                <option value="should_have">Should Have</option>
                <option value="could_have">Could Have</option>
                <option value="future_consideration">Future Consideration</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Complexity</label>
              <select
                value={newComplexity}
                onChange={(e: any) => setNewComplexity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="Low">Low Complexity</option>
                <option value="Medium">Medium Complexity</option>
                <option value="High">High Complexity</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Estimated Time Savings</label>
              <input
                type="text"
                value={newTimeSavings}
                onChange={(e) => setNewTimeSavings(e.target.value)}
                placeholder="e.g. 8 hours / week"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Users Affected</label>
              <input
                type="text"
                value={newUsersAffected}
                onChange={(e) => setNewUsersAffected(e.target.value)}
                placeholder="e.g. 50 Faculty Members"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 disabled:opacity-40"
            >
              Save Requirement
            </button>
          </div>
        </div>
      )}

      {/* MoSCoW 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((col) => {
          const items = (moscowGroups as any)[col.key] || [];
          return (
            <div
              key={col.key}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${col.badgeColor}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {items.length} items
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  {col.desc}
                </p>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((req: Requirement) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:border-brand-400 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {req.title}
                        </span>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-0.5"
                          title="Delete Requirement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                          {req.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          req.complexity === 'Low'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : req.complexity === 'Medium'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {req.complexity} Complexity
                        </span>
                        {req.time_savings && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{req.time_savings}</span>
                          </span>
                        )}
                      </div>

                      {/* Controls: Move priority and MVP Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                        <select
                          value={req.moscow_priority}
                          onChange={(e) => handleUpdatePriority(req, e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <option value="must_have">Must Have</option>
                          <option value="should_have">Should Have</option>
                          <option value="could_have">Could Have</option>
                          <option value="future_consideration">Future</option>
                        </select>

                        <button
                          onClick={() => handleToggleMvp(req)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            req.is_mvp
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {req.is_mvp ? '✓ MVP Core' : 'Post-MVP'}
                        </button>
                      </div>

                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      No items in this tier
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
