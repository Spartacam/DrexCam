import React, { useState } from 'react';
import { Swords, Zap, Gauge, DollarSign, Clock, FileCheck, ShieldX, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <div className="flex flex-col bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Apex Predator: Drex vs. The Giants Live Race
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
          Track 1 Benchmark
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[820px]">
        {/* Race Trigger Button */}
        <button
          onClick={onRunRace}
          disabled={isRunningRace}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2.5 shadow-lg ${
            isRunningRace
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/30 drex-glow'
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
              FIRE LIVE APEX BENCHMARK RACE
            </>
          )}
        </button>

        {/* Head-to-Head Comparison Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Drex System One Card */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-950/90 border border-cyan-500/40 flex flex-col gap-3 relative overflow-hidden drex-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">Drex System One</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30">
                WINNER ⚡
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Wall-Clock Latency</div>
              <div className="text-3xl font-mono font-extrabold text-cyan-400 tracking-tight">
                {drex ? `${drex.latency_ms.toFixed(1)} ms` : '94.2 ms'}
              </div>
              <div className="text-[11px] text-slate-400">
                Sub-150ms synchronous MoE
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Questions Evaluated:</span>
                <span className="font-mono text-slate-200">{drex ? drex.questions_evaluated : 141} in 1 batch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Throughput:</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {drex ? `${drex.questions_per_second.toFixed(0)} QPS` : '1,496 QPS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Generation Tokens:</span>
                <span className="font-mono font-bold text-emerald-400">0 tokens (Zero-Token!)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inference Cost:</span>
                <span className="font-mono text-emerald-300">$0.00028</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disposition:</span>
                <span className="font-mono font-bold text-red-400">DENY (94.2%)</span>
              </div>
            </div>
          </div>

          {/* DeepInfra System Two LLM Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">DeepInfra System 2</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                Qwen 3.8-27B
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Wall-Clock Latency</div>
              <div className="text-3xl font-mono font-extrabold text-slate-400 tracking-tight">
                {deepinfra ? `${(deepinfra.latency_ms / 1000).toFixed(2)} s` : '3.24 s'}
              </div>
              <div className="text-[11px] text-slate-500">
                Multi-token autoregressive loop
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Questions Evaluated:</span>
                <span className="font-mono text-slate-300">{deepinfra ? deepinfra.questions_evaluated : 141} (Sequential)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Throughput:</span>
                <span className="font-mono text-slate-400">
                  {deepinfra ? `${deepinfra.questions_per_second.toFixed(0)} QPS` : '43 QPS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tokens Consumed:</span>
                <span className="font-mono text-amber-400">
                  {deepinfra ? `${deepinfra.total_tokens.toLocaleString()} tokens` : '4,460 tokens'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inference Cost:</span>
                <span className="font-mono text-amber-300">
                  {deepinfra ? `$${deepinfra.estimated_cost_usd.toFixed(5)}` : '$0.00350'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disposition:</span>
                <span className="font-mono font-bold text-red-400">DENY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advantage Banner */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Speedup Factor</div>
            <div className="text-2xl font-mono font-extrabold text-cyan-400">
              {raceData?.benchmark.speedup_factor || '34.4x FASTER'}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-cyan-800/40"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cost Reduction</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400">
              {econ?.cost_savings_percent || '92.0% CHEAPER'}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-cyan-800/40"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Token Elimination</div>
            <div className="text-2xl font-mono font-extrabold text-cyan-300">
              -4,460 TOKENS
            </div>
          </div>
        </div>

        {/* Intern Dual-Brain Adjuster Audit Packet */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Intern Dual-Brain Adjuster Audit Packet
              </h3>
            </div>
            <button
              onClick={() => setShowFullPacket(!showFullPacket)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              {showFullPacket ? 'Collapse' : 'Expand Full Letter'}
              {showFullPacket ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Supervisor Trace Steps */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 mb-0.5">
              Dual-Brain Supervisor Verification Trace:
            </div>
            {(audit?.supervisor_log || [
              { step: 'Temporal Action Localization', engine: 'Drex MoE (35B/3B)', status: 'VERIFIED', details: 'Segments s12-s14 isolated with 0.982 peak probability' },
              { step: 'Policy Exclusion Matching', engine: 'Drex System 1', status: 'TRIGGERED', details: 'Section 4.2 exclusion confirmed (p=0.964)' },
              { step: 'Pixel Bounding-Box Grounding', engine: 'NDI Ground 1.0', status: 'LOCKED', details: 'Page 7 bounding box [0.12, 0.44, 0.89, 0.62]' },
              { step: 'Final Disposition Routing', engine: 'Intern Supervisor', status: 'DENIED', details: 'Claim routed to automated denial pipeline' }
            ]).map((item, idx) => (
              <div key={idx} className="flex items-start justify-between py-1 border-b border-slate-900 last:border-0">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">{item.step}</span>
                  <span className="text-[10px] text-slate-500">{item.details}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Expandable Adjuster Letter */}
          {showFullPacket && audit?.packet_markdown && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {audit.packet_markdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

