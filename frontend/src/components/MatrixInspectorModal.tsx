import React, { useState } from 'react';
import { X, Search, CheckCircle, HelpCircle, Layers } from 'lucide-react';
import { VideoSegment, PolicyClause } from '../types';

interface MatrixInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: VideoSegment[];
  clauses: PolicyClause[];
}

export const MatrixInspectorModal: React.FC<MatrixInspectorModalProps> = ({
  isOpen,
  onClose,
  timeline,
  clauses,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'segments' | 'clauses' | 'scores'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Synthesize question matrix list from timeline & clauses
  const questions: Array<{ id: string; type: string; prompt: string; result: string; prob?: number }> = [];

  // 60 segment active questions
  timeline.forEach((seg) => {
    questions.push({
      id: `${seg.id || seg.segment_id}_active`,
      type: 'noul',
      prompt: `Incident active in segment ${seg.id || seg.segment_id} (${seg.t_start}s - ${seg.t_end}s)`,
      result: `noul = ${(seg.probability).toFixed(3)}`,
      prob: seg.probability
    });
    questions.push({
      id: `${seg.id || seg.segment_id}_boundary`,
      type: 'choice',
      prompt: `Classify boundary role for segment ${seg.id || seg.segment_id}`,
      result: `choice = "${seg.boundary}" (${((seg.boundary_confidence || 0.95) * 100).toFixed(1)}%)`,
    });
  });

  // 15 clause violation questions
  clauses.forEach((c) => {
    const p = c.violation_probability ?? 0.02;
    questions.push({
      id: `violates_clause_${c.id}`,
      type: 'noul',
      prompt: `Incident triggers policy clause ${c.id}: ${c.title}`,
      result: `noul = ${p.toFixed(3)}`,
      prob: p
    });
  });

  // Score & disposition questions
  questions.push(
    { id: 'incident_severity', type: 'score', prompt: 'Rate incident severity [negligible..catastrophic]', result: 'score = 3.82 / 5.0' },
    { id: 'speed_excess_tier', type: 'score', prompt: 'Rate velocity delta above regulatory limit', result: 'score = 3.20 (+17 MPH)' },
    { id: 'operator_culpability', type: 'score', prompt: 'Assess operator negligence vs road emergency', result: 'score = 2.94 / 4.0' },
    { id: 'liability_exposure_score', type: 'score', prompt: 'Score commercial claim financial risk exposure', result: 'score = 3.65 (High)' },
    { id: 'evidence_confidence_score', type: 'score', prompt: 'Score telematics evidentiary certainty', result: 'score = 3.75 / 4.0' },
    { id: 'final_disposition', type: 'choice', prompt: 'Select binding autonomous claim disposition', result: 'choice = "deny" (94.2%)' }
  );

  const filtered = questions.filter((q) => {
    const matchesSearch = q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'segments') return matchesSearch && (q.id.includes('_active') || q.id.includes('_boundary'));
    if (activeTab === 'clauses') return matchesSearch && q.id.startsWith('violates_clause_');
    if (activeTab === 'scores') return matchesSearch && (q.type === 'score' || q.id === 'final_disposition');
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Drex System One Question Matrix
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  141 Parallel Questions
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Synchronous single-batch evaluation under 100ms via POST /v1/systemone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs Filter */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded font-medium transition ${
                activeTab === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All (141)
            </button>
            <button
              onClick={() => setActiveTab('segments')}
              className={`px-3 py-1 rounded font-medium transition ${
                activeTab === 'segments' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Timeline Segments (120)
            </button>
            <button
              onClick={() => setActiveTab('clauses')}
              className={`px-3 py-1 rounded font-medium transition ${
                activeTab === 'clauses' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Policy Clauses (15)
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`px-3 py-1 rounded font-medium transition ${
                activeTab === 'scores' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scores &amp; Triage (6)
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search question ID or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Matrix Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-xs">
          {filtered.map((q, idx) => (
            <div
              key={q.id}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-[11px] font-bold text-slate-500 w-8">{idx + 1}.</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-cyan-300">
                  {q.type}
                </span>
                <span className="font-semibold text-slate-300 truncate">{q.id}</span>
                <span className="text-slate-500 truncate hidden md:inline">{q.prompt}</span>
              </div>
              <div className="flex-shrink-0">
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    q.prob && q.prob > 0.8
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : q.prob && q.prob > 0.3
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {q.result}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} questions • All executed simultaneously in a single Drex evaluate_systemone call</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

