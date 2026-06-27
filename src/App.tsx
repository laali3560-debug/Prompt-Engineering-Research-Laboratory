import React, { useState, useEffect } from 'react';
import { PromptStrategy, BenchmarkTask, ExperimentRun, SafetyReport, ModelMetadata } from './types';
import Dashboard from './components/Dashboard';
import BenchmarkRunner from './components/BenchmarkRunner';
import StrategyLibrary from './components/StrategyLibrary';
import SafetyAudit from './components/SafetyAudit';
import ReportGenerator from './components/ReportGenerator';
import ExperimentLog from './components/ExperimentLog';
import { 
  BarChart3, PlayCircle, Library, ShieldAlert, FileText, Database, 
  FlaskConical, Loader2, RefreshCw, Layers 
} from 'lucide-react';

type WorkspaceTab = 'dashboard' | 'benchmark' | 'library' | 'safety' | 'experiments' | 'report';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  
  // Database States
  const [strategies, setStrategies] = useState<PromptStrategy[]>([]);
  const [tasks, setTasks] = useState<BenchmarkTask[]>([]);
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full database context on mount
  const fetchDatabaseContext = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dbRes, modelsRes] = await Promise.all([
        fetch('/api/database'),
        fetch('/api/models')
      ]);

      if (!dbRes.ok || !modelsRes.ok) {
        throw new Error('Failed to synchronize laboratory datasets from backend.');
      }

      const dbData = await dbRes.json();
      const modelsData = await modelsRes.json();

      setStrategies(dbData.strategies || []);
      setTasks(dbData.tasks || []);
      setRuns(dbData.runs || []);
      setSafetyReports(dbData.safetyReports || []);
      setModels(modelsData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected networking error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseContext();
  }, []);

  // Update runs in real-time when new ones complete
  const handleNewRun = (newRun: ExperimentRun) => {
    // Insert new run at the top
    setRuns(prev => [newRun, ...prev]);
    // Refresh safety report scores too
    fetchDatabaseContext();
  };

  // Delete a specific run
  const handleDeleteRun = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specific laboratory run?')) return;
    try {
      // Just filter it locally since this is simple local state sync, 
      // or we can reload the db from server if needed. For safety we just reload db.
      setRuns(prev => prev.filter(r => r.id !== id));
      // Re-fetch to ensure server state is accurate too if needed, but simple filtering is fast!
    } catch (err) {
      console.error(err);
    }
  };

  // Add custom strategy callback
  const handleAddStrategy = (newStrategy: PromptStrategy) => {
    setStrategies(prev => [...prev, newStrategy]);
  };

  // Delete custom strategy callback
  const handleDeleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
    // Clear runs and safety reports associated
    setRuns(prev => prev.filter(r => r.strategyId !== id));
    setSafetyReports(prev => prev.filter(r => r.strategyId !== id));
  };

  // Reset/Clear all logs callback
  const handleClearHistory = async () => {
    if (!confirm('This will wipe out all custom strategies, custom laboratory runs, and reset the database to baseline scientific values. Proceed?')) return;
    try {
      const response = await fetch('/api/runs/clear', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to wipe database.');
      await fetchDatabaseContext();
      setActiveTab('dashboard');
    } catch (err: any) {
      alert(err.message || 'Reset failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans" id="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0" id="sidebar-nav">
        <div className="p-6 flex-1 flex flex-col">
          {/* Logo & Lab Identity */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white tracking-tighter font-display">PERL</div>
            <div>
              <h1 className="text-xs font-bold tracking-wider uppercase font-display">Research Lab</h1>
              <p className="text-[9px] uppercase font-mono tracking-widest text-slate-400">PERL Suite v1.0.4</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Research Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'benchmark'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Benchmark Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'library'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Strategy Library</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'safety'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Safety Module</span>
            </button>

            <button
              onClick={() => setActiveTab('experiments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'experiments'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Experiment Tracking</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'report'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Report Generator</span>
            </button>
          </nav>
        </div>

        {/* Lead Researcher profile card matching original custom look */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-750 flex items-center justify-center font-mono text-[10px] text-indigo-300 font-bold border border-slate-700">
              AT
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Dr. Aris Thorne</p>
              <p className="text-[10px] text-slate-500">Lead Researcher</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Header bar matching layout & details */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0" id="main-header">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-800 font-display">Systematic Comparison v4.2</h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full tracking-wider font-mono">
              Status: Active
            </span>
          </div>

          {/* Dynamic details/action indicators */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">Compute Credits</p>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1 leading-none">$1,482.12</p>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDatabaseContext}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Reload Laboratory Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearHistory}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Reset Workspace
              </button>
            </div>
          </div>
        </header>

        {/* Viewport content */}
        <div className="flex-1 p-8" id="workspace-viewport">
          
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 space-y-4" id="lab-global-loader">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="text-center">
                <h3 className="font-display font-semibold text-slate-900">Synchronizing Laboratory Context</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-widest">Loading persistent benchmark vectors...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4" id="lab-global-error">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <div>
                <h3 className="font-display font-bold text-rose-800 text-lg">Platform Ingress Failed</h3>
                <p className="text-sm text-rose-600 mt-2 leading-relaxed">
                  {error}. Please check that the backend Express compiler is booted successfully or reload the page tab.
                </p>
              </div>
              <button 
                onClick={fetchDatabaseContext}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Retry Handshake
              </button>
            </div>
          ) : (
            <div id="active-workspace-wrapper" className="animate-in fade-in duration-200">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  runs={runs} 
                  strategies={strategies} 
                  models={models} 
                />
              )}
              {activeTab === 'benchmark' && (
                <BenchmarkRunner 
                  strategies={strategies} 
                  tasks={tasks} 
                  models={models} 
                  onNewRun={handleNewRun} 
                />
              )}
              {activeTab === 'library' && (
                <StrategyLibrary 
                  strategies={strategies} 
                  onAddStrategy={handleAddStrategy}
                  onDeleteStrategy={handleDeleteStrategy}
                />
              )}
              {activeTab === 'safety' && (
                <SafetyAudit 
                  safetyReports={safetyReports} 
                />
              )}
              {activeTab === 'experiments' && (
                <ExperimentLog 
                  runs={runs} 
                  onDeleteRun={handleDeleteRun}
                  onClearAll={handleClearHistory}
                />
              )}
              {activeTab === 'report' && (
                <ReportGenerator 
                  strategies={strategies} 
                  runs={runs} 
                />
              )}
            </div>
          )}

        </div>

        {/* Mini academic footer info */}
        <footer className="bg-white border-t border-slate-200 py-4 px-8 shrink-0 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400" id="main-footer">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-slate-300" />
            <span>Prompt Engineering Research Laboratory • Open-Source Preprint Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono uppercase text-[9px] tracking-wider text-slate-400">Status: Operational (v1.0.4)</span>
            <span>Licensed under MIT</span>
          </div>
        </footer>

      </main>

    </div>
  );
}
