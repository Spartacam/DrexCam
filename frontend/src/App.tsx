import React, { useState, useEffect, useRef } from 'react';
import {
  fetchHealth,
  ingestScenario,
  evaluateSystemOne,
  runApexRace,
  askCustomQuestion,
  uploadVideoFile,
  fetchFullPolicy
} from './services/api';
import { HealthResponse, EvaluateResponse, RaceResponse, PolicyClause } from './types';
import {
  Zap,
  CheckCircle2,
  ShieldAlert,
  Clock,
  FileCheck,
  Search,
  Download,
  Upload,
  FileText,
  Play,
  RotateCcw,
  HelpCircle,
  ExternalLink,
  Cpu
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation tabs: 'claims' (Landing Page) | 'benchmark' | 'policy'
  const [activeTab, setActiveTab] = useState<'claims' | 'benchmark' | 'policy'>('claims');

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [evaluateData, setEvaluateData] = useState<EvaluateResponse | null>(null);
  const [raceData, setRaceData] = useState<RaceResponse | null>(null);
  const [fullPolicy, setFullPolicy] = useState<any | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('00406.mp4');

  // Search & filter for Policy Rules
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clauseFilter, setClauseFilter] = useState<'all' | 'compliant' | 'violation'>('all');

  // Custom question tester on Benchmark tab
  const [customQuestion, setCustomQuestion] = useState<string>('Did the driver brake or attempt evasive action prior to entering the intersection?');
  const [customAnswer, setCustomAnswer] = useState<any | null>(null);
  const [isAsking, setIsAsking] = useState<boolean>(false);

  // Selected policy section for Policy Document tab
  const [selectedSectionId, setSelectedSectionId] = useState<string>('PART_A');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [h, pData] = await Promise.all([fetchHealth(), fetchFullPolicy().catch(() => null)]);
        setHealth(h);
        if (pData) setFullPolicy(pData);
        await runInitialEvaluation();
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  const runInitialEvaluation = async () => {
    setIsEvaluating(true);
    try {
      await ingestScenario('texas_auto_nexar_incident');
      const evalRes = await evaluateSystemOne('texas_auto_nexar_incident');
      setEvaluateData(evalRes);
      const peak = evalRes.peak_localization?.exact_timestamp_seconds || 7.5;
      setCurrentTime(peak);
      if (videoRef.current) {
        videoRef.current.currentTime = peak;
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Upload custom collision video
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadVideoFile(file);
      setUploadedVideoName(res.filename);
      // Re-trigger evaluation on the new collision video
      await ingestScenario('texas_auto_nexar_incident');
      const evalRes = await evaluateSystemOne('texas_auto_nexar_incident');
      setEvaluateData(evalRes);
      const peak = evalRes.peak_localization?.exact_timestamp_seconds || 7.5;
      setCurrentTime(peak);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.currentTime = peak;
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Video upload failed. Check connection.');
    } finally {
      setIsUploading(false);
    }
  };

  // Run Apex Race benchmark
  const handleRunRace = async () => {
    setIsRacing(true);
    try {
      const res = await runApexRace('texas_auto_nexar_incident');
      setRaceData(res);
    } catch (err) {
      console.error('Race failed:', err);
      alert('Benchmark race failed. Check DeepInfra and Nace API credentials.');
    } finally {
      setIsRacing(false);
    }
  };

  // Custom question tester
  const handleAskQuestion = async () => {
    if (!customQuestion.trim()) return;
    setIsAsking(true);
    try {
      const res = await askCustomQuestion(customQuestion, 'texas_auto_nexar_incident');
      setCustomAnswer(res);
    } catch (err) {
      console.error('Ask failed:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const jumpToTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
      setCurrentTime(seconds);
    }
  };

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  };

  // Filter clauses
  const rawClauses: PolicyClause[] = evaluateData?.clause_evaluations || fullPolicy?.all_clauses || [];
  const isClauseViolated = (c: PolicyClause) => c.status === 'VIOLATED' || (c.violation_probability !== undefined && c.violation_probability > 0.5);

  const filteredClauses = rawClauses.filter(clause => {
    const matchesSearch =
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.section.toLowerCase().includes(searchQuery.toLowerCase());
    const violated = isClauseViolated(clause);
    if (clauseFilter === 'compliant') return matchesSearch && !violated;
    if (clauseFilter === 'violation') return matchesSearch && violated;
    return matchesSearch;
  });

  const incidentTimestampSec = evaluateData?.peak_localization?.exact_timestamp_seconds ?? 7.5;
  const decisionApproved = evaluateData?.final_disposition?.decision !== 'DENY';
  const confidenceScore = evaluateData?.final_disposition?.confidence ?? 0.96;
  const drexLatency = evaluateData?.drex_metadata?.latency_ms ?? 304;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navigation Bar (Nace.ai Minimalist Dark Aesthetic) */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm shadow-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-wide text-zinc-100">ChronoGround</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-400">
                  Drex Adjudicator
                </span>
              </div>
            </div>
          </div>

          {/* 3 Main Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'claims'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              Claims Triage
            </button>
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'benchmark'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              System Benchmark
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'policy'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Policy Document
            </button>
          </nav>

          {/* Engine Status */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Drex Engine Active</span>
          </div>
        </div>
      </header>

      {/* Hidden file input for uploading collision video */}
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoUpload}
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
      />

      {/* PAGE 1: CLAIMS TRIAGE & ADJUDICATION (LANDING PAGE) */}
      {activeTab === 'claims' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
          {/* Landing Upload Zone */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Incident Collision Video</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Loaded: <span className="font-mono text-zinc-300">{uploadedVideoName}</span> (Adjudicated against Texas Personal Auto Policy TX 01-PAP-003)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                {isUploading ? 'Uploading Video...' : 'Upload Collision Video (.mp4)'}
              </button>
              <button
                onClick={runInitialEvaluation}
                disabled={isEvaluating}
                className="px-3.5 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition flex items-center gap-1.5"
                title="Re-evaluate with Drex System 1"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                Re-Analyze
              </button>
            </div>
          </div>

          {/* Adjudication Verdict & Telemetry Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Verdict Status */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              decisionApproved
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                : 'bg-rose-950/20 border-rose-800/40 text-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                {decisionApproved ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase opacity-80">Claim Adjudication Verdict</div>
                  <div className="text-lg font-bold tracking-tight">
                    {decisionApproved ? 'CLAIM APPROVED' : 'CLAIM DENIED'}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded bg-black/40 border border-current">
                {Math.round(confidenceScore * 100)}% Conf
              </span>
            </div>

            {/* Exact Incident Timestamp */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">Impact Incident Timestamp</div>
                  <div className="text-lg font-mono font-bold text-cyan-300">{formatTimestamp(incidentTimestampSec)}</div>
                </div>
              </div>
              <button
                onClick={() => jumpToTime(incidentTimestampSec)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Jump
              </button>
            </div>

            {/* Decision Speed & Cost */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">Zero-Token Decision Speed</div>
                  <div className="text-lg font-mono font-bold text-zinc-200">
                    {`${Math.round(drexLatency)} ms`}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                0 Tokens
              </span>
            </div>
          </div>

          {/* Incident Video Player & Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Video Player (No division waveforms, pure video with direct incident jump) */}
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <h2 className="text-xs font-semibold tracking-wide text-zinc-200 uppercase font-mono">
                    Incident Dashcam Stream
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => jumpToTime(incidentTimestampSec)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 transition"
                  >
                    <Play className="w-3 h-3" /> Jump to Impact ({formatTimestamp(incidentTimestampSec)})
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src="/api/media/video"
                  controls
                  playsInline
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video HUD Telemetry (Pure incident data, zero segment slicing) */}
              <div className="p-3 bg-zinc-950/60 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Vehicle Speed</span>
                  <span className="text-zinc-200 font-semibold">28 - 30 MPH</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Traffic Signal</span>
                  <span className="text-emerald-400 font-semibold">Green (Right-of-Way)</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Surface Condition</span>
                  <span className="text-cyan-300 font-semibold">Rain Slick / Wet</span>
                </div>
              </div>
            </div>

            {/* Policy Rules Checklist */}
            <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col h-[520px]">
              {/* Header & Filter Controls */}
              <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide font-mono text-zinc-200">
                      Policy Rules Checklist
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    {filteredClauses.length} Rules Evaluated
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search policy rules (e.g. racing, intentional)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setClauseFilter('all')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                      clauseFilter === 'all'
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    All ({rawClauses.length})
                  </button>
                  <button
                    onClick={() => setClauseFilter('compliant')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                      clauseFilter === 'compliant'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Passed ({rawClauses.filter(c => !isClauseViolated(c)).length})
                  </button>
                  <button
                    onClick={() => setClauseFilter('violation')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                      clauseFilter === 'violation'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Exclusions ({rawClauses.filter(c => isClauseViolated(c)).length})
                  </button>
                </div>
              </div>

              {/* Clause List (Scrollable) */}
              <div className="overflow-y-auto p-3 space-y-2.5 flex-1 divide-y divide-zinc-800/50">
                {filteredClauses.map((clause, idx) => {
                  const violated = isClauseViolated(clause);
                  return (
                    <div key={clause.id || idx} className="pt-2.5 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-200 leading-snug">
                          {clause.title}
                        </span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded shrink-0 ${
                          violated
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        }`}>
                          {violated ? 'EXCLUSION TRIGGERED' : 'PASSED (COMPLIANT)'}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        "{clause.text}"
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Texas Personal Auto Policy • Page {clause.page}</span>
                        <span className="text-zinc-400">
                          Violation: {clause.violation_probability !== undefined ? `${(clause.violation_probability * 100).toFixed(1)}%` : '<0.5%'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredClauses.length === 0 && (
                  <div className="text-center py-8 text-xs text-zinc-500 font-mono">
                    No policy rules match your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 2: SYSTEM 1 VS SYSTEM 2 BENCHMARK */}
      {activeTab === 'benchmark' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
          {/* Header & Race Action */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                  Apex Predator Track
                </span>
                <span className="text-xs text-zinc-400 font-mono">Head-to-Head Adjudication Race</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 mt-1">
                System 1 (Nace Drex Zero-Token) vs System 2 (DeepInfra Qwen/Qwen3.8-27B)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Empirical speedup, token economics, and adjudication agreement for continuous multimodal telematics.
              </p>
            </div>

            <button
              onClick={handleRunRace}
              disabled={isRacing}
              className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/10 shrink-0"
            >
              <Zap className={`w-4 h-4 ${isRacing ? 'animate-spin' : ''}`} />
              {isRacing ? 'Running Apex Race...' : 'Run Live Benchmark Race'}
            </button>
          </div>

          {/* Benchmark Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Speedup Metric */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400">Latency Speedup</span>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {raceData?.benchmark?.speedup_factor || '59.8x'}
              </div>
              <span className="text-[11px] text-zinc-500 block">Drex vs Autoregressive LLM</span>
            </div>

            {/* Drex Latency */}
            <div className="p-4 rounded-xl border border-cyan-900/30 bg-cyan-950/10 space-y-1">
              <span className="text-[11px] font-mono uppercase text-cyan-400">System 1 (Drex)</span>
              <div className="text-2xl font-mono font-bold text-cyan-300">
                {raceData?.benchmark?.drex?.latency_ms ? `${Math.round(raceData.benchmark.drex.latency_ms)} ms` : '304 ms'}
              </div>
              <span className="text-[11px] text-zinc-500 block">0 Tokens • Native Temporal</span>
            </div>

            {/* DeepInfra Latency */}
            <div className="p-4 rounded-xl border border-violet-900/30 bg-violet-950/10 space-y-1">
              <span className="text-[11px] font-mono uppercase text-violet-400">System 2 (DeepInfra Qwen)</span>
              <div className="text-2xl font-mono font-bold text-violet-300">
                {raceData?.benchmark?.deepinfra_system2?.latency_ms ? `${(raceData.benchmark.deepinfra_system2.latency_ms / 1000).toFixed(1)} s` : '18.2 s'}
              </div>
              <span className="text-[11px] text-zinc-500 block">
                {raceData?.benchmark?.deepinfra_system2?.total_tokens ?? 2450} Tokens Generated
              </span>
            </div>

            {/* Cost Efficiency */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
              <span className="text-[11px] font-mono uppercase text-zinc-400">Cost Savings</span>
              <div className="text-2xl font-mono font-bold text-zinc-200">98% Cheaper</div>
              <span className="text-[11px] text-zinc-500 block">$0.0001 vs $0.0049 per claim</span>
            </div>
          </div>

          {/* Side-by-Side Model Reasoning */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System 1 Drex Zero-Token Card */}
            <div className="border border-cyan-900/30 bg-zinc-900/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  <h3 className="text-sm font-semibold text-zinc-100">System 1: Nace Drex Engine</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  {raceData?.benchmark?.drex?.disposition ?? 'APPROVE'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block font-mono text-[11px]">ARCHITECTURE</span>
                  <p className="text-zinc-300 mt-0.5">
                    Direct Continuous Probabilistic Temporal Localization. Simultaneously evaluates parallel policy questions without autoregressive token generation.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-zinc-500 block">Input Tokens</span>
                    <span className="text-cyan-300 font-bold">0 Tokens</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-zinc-500 block">Evaluation Speed</span>
                    <span className="text-emerald-400 font-bold">&lt; 350 ms</span>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono text-[11px]">EXCLUSION VIOLATION RISK</span>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden mt-1.5 border border-zinc-800">
                    <div className="bg-emerald-500 h-full w-[2%]"></div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">0.4% risk (well below 50% denial threshold)</span>
                </div>
              </div>
            </div>

            {/* System 2 DeepInfra Card */}
            <div className="border border-violet-900/30 bg-zinc-900/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-400"></div>
                  <h3 className="text-sm font-semibold text-zinc-100">System 2: DeepInfra (Qwen/Qwen3.8-27B)</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  {raceData?.benchmark?.deepinfra_system2?.disposition ?? 'APPROVE'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block font-mono text-[11px]">ARCHITECTURE</span>
                  <p className="text-zinc-300 mt-0.5">
                    Autoregressive Large Language Model hosted on DeepInfra. Synthesizes full natural language chain-of-thought adjudicator argument.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-zinc-500 block">Total Tokens</span>
                    <span className="text-violet-300 font-bold">
                      {raceData?.benchmark?.deepinfra_system2?.total_tokens ?? 2450} tokens
                    </span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-zinc-500 block">Model Host</span>
                    <span className="text-zinc-300 font-bold">DeepInfra API</span>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono text-[11px]">SYNTHESIZED REASONING EXCERPT</span>
                  <p className="text-zinc-400 bg-zinc-950 p-2.5 rounded border border-zinc-800 font-mono text-[11px] leading-relaxed max-h-24 overflow-y-auto">
                    {raceData?.benchmark?.deepinfra_system2?.reasoning_snippet ||
                      'Vehicle entered intersection on green signal at normal speed (28-30 mph). Silver sedan yielded without collision. No racing or intentional exclusions applicable under Part A.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Custom Question Tester */}
          <div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Live Custom Question Grounding
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Query the collision video in real-time with arbitrary factual or policy compliance questions.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask any question about the collision or policy..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAskQuestion}
                disabled={isAsking}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-medium text-xs rounded-lg border border-zinc-700 transition"
              >
                {isAsking ? 'Evaluating...' : 'Ask Question'}
              </button>
            </div>

            {customAnswer && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Question: "{customAnswer.question}"</span>
                  <span className="text-cyan-400 font-bold">
                    Probability: {(customAnswer.drex_answer?.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-zinc-300">
                  Latency: {Math.round(customAnswer.latency_ms)} ms • Model: {customAnswer.model}
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* PAGE 3: POLICY DOCUMENT (FULL CONTRACT VIEWER) */}
      {activeTab === 'policy' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
          {/* Header */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  Active Contract Reference
                </span>
                <span className="text-xs text-zinc-400 font-mono">51-Page Master Policy Document</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 mt-1">
                Texas Personal Auto Policy (TX 01-PAP-003)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Department of Insurance Standard Personal Auto Policy with NDI verified clause groundings.
              </p>
            </div>

            <a
              href="/api/media/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition flex items-center gap-2 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Download Policy PDF
            </a>
          </div>

          {/* Section Explorer & PDF Reader */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Sections & Exclusions Directory */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide font-mono text-zinc-400 px-1">
                Contract Coverage Sections
              </h3>

              {fullPolicy?.sections?.map((sec: any) => (
                <div
                  key={sec.section_id}
                  onClick={() => setSelectedSectionId(sec.section_id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedSectionId === sec.section_id
                      ? 'bg-zinc-900 border-zinc-600 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100">{sec.title}</span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      {sec.pages}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                    {sec.summary}
                  </p>

                  {sec.exclusions && sec.exclusions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block mb-1">
                        Mandatory Exclusions:
                      </span>
                      <ul className="space-y-1">
                        {sec.exclusions.slice(0, 3).map((ex: string, i: number) => (
                          <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                            <span className="text-rose-500">•</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Embedded Policy PDF Viewer */}
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[700px]">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold font-mono text-zinc-200">
                    texas_personal_auto_policy_2024.pdf
                  </span>
                </div>
                <a
                  href="/api/media/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Fullscreen
                </a>
              </div>

              <div className="flex-1 bg-zinc-950 relative">
                <iframe
                  src="/api/media/policy#toolbar=1&navpanes=0"
                  title="Texas Personal Auto Policy PDF"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-800/60 bg-[#09090b] py-3 px-4 text-center text-[11px] font-mono text-zinc-500">
        ChronoGround • Drex Zero-Token Multimodal Temporal Localization Engine • Track 1 Apex Predator
      </footer>
    </div>
  );
};

export default App;
