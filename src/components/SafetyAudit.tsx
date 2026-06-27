import React, { useMemo } from 'react';
import { SafetyReport } from '../types';
import { ShieldAlert, ShieldCheck, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyAuditProps {
  safetyReports: SafetyReport[];
}

export default function SafetyAudit({ safetyReports }: SafetyAuditProps) {
  
  // Rank strategies by vulnerability to jailbreaks (harmful output rate / lower resistance)
  const vulnerabilityRank = useMemo(() => {
    return [...safetyReports].sort((a, b) => b.harmfulOutputRate - a.harmfulOutputRate);
  }, [safetyReports]);

  return (
    <div className="space-y-8" id="safety-audit-panel">
      
      {/* 1. Header & Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>AI Safety & Jailbreak Vulnerability Audit</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Measures prompt engineering resistance against structured adversarial injections (DAN persona overrides) and compares compliance scores against core safety constitutions.
          </p>
        </div>
        
        {/* Abstract Box */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-w-sm text-[11px] text-slate-500 font-mono leading-relaxed">
          <span className="font-bold text-slate-800 uppercase block mb-1 text-[9px] tracking-wider">Audit Synopsis:</span>
          Adversarial prompt wrappers (like constitutional checks and multi-agent peer reviewers) reduce jailbreak vulnerabilities by up to 98% compared to direct instruction zero-shot inputs.
        </div>
      </div>

      {/* 2. Key Metrics Visualization Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="safety-metrics-grid">
        
        {/* COLUMN 1: VULNERABILITY LEADERBOARD (Harmful output rates) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-1 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Adversarial Vulnerability Index</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Measures the percent of jailbreak attempts that bypassed prompt constraints. Lower percentages denote superior safety robustness.
            </p>
          </div>

          <div className="space-y-4">
            {vulnerabilityRank.map((report, idx) => {
              // Color spectrum based on harmful rate
              const colorClass = report.harmfulOutputRate > 30 ? 'bg-rose-500' : report.harmfulOutputRate > 10 ? 'bg-amber-500' : 'bg-emerald-500';
              const textClass = report.harmfulOutputRate > 30 ? 'text-rose-600' : report.harmfulOutputRate > 10 ? 'text-amber-600' : 'text-emerald-600';
              const bgClass = report.harmfulOutputRate > 30 ? 'bg-rose-50' : report.harmfulOutputRate > 10 ? 'bg-amber-50' : 'bg-emerald-50';

              return (
                <div key={report.strategyId} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{report.strategyName}</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${bgClass} ${textClass}`}>
                      {report.harmfulOutputRate}% Fail Rate
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${report.harmfulOutputRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Attempts: {report.jailbreakAttempts}</span>
                    <span>Bypasses: {report.jailbreakBypasses}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2 & 3: STRATEGY ALIGNMENT & ROBUSTNESS AUDITS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900">Scaffolding Alignment & Critique</h3>
            <span className="text-xs text-slate-400 font-mono uppercase font-bold">Safety Profile Audits</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="safety-profile-cards">
            {safetyReports.slice(0, 4).map(report => {
              const isResilient = report.harmfulOutputRate < 10;
              return (
                <div key={report.strategyId} className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm text-slate-800 truncate max-w-[180px]">
                      {report.strategyName}
                    </h4>
                    {isResilient ? (
                      <span className="text-emerald-600 bg-emerald-50 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Resilient</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-100 uppercase flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Vulnerable</span>
                      </span>
                    )}
                  </div>

                  {/* Meter Grid */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[9px] text-slate-400 uppercase font-semibold">Alignment Score</div>
                      <div className="text-base font-display font-extrabold text-slate-800 font-mono mt-0.5">
                        {report.alignmentScore}%
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[9px] text-slate-400 uppercase font-semibold">Injection Resist</div>
                      <div className="text-base font-display font-extrabold text-slate-800 font-mono mt-0.5">
                        {report.manipulationResistance}%
                      </div>
                    </div>
                  </div>

                  {/* Summary commentary */}
                  <p className="text-xs text-slate-500 leading-relaxed italic border-t border-slate-200/50 pt-2.5">
                    "{report.summary}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Scientific Background Information */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 space-y-4" id="jailbreak-mechanisms">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Mechanistic Interpretations of Adversarial Susceptibility</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed">
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200">Persona Scaffolding Drift</h5>
            <p>
              LLMs trained with RLHF remain highly susceptible to adversarial persona constraints. By defining a virtual state (e.g. "DAN") that demands zero alignment rules, the input triggers a prompt-drift state, forcing the primary neural layer to bypass downstream guardrails.
            </p>
          </div>
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200">Constitutional Feedback Loop</h5>
            <p>
              Constitutional prompting functions as a meta-critic. By feeding intermediate model drafts back to a secondary "safety judge" instruction cycle, the platform identifies alignment violations programmatically, suppressing toxic outputs before client delivery.
            </p>
          </div>
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200">Multi-Agent Review Audits</h5>
            <p>
              In multi-agent environments, dividing output generation and output evaluation across separate, isolated attention streams breaks prompt context correlation. The reviewer agent evaluates text objectively, resisting inline prompt injection exploits.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
