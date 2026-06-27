import React, { useState, useMemo } from 'react';
import { ExperimentRun } from '../types';
import { Search, SlidersHorizontal, Trash2, Calendar, Database, Eye, X, Download, FileJson } from 'lucide-react';

interface ExperimentLogProps {
  runs: ExperimentRun[];
  onDeleteRun: (id: string) => void;
  onClearAll: () => void;
}

export default function ExperimentLog({ runs, onDeleteRun, onClearAll }: ExperimentLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [activeInspectorRun, setActiveInspectorRun] = useState<ExperimentRun | null>(null);

  // Filters list
  const uniqueStrategies = useMemo(() => {
    return Array.from(new Set(runs.map(r => r.strategyName)));
  }, [runs]);

  const uniqueTasks = useMemo(() => {
    return Array.from(new Set(runs.map(r => r.taskName)));
  }, [runs]);

  const filteredRuns = useMemo(() => {
    return runs.filter(run => {
      const matchesSearch = 
        run.strategyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        run.taskName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        run.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStrategy = !strategyFilter || run.strategyName === strategyFilter;
      const matchesTask = !taskFilter || run.taskName === taskFilter;

      return matchesSearch && matchesStrategy && matchesTask;
    });
  }, [runs, searchTerm, strategyFilter, taskFilter]);

  const handleExportRunsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(runs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `all_experiments_db_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6" id="experiments-tracking-panel">
      
      {/* Search and Filters panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search experiments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-56 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
            />
          </div>

          {/* Strategy Filter */}
          <select
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
          >
            <option value="">All Strategies</option>
            {uniqueStrategies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Task Filter */}
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
          >
            <option value="">All Benchmark Tasks</option>
            {uniqueTasks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Export JSON */}
          <button
            onClick={handleExportRunsJSON}
            disabled={runs.length === 0}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Database (JSON)</span>
          </button>

          {/* Clear button */}
          <button
            onClick={onClearAll}
            disabled={runs.length === 0}
            className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Restore Baseline</span>
          </button>
        </div>

      </div>

      {/* Grid List of Experiment logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="experiments-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider font-mono bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3">Timestamp</th>
                <th scope="col" className="px-6 py-3">Strategy / Model</th>
                <th scope="col" className="px-6 py-3">Benchmark Task</th>
                <th scope="col" className="px-6 py-3 text-center">Accuracy</th>
                <th scope="col" className="px-6 py-3 text-center">Latency</th>
                <th scope="col" className="px-6 py-3 text-center">Cost (USD)</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(run.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </td>

                  {/* Strategy & Model */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{run.strategyName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide bg-slate-100 w-fit px-1.5 py-0.5 rounded">
                      {run.model}
                    </div>
                  </td>

                  {/* Task Name */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">{run.taskName}</span>
                  </td>

                  {/* Accuracy */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-blue-600">
                    {run.metrics.accuracy}%
                  </td>

                  {/* Latency */}
                  <td className="px-6 py-4 text-center font-mono text-slate-500 whitespace-nowrap">
                    {run.metrics.latencyMs} ms
                  </td>

                  {/* Cost */}
                  <td className="px-6 py-4 text-center font-mono text-emerald-600">
                    ${run.metrics.costUSD}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => setActiveInspectorRun(run)}
                        className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-md cursor-pointer transition-colors"
                        title="Inspect paylods"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRun(run.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
                        title="Delete run logs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                    No experimental logs matched the filter constraints.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTOR MODAL */}
      {activeInspectorRun && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="runs-inspector-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest">
                  Experiment Trial Inspector
                </span>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {activeInspectorRun.strategyName} on {activeInspectorRun.taskName}
                </h3>
              </div>
              <button 
                onClick={() => setActiveInspectorRun(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[520px]">
              
              {/* Detailed Metrics column */}
              <div className="space-y-4 md:col-span-1 border-r border-slate-100 pr-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Academic Scores</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Accuracy Score:</span>
                    <span className="font-bold text-blue-600">{activeInspectorRun.metrics.accuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Reasoning Quality:</span>
                    <span className="font-bold text-slate-800">{activeInspectorRun.metrics.reasoningQuality}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Hallucination Ratio:</span>
                    <span className="font-bold text-rose-600">{activeInspectorRun.metrics.hallucinationRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Format Consistency:</span>
                    <span className="font-bold text-slate-800">{activeInspectorRun.metrics.consistency}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Safety Guardrail Score:</span>
                    <span className="font-bold text-emerald-600">{activeInspectorRun.metrics.safetyScore}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-mono">
                    <span>Adversarial Resistance:</span>
                    <span className="font-bold text-emerald-600">{activeInspectorRun.metrics.jailbreakResistance}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  <div>Timestamp: {new Date(activeInspectorRun.timestamp).toISOString()}</div>
                  <div>Model configuration: {activeInspectorRun.model}</div>
                  <div>Temperature index: {activeInspectorRun.temperature}</div>
                  <div>Latency index: {activeInspectorRun.metrics.latencyMs}ms</div>
                  <div>Token total weight: {activeInspectorRun.metrics.tokensUsed}</div>
                </div>
              </div>

              {/* Prompt and Output payloads column */}
              <div className="space-y-4 md:col-span-2 flex flex-col justify-between h-full">
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Compiled Prompt Scaffold Preview</h4>
                  <div className="bg-slate-50 text-slate-600 font-mono text-[10px] p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto leading-relaxed select-all whitespace-pre-wrap">
                    {activeInspectorRun.promptText}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Model Generation Payload</h4>
                  <div className="bg-slate-900 text-slate-100 font-mono text-[10px] p-3 rounded-lg border border-slate-800 max-h-52 overflow-y-auto leading-relaxed select-all whitespace-pre-wrap">
                    {activeInspectorRun.rawResponse}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
