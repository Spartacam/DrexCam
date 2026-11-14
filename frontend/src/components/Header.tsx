import React from 'react';
import { Zap, ShieldCheck, Layers, Gauge, Cpu, FileText } from 'lucide-react';
import { HealthResponse, ScenarioMeta } from '../types';

interface HeaderProps {
  health: HealthResponse | null;
  scenarios: ScenarioMeta[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onOpenMatrix: () => void;
  isEvaluating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onOpenMatrix,
  isEvaluating,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0b101b]/95 backdrop-blur px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ChronoGround
                <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Track 1 Apex
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Zero-Token Multimodal Temporal Localization &amp; Grounded Policy Triage
            </p>
          </div>
        </div>

        {/* Center: Scenario Switcher */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 px-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium text-slate-400">Scenario:</span>
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={isEvaluating}
            className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer hover:text-white"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Matrix Inspector Button */}
          <button
            onClick={onOpenMatrix}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Inspect 141-Q Matrix
          </button>

          {/* Drex Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-mono">Drex MoE 35B</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          </div>

          {/* DeepInfra Partner Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-mono">DeepInfra Qwen</span>
          </div>

          {/* NDI Grounding Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-mono">NDI Ground 1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};

