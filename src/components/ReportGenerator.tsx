import React, { useState } from 'react';
import { PromptStrategy, ExperimentRun } from '../types';
import { BookOpen, Loader2, Download, Eye, FileText, Check, Database } from 'lucide-react';

interface ReportGeneratorProps {
  strategies: PromptStrategy[];
  runs: ExperimentRun[];
}

export interface GeneratedReport {
  title: string;
  text: string;
  meta: {
    avgAccuracy: number;
    avgSafety: number;
    avgReasoning: number;
    avgLatency: number;
    avgCost: string;
    sampleSize: number;
    strategyName: string;
  };
}

export default function ReportGenerator({ strategies, runs }: ReportGeneratorProps) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId || null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server failed to compile research report.');
      }

      setReport(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred compile report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prompt_lab_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    const markdownContent = `# ${report.title}\n\n**Date:** ${new Date().toLocaleDateString()}\n**Institution:** Prompt Engineering Research Laboratory Core\n**Sample Trial Size:** ${report.meta.sampleSize} total experiments\n\n${report.text}`;
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(markdownContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `academic_preprint_${Date.now()}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (!report) return;
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(
      `Metric,Value\n` +
      `Strategy Analyzed,${report.meta.strategyName}\n` +
      `Sample Size,${report.meta.sampleSize}\n` +
      `Average Accuracy,${report.meta.avgAccuracy}%\n` +
      `Average Safety,${report.meta.avgSafety}%\n` +
      `Average Reasoning,${report.meta.avgReasoning}%\n` +
      `Average Latency,${report.meta.avgLatency}ms\n` +
      `Average Token Cost (USD),${report.meta.avgCost}`
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `statistical_dataset_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="report-generator-layout">
      
      {/* COLUMN 1: PARAMETERS PANELS */}
      <div className="lg:col-span-1 space-y-6" id="report-params-col">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-display font-semibold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Preprint Compiler</span>
          </h3>

          <div className="space-y-4">
            
            {/* Target strategy scope select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Scope</label>
              <select 
                value={selectedStrategyId} 
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="">Compare All Strategies (Meta-Analysis)</option>
                {strategies.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Preprint compiler formats raw dataset parameters and results from the database into academic LaTeX markdown styles.
            </p>

            <button
              onClick={handleGenerate}
              disabled={loading || runs.length === 0}
              className={`w-full py-2.5 rounded-lg text-sm font-medium font-display text-white flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                loading || runs.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-xs'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling Draft...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Synthesize Academic Preprint</span>
                </>
              )}
            </button>

            {runs.length === 0 && (
              <p className="text-[10px] text-rose-500 font-mono text-center">
                * Error: Laboratory runs empty. Please execute some trials.
              </p>
            )}

          </div>
        </div>

        {/* Database Quick Stats */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Database className="w-3.5 h-3.5" />
            <span>Database Context</span>
          </h4>
          <div className="text-xs text-slate-500 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Sample runs loaded:</span>
              <span className="font-bold text-slate-800">{runs.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Target strategies:</span>
              <span className="font-bold text-slate-800">{strategies.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2-4: PREPRINT PAPER DISPLAY */}
      <div className="lg:col-span-3 space-y-6" id="report-preprint-display-col">
        {report ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Academic Controls bar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest animate-pulse">
                PDF Compiled successfully • Pre-Review Preprint
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyClipboard}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Copy LaTeX Markdown</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportMarkdown}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MD</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV Stats</span>
                </button>
              </div>
            </div>

            {/* Academic-style formatting wrapper */}
            <div className="p-8 md:p-12 space-y-8 select-text overflow-y-auto max-h-[640px] border-b border-slate-100">
              
              {/* Paper Header */}
              <div className="text-center space-y-3 pb-6 border-b border-slate-200">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Technical Preprint • Laboratory Proceedings 2026
                </span>
                <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
                  {report.title}
                </h1>
                
                {/* Author List */}
                <div className="text-xs text-slate-500 font-medium">
                  <div className="font-bold text-slate-800">Prompt Engineering Research Laboratory Core</div>
                  <div>Department of Artificial Intelligence Systems and Alignment</div>
                  <div className="text-slate-400 mt-1">Contact: peer-review@prompt-lab.org</div>
                </div>
              </div>

              {/* LaTeX Markdown Render Body */}
              <div className="prose prose-slate prose-sm max-w-none font-sans text-slate-700 leading-relaxed whitespace-pre-wrap select-all">
                {report.text}
              </div>

              {/* PDF Footer credits */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>© 2026 Prompt Research Laboratory Core. Open-Source Academic License (MIT).</span>
                <span>Page 01 of 01</span>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center h-full min-h-[380px] flex flex-col justify-center items-center space-y-4 shadow-xs" id="report-empty-placeholder">
            <FileText className="w-16 h-16 text-slate-200" />
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-slate-800 text-base">Academic Journal Preprints Workspace</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Select your research strategy constraints on the left pane and synthesize academic manuscripts comparing accuracy margins, trade-offs, and adversarial stress audits.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
