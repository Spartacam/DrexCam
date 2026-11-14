import React, { useState } from 'react';
import { FileSearch, ShieldAlert, CheckCircle2, ChevronRight, BookmarkCheck, FileText } from 'lucide-react';
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
  const defaultId = topViolation?.clause_id || (clauses[0]?.id ?? 'c1');
  const [selectedClauseId, setSelectedClauseId] = useState<string>(defaultId);

  const activeClause = clauses.find((c) => c.id === selectedClauseId) || clauses[0];

  return (
    <div className="flex flex-col bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">Policy Rules &amp; NDI Grounding</h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
          {clauses.length} Clauses Evaluated
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[750px]">
        {/* Dynamic Risk Scores Grid */}
        {scores && (
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Severity</div>
              <div className="text-sm font-mono font-bold text-cyan-400">{scores.severity.toFixed(1)} / 5.0</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed Excess</div>
              <div className="text-sm font-mono font-bold text-amber-400">
                {scores.speed_excess > 0 ? `+${Math.round(scores.speed_excess * 5)} MPH` : '0 MPH (Lawful)'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Driver Fault</div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {scores.operator_culpability > 0 ? `${Math.round(scores.operator_culpability * 30)}%` : '0% (Exonerated)'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Telematics Conf</div>
              <div className="text-sm font-mono font-bold text-cyan-400">
                {scores.telematics_confidence > 4 ? 'Conclusive' : 'High'}
              </div>
            </div>
          </div>
        )}

        {/* Selected Clause Detail / Grounding Card */}
        {activeClause && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                <span>{activeClause.section}: {activeClause.title}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                Page {activeClause.page}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              "{activeClause.text}"
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>NDI Ground: Locked [Page {activeClause.page}]</span>
              <span className={(activeClause.violation_probability ?? 0) > 0.5 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {(activeClause.violation_probability ?? 0) > 0.5 ? 'EXCLUSION TRIGGERED' : 'COMPLIANT / REFUTED'}
              </span>
            </div>
          </div>
        )}

        {/* Clauses List */}
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">
            All Contract Clauses
          </div>
          {clauses.map((clause) => {
            const prob = clause.violation_probability ?? 0.01;
            const isSelected = clause.id === selectedClauseId;
            const isViolated = prob > 0.50;

            return (
              <div
                key={clause.id}
                onClick={() => setSelectedClauseId(clause.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                    : isViolated
                    ? 'bg-red-950/20 border-red-900/40 hover:bg-red-950/30'
                    : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isViolated ? (
                    <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {clause.section} - {clause.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isViolated
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isViolated ? 'VIOLATION' : 'COMPLIANT'} ({(prob * 100).toFixed(1)}%)
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
