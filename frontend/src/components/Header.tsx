import React from 'react';
import { Zap, Layers, Cpu, FileText } from 'lucide-react';
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
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onOpenMatrix,
  isEvaluating,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#090d18]/95 backdrop-blur-md px-5 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">ChronoGround</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Track 1 Apex
              </span>
            </div>
            <p className="text-xs text-slate-400">Zero-Token Multimodal Localization &amp; Grounded Policy Triage</p>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-3">
          {/* Scenario Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
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

          {/* Drex Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Drex MoE 35B</span>
          </div>

          {/* Matrix Button */}
          <button
            onClick={onOpenMatrix}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            title="Inspect Question Matrix"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Matrix</span>
          </button>
        </div>
      </div>
    </header>
  );
};

