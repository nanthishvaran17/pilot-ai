import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { IdeaModal } from './components/IdeaModal';
import { QuestionnaireView } from './components/QuestionnaireView';
import { PrioritizationView } from './components/PrioritizationView';
import { BlueprintView } from './components/BlueprintView';
import { RequirementsDrawer } from './components/RequirementsDrawer';
import { AdminView } from './components/AdminView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { api } from './api';
import { Project } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'questionnaire' | 'prioritization' | 'blueprint' | 'admin'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    loadProjects();
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsIdeaModalOpen(false);
        setIsSummaryDrawerOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showToast('success', 'Workspace Auto-Saved', 'All your questionnaire answers and priorities are saved.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const handleSelectProject = (p: Project) => {
    setSelectedProject(p);
    setCurrentView('questionnaire');
    showToast('info', `Opened ${p.name}`, 'Resumed adaptive requirements questionnaire.');
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setCurrentView('questionnaire');
    showToast('success', 'Project Initialized', `${newProject.name} is ready for planning.`);
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const dup = await api.duplicateProject(id);
      setProjects([dup, ...projects]);
      showToast('success', 'Project Duplicated', `Created a copy of ${dup.name}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to duplicate project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setCurrentView('dashboard');
      }
      showToast('info', 'Project Deleted', 'All data and exports removed.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header Navbar with Visual Stepper */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeProjectName={selectedProject?.name}
        completenessScore={selectedProject?.completeness_score}
        onBackToDashboard={() => {
          setSelectedProject(null);
          setCurrentView('dashboard');
          loadProjects();
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        productName="ProjectPilot AI"
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <Dashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            onOpenNewProjectModal={() => setIsIdeaModalOpen(true)}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {currentView === 'questionnaire' && selectedProject && (
          <QuestionnaireView
            projectId={selectedProject.id}
            onOpenSummaryDrawer={() => setIsSummaryDrawerOpen(true)}
            onCompleteToPrioritization={() => setCurrentView('prioritization')}
            onShowToast={showToast}
          />
        )}

        {currentView === 'prioritization' && selectedProject && (
          <PrioritizationView
            projectId={selectedProject.id}
            onProceedToBlueprint={() => setCurrentView('blueprint')}
            onShowToast={showToast}
          />
        )}

        {currentView === 'blueprint' && selectedProject && (
          <BlueprintView
            projectId={selectedProject.id}
            onShowToast={showToast}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Idea Modal (Steps 1 & 2) */}
      <IdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Live Requirements Summary Drawer */}
      {selectedProject && (
        <RequirementsDrawer
          isOpen={isSummaryDrawerOpen}
          onClose={() => setIsSummaryDrawerOpen(false)}
          projectId={selectedProject.id}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
        <p>ProjectPilot AI — Enterprise Requirements Gathering & Architecture Planning Engine</p>
      </footer>

    </div>
  );
}

export default App;
