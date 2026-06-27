import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Cell, LineChart, Line
} from 'recharts';
import { ExperimentRun, PromptStrategy, ModelMetadata } from '../types';
import { BarChart3, TrendingUp, Award, DollarSign, Clock, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  runs: ExperimentRun[];
  strategies: PromptStrategy[];
  models: ModelMetadata[];
}

export default function Dashboard({ runs, strategies, models }: DashboardProps) {
  // 1. Calculate Aggregated Metrics per Strategy
  const strategyStats = useMemo(() => {
    const stats: Record<string, {
      name: string;
      accuracySum: number;
      latencySum: number;
      safetySum: number;
      reasoningSum: number;
      costSum: number;
      count: number;
    }> = {};

    runs.forEach(run => {
      if (!stats[run.strategyId]) {
        stats[run.strategyId] = {
          name: run.strategyName,
          accuracySum: 0,
          latencySum: 0,
          safetySum: 0,
          reasoningSum: 0,
          costSum: 0,
          count: 0
        };
      }
      const s = stats[run.strategyId];
      s.accuracySum += run.metrics.accuracy;
      s.latencySum += run.metrics.latencyMs;
      s.safetySum += run.metrics.safetyScore;
      s.reasoningSum += run.metrics.reasoningQuality;
      s.costSum += run.metrics.costUSD;
      s.count += 1;
    });

    return Object.entries(stats).map(([id, s]) => {
      const avgAccuracy = Math.round(s.accuracySum / s.count);
      const avgLatency = Math.round(s.latencySum / s.count);
      const avgSafety = Math.round(s.safetySum / s.count);
      const avgReasoning = Math.round(s.reasoningSum / s.count);
      const avgCost = Number((s.costSum / s.count).toFixed(6));
      
      // Academic Score: custom composite index prioritizing accuracy and safety while penalizing latency slightly
      const compositeScore = Math.round(
        (avgAccuracy * 0.4) + (avgSafety * 0.3) + (avgReasoning * 0.3)
      );

      return {
        id,
        name: s.name,
        accuracy: avgAccuracy,
        latency: avgLatency,
        safety: avgSafety,
        reasoning: avgReasoning,
        cost: avgCost,
        compositeScore,
        count: s.count
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, [runs]);

  // 2. Calculate Aggregated Metrics per Model
  const modelStats = useMemo(() => {
    const stats: Record<string, {
      name: string;
      accuracySum: number;
      latencySum: number;
      costSum: number;
      count: number;
    }> = {};

    runs.forEach(run => {
      const modelId = run.model;
      const modelMeta = models.find(m => m.id === modelId);
      const modelName = modelMeta?.name || modelId;

      if (!stats[modelId]) {
        stats[modelId] = {
          name: modelName,
          accuracySum: 0,
          latencySum: 0,
          costSum: 0,
          count: 0
        };
      }
      const m = stats[modelId];
      m.accuracySum += run.metrics.accuracy;
      m.latencySum += run.metrics.latencyMs;
      m.costSum += run.metrics.costUSD;
      m.count += 1;
    });

    return Object.entries(stats).map(([id, m]) => ({
      id,
      name: m.name,
      accuracy: Math.round(m.accuracySum / m.count),
      latency: Math.round(m.latencySum / m.count),
      cost: Number((m.costSum / m.count).toFixed(6)),
      count: m.count
    }));
  }, [runs, models]);

  // 3. Find Top Strategy and general statistics
  const generalStats = useMemo(() => {
    if (runs.length === 0) return null;
    const avgLatency = Math.round(runs.reduce((acc, r) => acc + r.metrics.latencyMs, 0) / runs.length);
    const avgAccuracy = Math.round(runs.reduce((acc, r) => acc + r.metrics.accuracy, 0) / runs.length);
    const avgSafety = Math.round(runs.reduce((acc, r) => acc + r.metrics.safetyScore, 0) / runs.length);
    const totalCost = runs.reduce((acc, r) => acc + r.metrics.costUSD, 0);

    return {
      avgLatency,
      avgAccuracy,
      avgSafety,
      totalCost: Number(totalCost.toFixed(5)),
      totalRuns: runs.length
    };
  }, [runs]);

  if (runs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center" id="empty-dashboard">
        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-display font-semibold text-slate-900 mb-1">No Laboratory Data Recorded Yet</h3>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          Execute prompt engineering strategy experiments using the Benchmark workspace or initialize custom configurations to load baseline comparative charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="dashboard-tab-content">
      {/* 1. Academic Metrics Overview Cards */}
      {generalStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="overview-metrics-grid">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mean Accuracy</div>
              <div className="text-2xl font-display font-bold text-slate-900 metric-card-val">{generalStats.avgAccuracy}%</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Trial Runs</div>
              <div className="text-2xl font-display font-bold text-slate-900 metric-card-val">{generalStats.totalRuns}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mean Latency</div>
              <div className="text-2xl font-display font-bold text-slate-900 metric-card-val">{generalStats.avgLatency}ms</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accrued Cost</div>
              <div className="text-2xl font-display font-bold text-slate-900 metric-card-val">${generalStats.totalCost}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Safety Index</div>
              <div className="text-2xl font-display font-bold text-slate-900 metric-card-val">{generalStats.avgSafety}%</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Strategy Performance Chart & Model Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="charts-main-grid">
        {/* Chart A: Accuracy by Strategy */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-900">Accuracy & Reasoning Comparison</h3>
            <span className="text-xs text-slate-400 font-mono">Scores out of 100</span>
          </div>
          <div className="h-80" id="accuracy-bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyStats.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="accuracy" name="Semantic Accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reasoning" name="Reasoning Quality" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Accuracy vs Latency (Pareto Frontier Analysis) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-900">Pareto Frontier: Accuracy vs. Latency</h3>
            <span className="text-xs text-slate-400 font-mono">Optimal is Top-Left</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Visualizes computational overhead vs capability. Notice how reasoning frameworks (Tree of Thoughts) scale accuracy at the expense of latency.
          </p>
          <div className="h-72" id="scatter-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="latency" 
                  name="Latency" 
                  unit="ms" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  label={{ value: 'Response Latency (ms)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="accuracy" 
                  name="Accuracy" 
                  unit="%" 
                  domain={[40, 100]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Strategies" data={strategyStats} fill="#2563eb">
                  {strategyStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.id === 'tot' || entry.id === 'react' ? '#e11d48' : '#2563eb'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Strategy Leaderboard & Model Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="leaderboard-grid">
        {/* Strategy Leaderboard Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-900">Empirical Strategy Leaderboard</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Ranked by Composite Score</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-400 uppercase tracking-wider font-mono bg-slate-50 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-4 py-3">Rank</th>
                  <th scope="col" className="px-4 py-3">Strategy Framework</th>
                  <th scope="col" className="px-4 py-3 text-center">Accuracy</th>
                  <th scope="col" className="px-4 py-3 text-center">Safety</th>
                  <th scope="col" className="px-4 py-3 text-center">Latency</th>
                  <th scope="col" className="px-4 py-3 text-center font-bold">Research Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {strategyStats.map((strat, idx) => (
                  <tr key={strat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-400">#0{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{strat.name}</div>
                      <div className="text-xs text-slate-400 font-mono truncate max-w-xs">{strat.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-medium">{strat.accuracy}%</td>
                    <td className="px-4 py-3.5 text-center font-mono text-emerald-600">{strat.safety}%</td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-500">{strat.latency}ms</td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-blue-600">{strat.compositeScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Efficacy Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-900 mb-2">Model Performance Overview</h3>
            <p className="text-xs text-slate-400 mb-6">
              Aggregated capability across all benchmark strategies. Pro models excel in reasoning accuracy, while Flash models maximize cost-efficiency.
            </p>
            
            <div className="space-y-6">
              {modelStats.map(model => (
                <div key={model.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{model.name}</span>
                    <span className="font-mono text-slate-500 font-bold">{model.accuracy}% Acc</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${model.id.includes('pro') ? 'bg-indigo-600' : 'bg-blue-500'}`} 
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Avg Latency: {model.latency}ms</span>
                    <span>Avg Cost/Trial: ${model.cost}</span>
                  </div>
                </div>
              ))}
              {modelStats.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                  Run experiments to compare individual model stats.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 font-display mb-1 uppercase tracking-wider">Research Hypothesis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Synthesized prompt strategies can close the capability gap between compact, cost-efficient Flash models and large-scale proprietary Pro architectures by up to 85%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
