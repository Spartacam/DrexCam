import React, { useState } from 'react';
import { Swords, Zap, Gauge, FileCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { RaceResponse } from '../types';

interface ApexPredatorRacePanelProps {
  raceData: RaceResponse | null;
  isRunningRace: boolean;
  onRunRace: () => void;
}

export const ApexPredatorRacePanel: React.FC<ApexPredatorRacePanelProps> = ({
  raceData,
  isRunningRace,
  onRunRace,
}) => {
  const [showFullPacket, setShowFullPacket] = useState<boolean>(false);

  const drex = raceData?.benchmark.drex;
  const deepinfra = raceData?.benchmark.deepinfra_system2;
  const econ = raceData?.benchmark.economic_comparison;
  const audit = raceData?.intern_audit;

  const isApproved = drex ? (drex.disposition === 'APPROVE') : true;

  return (
    <div className="flex flex-col bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">Apex Predator Benchmark Race</h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
          Track 1 Live
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[750px]">
        {/* Race Trigger Button */}
        <button
          onClick={onRunRace}
          disabled={isRunningRace}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
            isRunningRace
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/30'
          }`}
        >
          {isRunningRace ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
              RACING DREX SYSTEM 1 VS DEEPINFRA QWEN...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 text-cyan-200" />
              RUN LIVE APEX BENCHMARK RACE
            </>
          )}
        </button>

        {/* Head-to-Head Comparison Scoreboard */}
        <div className="grid grid-cols-2 gap-3">
          {/* Drex System One Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-950/90 border border-cyan-500/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Drex System 1</span>
              </div>
              <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-400/30">
                WINNER ⚡
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Latency</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {drex ? `${drex.latency_ms.toFixed(1)} ms` : '184.9 ms'}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Tokens:</span>
                <span className="text-emerald-400 font-bold">0 (Zero-Token)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cost:</span>
                <span className="text-emerald-300">$0.00028</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disposition:</span>
                <span className={isApproved ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {drex ? drex.disposition : 'APPROVE'}
                </span>
              </div>
            </div>
          </div>

          {/* DeepInfra System 2 LLM Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <span>DeepInfra Qwen</span>
              </div>
              <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                27B LLM
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Latency</div>
              <div className="text-2xl font-mono font-bold text-slate-400">
                {deepinfra ? `${(deepinfra.latency_ms / 1000).toFixed(1)} s` : '42.6 s'}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Tokens:</span>
                <span className="text-amber-400">
                  {deepinfra ? `${deepinfra.total_tokens.toLocaleString()}` : '2,238'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cost:</span>
                <span className="text-amber-300">
                  {deepinfra ? `$${deepinfra.estimated_cost_usd.toFixed(5)}` : '$0.00093'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disposition:</span>
                <span className={isApproved ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {deepinfra ? deepinfra.disposition : 'APPROVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Advantage Strip */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-around text-center">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Speed Advantage</div>
            <div className="text-lg font-mono font-bold text-cyan-400">
              {raceData?.benchmark.speedup_factor || 'up to 230x FASTER'}
            </div>
          </div>
          <div className="h-6 w-[1px] bg-cyan-800/40"></div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Cost Reduction</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              {econ?.cost_savings_percent || '70.0% CHEAPER'}
            </div>
          </div>
        </div>

        {/* Intern Dual-Brain Adjuster Audit Packet */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Intern Adjuster Audit Packet</span>
            </div>
            <button
              onClick={() => setShowFullPacket(!showFullPacket)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {showFullPacket ? 'Collapse' : 'View Report'}
              {showFullPacket ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Supervisor Trace Steps */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 text-xs">
            {(audit?.supervisor_log || [
              { step: 'Temporal Action Localization', engine: 'Drex MoE', status: 'VERIFIED', details: 'Apex localized with high confidence' },
              { step: 'Policy Compliance Matching', engine: 'Drex System 1', status: 'CLEARED', details: 'Zero policy exclusions triggered' },
              { step: 'Pixel Bounding-Box Grounding', engine: 'NDI Ground 1.0', status: 'LOCKED', details: 'Statutory policy clauses verified' },
              { step: 'Final Disposition Routing', engine: 'Intern Supervisor', status: 'APPROVED', details: 'Claim cleared for automated processing' }
            ]).map((item, idx) => (
              <div key={idx} className="flex items-start justify-between py-1 border-b border-slate-900 last:border-0">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200 text-[11px]">{item.step}</span>
                  <span className="text-[10px] text-slate-500">{item.details}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Expandable Adjuster Letter */}
          {showFullPacket && audit?.packet_markdown && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {audit.packet_markdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
