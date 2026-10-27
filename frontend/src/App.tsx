import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { IdeaModal } from './components/IdeaModal';
import { QuestionnaireView } from './components/QuestionnaireView';
import { PrioritizationView } from './components/PrioritizationView';
import { BlueprintView } from './components/BlueprintView';
import { RequirementsDrawer } from './components/RequirementsDrawer';
import { AdminView } from './components/AdminView';
import { api } from './api';
import { Project } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'questionnaire' | 'prioritization' | 'blueprint' | 'admin'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

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
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setCurrentView('questionnaire');
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const dup = await api.duplicateProject(id);
      setProjects([dup, ...projects]);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeProjectName={selectedProject?.name}
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
          />
        )}

        {currentView === 'prioritization' && selectedProject && (
          <PrioritizationView
            projectId={selectedProject.id}
            onProceedToBlueprint={() => setCurrentView('blueprint')}
          />
        )}

        {currentView === 'blueprint' && selectedProject && (
          <BlueprintView
            projectId={selectedProject.id}
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
        <p>ProjectPilot AI — Enterprise Requirements Gathering & Architecture Planning Engine</p>
      </footer>

    </div>
  );
}

export default App;
