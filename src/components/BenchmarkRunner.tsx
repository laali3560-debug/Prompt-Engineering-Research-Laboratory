import React, { useState } from 'react';
import { PromptStrategy, BenchmarkTask, ExperimentRun, ModelMetadata } from '../types';
import { Play, Loader2, Sparkles, AlertCircle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface BenchmarkRunnerProps {
  strategies: PromptStrategy[];
  tasks: BenchmarkTask[];
  models: ModelMetadata[];
  onNewRun: (newRun: ExperimentRun) => void;
}

export default function BenchmarkRunner({ strategies, tasks, models, onNewRun }: BenchmarkRunnerProps) {
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || 'zero-shot');
  const [selectedTaskType, setSelectedTaskType] = useState(tasks[0]?.type || 'math');
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || 'gemini-3.5-flash');
  const [temperature, setTemperature] = useState(0.2);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [latestRunResult, setLatestRunResult] = useState<ExperimentRun | null>(null);

  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
  const selectedTask = tasks.find(t => t.type === selectedTaskType);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setLatestRunResult(null);

    const statuses = [
      'Compiling dataset inputs...',
      'Formatting prompting scaffold templates...',
      'Injecting dynamic instructions and context...',
      'Querying target LLM model on Cloud infrastructure...',
      'Analyzing model response candidates...',
      'Spawning LLM-as-a-judge evaluator nodes...',
      'Computing semantic accuracy and hallucination parameters...',
      'Compiling final laboratory metrics...'
    ];

    let statusIdx = 0;
    setStatusText(statuses[0]);
    const interval = setInterval(() => {
      statusIdx++;
      if (statusIdx < statuses.length) {
        setStatusText(statuses[statusIdx]);
      }
    }, 1200);

    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          taskType: selectedTaskType,
          model: selectedModel,
          temperature
        })
      });

      clearInterval(interval);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error running prompt evaluation.');
      }

      setLatestRunResult(data);
      onNewRun(data);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'An unexpected error occurred during execution.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="benchmark-runner-layout">
      
      {/* COLUMN 1 & 2: CONFIGURATION & BENCHMARK PREVIEW */}
      <div className="lg:col-span-2 space-y-6" id="benchmark-config-preview">
        
        {/* Config Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-display font-semibold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Configure Research Experiment</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strategy Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prompt Strategy</label>
              <select 
                value={selectedStrategyId} 
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
              >
                {strategies.map(strat => (
                  <option key={strat.id} value={strat.id}>{strat.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 italic">
                {selectedStrategy?.description}
              </p>
            </div>

            {/* Task Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Benchmark Task</label>
              <select 
                value={selectedTaskType} 
                onChange={(e) => setSelectedTaskType(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
              >
                {tasks.map(task => (
                  <option key={task.type} value={task.type}>{task.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 italic">
                {selectedTask?.description}
              </p>
            </div>

            {/* Model Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Node</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:border-blue-500 focus:bg-white focus:outline-hidden"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name} ({model.provider})</option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temperature</label>
                <span className="text-xs font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{temperature}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.1"
                value={temperature} 
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">
                Lower values yield deterministic research; higher values force entropy.
              </span>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleExecute}
              disabled={loading}
              className={`px-5 py-2.5 rounded-lg font-display font-medium text-sm text-white flex items-center space-x-2 shadow-xs transition-all ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98 cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Benchmark...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Automated Trials</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Status Tracer Console */}
        {loading && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 font-mono text-sm space-y-4" id="live-terminal-panel">
            <div className="flex items-center space-x-2 text-slate-400 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Active Laboratory Log Tracer</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center space-x-2 text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{statusText}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                The Prompt Research Engine is firing parallel trial streams against model API targets. Each output is structured, parsed, and graded programmatically via secondary judge model parameters. This may take up to 10 seconds.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Panel */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-xl space-y-4" id="error-panel">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Laboratory Run Interrupt</h4>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
            
            {error.includes('GEMINI_API_KEY') && (
              <div className="bg-white border border-rose-100 rounded-lg p-4 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-900">How to configure your API key:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-500 font-medium">
                  <li>Click on the **Settings & Secrets** panel in the Google AI Studio container dashboard interface.</li>
                  <li>Add an environment variable named <code className="bg-slate-100 font-mono text-rose-600 px-1 py-0.5 rounded">GEMINI_API_KEY</code>.</li>
                  <li>Paste your Gemini API key from AI Studio.</li>
                  <li>Rerun the prompt strategy benchmark trials!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Benchmark Scaffold Template Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Structured Template Preview</h4>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
            {selectedStrategy?.template || 'No strategy template selected.'}
          </div>
          <p className="text-[11px] text-slate-400">
            Note: During compilation, the laboratory dynamic parser replaces <code className="bg-slate-100 px-1 rounded text-slate-700">[TASK_INPUT]</code> with benchmark dataset cases.
          </p>
        </div>

      </div>

      {/* COLUMN 3: ACTIVE OUTCOME CARD */}
      <div className="space-y-6" id="benchmark-results-outcome">
        
        {/* Latest Run Results */}
        {latestRunResult ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
            
            {/* Header */}
            <div className="p-6 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Trial Run Completed</span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">{latestRunResult.strategyName}</h3>
              <p className="text-xs text-slate-400 font-mono">{latestRunResult.taskName} ({latestRunResult.model})</p>
            </div>

            {/* Scientific Grade Table */}
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Academic Score Grading</h4>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Semantic Accuracy</div>
                  <div className="text-2xl font-display font-extrabold text-blue-700 metric-card-val">{latestRunResult.metrics.accuracy}%</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reasoning Quality</div>
                  <div className="text-2xl font-display font-extrabold text-slate-800 metric-card-val">{latestRunResult.metrics.reasoningQuality}%</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Consistency Index</div>
                  <div className="text-2xl font-display font-extrabold text-slate-800 metric-card-val">{latestRunResult.metrics.consistency}%</div>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Safety Score</div>
                  <div className="text-2xl font-display font-extrabold text-emerald-700 metric-card-val">{latestRunResult.metrics.safetyScore}%</div>
                </div>

              </div>

              {/* Sub-metrics */}
              <div className="space-y-2 pt-2 text-xs border-t border-slate-100 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Calculated Latency:</span>
                  <span className="font-bold text-slate-800">{latestRunResult.metrics.latencyMs} ms</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tokens Expended:</span>
                  <span className="font-bold text-slate-800">{latestRunResult.metrics.tokensUsed}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Approx cost (USD):</span>
                  <span className="font-bold text-emerald-600">${latestRunResult.metrics.costUSD}</span>
                </div>
              </div>
            </div>

            {/* Model Response Preview Block */}
            <div className="p-6 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Sample Model Response Output</h4>
              <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-4 rounded-lg border border-slate-800 leading-relaxed overflow-y-auto max-h-56 select-all whitespace-pre-wrap">
                {latestRunResult.rawResponse}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Note: Evaluated across all dataset items. Metrics represent compiled task statistics.
              </p>
            </div>

          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center h-full flex flex-col justify-center items-center space-y-4 shadow-xs" id="no-latest-run">
            <Terminal className="w-12 h-12 text-slate-300" />
            <div>
              <h4 className="font-display font-semibold text-slate-800">Standby: Awaiting Trial Run</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Select your strategies and models, then trigger the automated laboratory run. Evaluation outcomes and response grades will populate here.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
