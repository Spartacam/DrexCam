import React, { useState } from 'react';
import { FileSearch, ShieldAlert, CheckCircle2, ChevronRight, Hash, Compass, BookmarkCheck } from 'lucide-react';
import { PolicyClause } from '../types';

interface PolicyGroundingPanelProps {
  clauses: PolicyClause[];
  topViolation: {
    clause_id: string;
    probability: number;
    grounding: any;
  } | null;
  scores: {
    severity: number;
    speed_excess: number;
    operator_culpability: number;
    liability_exposure: number;
    telematics_confidence: number;
  } | null;
}

export const PolicyGroundingPanel: React.FC<PolicyGroundingPanelProps> = ({
  clauses,
  topViolation,
  scores,
}) => {
  const [selectedClauseId, setSelectedClauseId] = useState<string>('c4');

  const activeClause = clauses.find((c) => c.id === selectedClauseId) || clauses[0];

  return (
    <div className="flex flex-col bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            NDI Grounded Policy Proof &amp; Clause Matrix
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            15 Clauses Extracted
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[820px]">
        {/* NDI Visual Grounding Proof Card */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Pixel-Level Bounding Box Proof
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
              NDI /v1/ground
            </span>
          </div>

          {/* SVG Crop Visualizer */}
          <div className="w-full aspect-[2.6/1] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative group">
            {selectedClauseId === 'c4' ? (
              <img
                src="/api/static/ground_crops/clause_c4_ground.svg"
                alt="Section 4.2 NDI Grounding Proof Crop"
                className="w-full h-full object-cover"
              />
            ) : selectedClauseId === 'c3' ? (
              <img
                src="/api/static/ground_crops/clause_c3_ground.svg"
                alt="Section 3.2 NDI Grounding Proof Crop"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <FileSearch className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">
                  {activeClause?.section}: {activeClause?.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  Page {activeClause?.page} • Grounding coordinates mapped by NDI Document Engine
                </p>
              </div>
            )}
          </div>

          {/* Grounding Coordinate Metadata */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Page: {activeClause?.page || 7} • BBox: [72, 315, 540, 445]
            </span>
            <span className="text-emerald-400 font-semibold">
              Pixel Confidence: 98.4%
            </span>
          </div>
        </div>

        {/* Risk Scores Summary Bar */}
        {scores && (
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Severity</div>
              <div className="text-base font-mono font-bold text-red-400">{scores.severity.toFixed(1)} / 5.0</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed Excess</div>
              <div className="text-base font-mono font-bold text-amber-400">+17 MPH</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Driver Fault</div>
              <div className="text-base font-mono font-bold text-red-400">94.0%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Exposure</div>
              <div className="text-base font-mono font-bold text-orange-400">High (3.7)</div>
            </div>
          </div>
        )}

        {/* Interactive 15-Clause Compliance Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Policy Compliance Clauses
            </h3>
            <span className="text-[11px] text-slate-500">Sorted by Drex Violation Probability</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {clauses.map((clause) => {
              const prob = clause.violation_probability ?? 0.02;
              const isSelected = clause.id === selectedClauseId;
              const isViolated = prob > 0.70;

              return (
                <div
                  key={clause.id}
                  onClick={() => setSelectedClauseId(clause.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                      : isViolated
                      ? 'bg-red-950/20 border-red-900/40 hover:bg-red-950/30'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isViolated ? (
                        <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-200">
                        {clause.section}: {clause.title}
                      </span>
                    </div>

                    {/* Drex Probability Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          prob > 0.85
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : prob > 0.50
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {(prob * 100).toFixed(1)}%
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 pl-6">
                    {clause.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
