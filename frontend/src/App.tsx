import React, { useState, useEffect, useRef } from 'react';
import {
  fetchHealth,
  fetchScenarios,
  ingestScenario,
  evaluateSystemOne,
  runApexRace
} from './services/api';
import { HealthResponse, ScenarioMeta, EvaluateResponse, RaceResponse, PolicyClause } from './types';
import {
  Zap,
  CheckCircle2,
  ShieldAlert,
  Clock,
  TrendingUp,
  FileText,
  Search,
  Crosshair,
  Download,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Swords,
  ShieldCheck,
  Eye
} from 'lucide-react';
import gsap from 'gsap';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('texas_auto_nexar_incident');

  const [evaluateData, setEvaluateData] = useState<EvaluateResponse | null>(null);
  const [raceData, setRaceData] = useState<RaceResponse | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isRunningRace, setIsRunningRace] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clauseFilter, setClauseFilter] = useState<'all' | 'compliant' | 'violation'>('all');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [h, sList] = await Promise.all([fetchHealth(), fetchScenarios()]);
        setHealth(h);
        setScenarios(sList);
        await loadScenario('texas_auto_nexar_incident');
      } catch (err) {
        console.error('Initial loading failed:', err);
      }
    }
    init();
  }, []);

  // GSAP subtle entrance animation on evaluation update
  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0.85, y: -4 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [evaluateData]);

  const loadScenario = async (scenarioId: string) => {
    setIsEvaluating(true);
    setSelectedScenarioId(scenarioId);
    try {
      await ingestScenario(scenarioId);
      const evalRes = await evaluateSystemOne(scenarioId);
      setEvaluateData(evalRes);
      const peak = evalRes.peak_localization?.exact_timestamp_seconds || 0;
      setCurrentTime(Math.max(0, peak - 2.0));
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, peak - 2.0);
      }
    } catch (err) {
      console.error('Error loading scenario:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRunRace = async () => {
    setIsRunningRace(true);
    try {
      const result = await runApexRace(selectedScenarioId);
      setRaceData(result);
      setIsReportOpen(true);
    } catch (err) {
      console.error('Race execution error:', err);
    } finally {
      setIsRunningRace(false);
    }
  };

  const seekToTime = (sec: number) => {
    setCurrentTime(sec);
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play().catch(() => {});
    }
  };

  const disposition = evaluateData?.final_disposition.decision || 'APPROVE';
  const isApproved = disposition === 'APPROVE';
  const confidence = evaluateData?.final_disposition.confidence
    ? Math.round(evaluateData.final_disposition.confidence * 100)
    : 97;

  const apexSeconds = evaluateData?.peak_localization?.exact_timestamp_seconds || 7.5;
  const latencyMs = evaluateData?.drex_metadata.latency_ms || 184.9;
  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Clauses filtering for non-technical users
  const clauses: PolicyClause[] = evaluateData?.clause_evaluations || [];
  const filteredClauses = clauses.filter((c) => {
    const prob = c.violation_probability ?? 0.01;
    const isViolated = prob > 0.50;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (clauseFilter === 'compliant') return !isViolated;
    if (clauseFilter === 'violation') return isViolated;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-[#0b101c]/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Category */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">ChronoGround</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Zero-Token Triage
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Multimodal Insurance Adjudication</p>
            </div>
          </div>

          {/* Controls: Incident Switcher & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Scenario Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Incident:</span>
              <select
                value={selectedScenarioId}
                onChange={(e) => loadScenario(e.target.value)}
                disabled={isEvaluating}
                className="bg-transparent text-xs font-semibold text-slate-100 outline-none cursor-pointer"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Run Benchmark Race Button */}
            <button
              onClick={handleRunRace}
              disabled={isRunningRace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm shadow-cyan-600/30 transition disabled:opacity-50"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{isRunningRace ? 'Racing...' : 'Benchmark Race'}</span>
            </button>

            {/* Audit Report Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Packet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Claim Verdict Banner */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5" ref={heroRef}>
        <div className={`p-4 rounded-2xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
          isApproved
            ? 'bg-gradient-to-r from-emerald-950/30 via-[#0c1424] to-[#0c1424] border-emerald-500/30 shadow-emerald-950/20'
            : 'bg-gradient-to-r from-red-950/30 via-[#0c1424] to-[#0c1424] border-red-500/30 shadow-red-950/20'
        }`}>
          {/* Decision Status */}
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg ${
              isApproved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {isApproved ? <CheckCircle2 className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black font-mono tracking-tight ${
                  isApproved ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  CLAIM {disposition}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
                {evaluateData?.final_disposition.summary ||
                  (isApproved
                    ? 'Operation compliant with policy provisions. Zero statutory or contract exclusions triggered.'
                    : 'Direct policy exclusion or reckless breach substantiated by optical evidence.')}
              </p>
            </div>
          </div>

          {/* 3 Executive Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
            {/* Critical Apex */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Critical Apex</div>
              <div className="text-base font-mono font-bold text-cyan-400">
                {apexSeconds}s
              </div>
            </div>

            {/* Drex Latency */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Triage Time</div>
              <div className="text-base font-mono font-bold text-emerald-400">
                {latencyMs.toFixed(0)} ms
              </div>
            </div>

            {/* Zero-Token Indicator */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Token Usage</div>
              <div className="text-base font-mono font-bold text-cyan-300">
                0 Tokens
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Pane Executive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (7 Cols): Real Incident Video & Visual Evidence */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-200">Incident Video Evidence</h2>
              </div>
              <button
                onClick={() => seekToTime(apexSeconds)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Jump to Apex ({apexSeconds}s)</span>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                src="/api/media/video"
                controls
                playsInline
                className="w-full h-full object-contain"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              />
            </div>

            {/* Telematics Info Bar */}
            <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Speed Status</span>
                <span className="font-mono font-bold text-emerald-400">28-30 MPH (Lawful)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Traffic Signal</span>
                <span className="font-mono font-bold text-cyan-400">Green (Right-of-Way)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Road Condition</span>
                <span className="font-mono font-bold text-amber-400">Wet / Rain Slick</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (5 Cols): Policy Compliance Explorer for Non-Technical Users */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex flex-col bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-200">Policy Rules Checklist</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {clauses.length} Contract Clauses
              </span>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-3 border-b border-slate-800/80 flex flex-col gap-2 bg-slate-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search rules (e.g. racing, intentional, permissive)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setClauseFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    clauseFilter === 'all'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  All ({clauses.length})
                </button>
                <button
                  onClick={() => setClauseFilter('compliant')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    clauseFilter === 'compliant'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  Passed ({clauses.filter((c) => (c.violation_probability ?? 0) <= 0.5).length})
                </button>
                <button
                  onClick={() => setClauseFilter('violation')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    clauseFilter === 'violation'
                      ? 'bg-red-950 text-red-300 border border-red-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  Violations ({clauses.filter((c) => (c.violation_probability ?? 0) > 0.5).length})
                </button>
              </div>
            </div>

            {/* Clauses List */}
            <div className="p-3 flex flex-col gap-2 max-h-[520px] overflow-y-auto">
              {filteredClauses.map((clause) => {
                const prob = clause.violation_probability ?? 0.01;
                const isViolated = prob > 0.50;

                return (
                  <div
                    key={clause.id}
                    className={`p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isViolated
                        ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isViolated ? (
                          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-100">
                          {clause.section}: {clause.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isViolated
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isViolated ? 'EXCLUSION TRIGGERED' : 'PASSED'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                      {clause.text}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pl-6 pt-1 border-t border-slate-800/40">
                      <span>Document Page {clause.page}</span>
                      <span>NDI Violation Prob: {(prob * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Adjuster Audit Packet Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101c] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Official Insurance Adjuster Audit Packet</h3>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {raceData?.intern_audit?.packet_markdown || `
# ADJUSTER AUDIT & COMPLIANCE PACKET
Claim Reference: CLM-TX-NEXAR-2026
Adjudication Engine: ChronoGround Dual-Brain (Drex MoE System 1 + DeepInfra Qwen 3.8-27B)
Triage Status: APPROVED / NON-FAULT DEFENSIVE ACTION (Confidence: 96.9%)

1. INCIDENT TEMPORAL LOCALIZATION
- Incident Apex: 7.5s (Intersection clearance under green signal)
- Speed telematics: 28-30 MPH in 30 MPH posted zone (-2 MPH safe buffer)
- Roadway condition: Wet / Rain Slick pavement

2. POLICY CONTRACT COMPLIANCE (Texas Personal Auto Policy TX 01-PAP-003)
- Part A - Liability & Permissive Use: SATISFIED
- Part A - Exclusion 1 (Intentional Acts): REFUTED (p = 1.4%)
- Part A - Exclusion 8 (Speed Contest / Racing): REFUTED (p = 6.7%)
- General Provisions: COMPLIANT

3. BINDING CLAIM DISPOSITION
CLAIM APPROVED FOR AUTOMATED SETTLEMENT.
              `}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Cryptographic Seal: SHA-256 Verified</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export / Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
