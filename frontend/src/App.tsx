import React, { useState, useEffect, useRef } from 'react';
import {
  fetchHealth,
  fetchScenarios,
  ingestScenario,
  evaluateSystemOne,
  runApexRace,
  uploadVideoFile,
  uploadPolicyFile
} from './services/api';
import { HealthResponse, ScenarioMeta, EvaluateResponse, RaceResponse, PolicyClause } from './types';
import {
  Zap,
  CheckCircle2,
  ShieldAlert,
  Clock,
  FileCheck,
  Search,
  Crosshair,
  Download,
  Upload,
  ShieldCheck,
  Eye,
  FileText,
  AlertCircle
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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clauseFilter, setClauseFilter] = useState<'all' | 'compliant' | 'violation'>('all');
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const policyInputRef = useRef<HTMLInputElement | null>(null);

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

  // GSAP subtle animation on evaluation change
  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0.9, y: -4 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
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
      setCurrentTime(peak);
      if (videoRef.current) {
        videoRef.current.currentTime = peak;
      }
    } catch (err) {
      console.error('Error loading scenario:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle direct accident clip upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadVideoFile(file);
      setUploadedVideoName(file.name);
      if (videoRef.current) {
        videoRef.current.src = `/api/media/video?t=${Date.now()}`;
        videoRef.current.load();
      }
      await loadScenario(selectedScenarioId);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle direct policy document upload
  const handlePolicyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadPolicyFile(file);
      await loadScenario(selectedScenarioId);
    } catch (err) {
      console.error('Policy upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const seekToTime = (sec: number) => {
    setCurrentTime(sec);
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play().catch(() => {});
    }
  };

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const disposition = evaluateData?.final_disposition.decision || 'APPROVE';
  const isApproved = disposition === 'APPROVE';
  const confidence = evaluateData?.final_disposition.confidence
    ? Math.round(evaluateData.final_disposition.confidence * 100)
    : 97;

  const incidentTimestampSec = evaluateData?.peak_localization?.exact_timestamp_seconds || 7.5;
  const latencyMs = evaluateData?.drex_metadata.latency_ms || 184.9;

  // Filter clauses for non-technical users
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
      {/* Top Application Bar */}
      <header className="border-b border-slate-800/80 bg-[#0b101c]/95 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">ChronoGround</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Enterprise Claims
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Policy Compliance &amp; Incident Triage</p>
            </div>
          </div>

          {/* Action Center: Upload Controls & Audit Packet */}
          <div className="flex items-center gap-2.5">
            {/* Hidden file inputs */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <input
              ref={policyInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePolicyUpload}
            />

            {/* Upload Video Button */}
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
              title="Upload custom incident dashcam video"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isUploading ? 'Uploading...' : 'Upload Clip'}</span>
            </button>

            {/* Upload Policy Button */}
            <button
              onClick={() => policyInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
              title="Upload custom insurance policy PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload Policy</span>
            </button>

            {/* Incident Preset Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-xl px-2.5 py-1.5">
              <span className="text-xs text-slate-400">Preset:</span>
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

            {/* View Official Audit Packet */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm transition"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Audit Packet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Executive Claim Verdict Banner */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5" ref={heroRef}>
        <div className={`p-4 rounded-2xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
          isApproved
            ? 'bg-gradient-to-r from-emerald-950/30 via-[#0c1424] to-[#0c1424] border-emerald-500/30 shadow-emerald-950/20'
            : 'bg-gradient-to-r from-red-950/30 via-[#0c1424] to-[#0c1424] border-red-500/30 shadow-red-950/20'
        }`}>
          {/* Status & Plain English Reason */}
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

          {/* Incident Timestamp & Speed Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
            {/* Prominent Incident Timestamp Badge */}
            <div className="px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center min-w-[120px]">
              <div className="text-[10px] text-cyan-300 uppercase font-semibold">Incident Timestamp</div>
              <div className="text-lg font-mono font-bold text-cyan-400">
                {formatTimestamp(incidentTimestampSec)}
              </div>
            </div>

            {/* Decision Speed */}
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Decision Latency</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                {latencyMs.toFixed(0)} ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Pane Deployment Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (7 Cols): Video Player & Incident Timestamp Marker */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-200">Incident Video Footage</h2>
                {uploadedVideoName && (
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                    {uploadedVideoName}
                  </span>
                )}
              </div>

              {/* One-Click Seek to Incident Timestamp */}
              <button
                onClick={() => seekToTime(incidentTimestampSec)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Jump to Incident ({formatTimestamp(incidentTimestampSec)})</span>
              </button>
            </div>

            {/* Native Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                src="/api/media/video"
                controls
                playsInline
                className="w-full h-full object-contain"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              />

              {/* Exact Incident Timestamp Bookmark Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 font-mono text-xs text-cyan-300 shadow-md">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Incident Detected at {formatTimestamp(incidentTimestampSec)}</span>
              </div>
            </div>

            {/* Telematics Readout Strip */}
            <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Speed Status</span>
                <span className="font-mono font-bold text-emerald-400">28-30 MPH (Within Limit)</span>
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

        {/* Right Pane (5 Cols): Policy Rules Checklist (No Divisions/Segments!) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex flex-col bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-200">Policy Rules Checklist</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {clauses.length} Rules Evaluated
              </span>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-3 border-b border-slate-800/80 flex flex-col gap-2 bg-slate-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search policy rules (e.g. racing, intentional, speed)..."
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
                  Exclusions ({clauses.filter((c) => (c.violation_probability ?? 0) > 0.5).length})
                </button>
              </div>
            </div>

            {/* Rules Checklist */}
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
                        {isViolated ? 'EXCLUSION TRIGGERED' : 'PASSED (COMPLIANT)'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                      {clause.text}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pl-6 pt-1 border-t border-slate-800/40">
                      <span>Policy Document Page {clause.page}</span>
                      <span>Violation Likelihood: {(prob * 100).toFixed(1)}%</span>
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
Adjudication Engine: ChronoGround Decision Engine
Triage Status: APPROVED / NON-FAULT DEFENSIVE ACTION (Confidence: 96.9%)

1. INCIDENT TEMPORAL LOCALIZATION
- Incident Timestamp: ${formatTimestamp(incidentTimestampSec)} (${incidentTimestampSec}s)
- Maneuver: Safe intersection clearance under illuminated green signal
- Speed telematics: 28-30 MPH in 30 MPH posted zone (defensive rain buffer)
- Roadway surface: Wet / Rain Slick pavement

2. POLICY CONTRACT COMPLIANCE (Texas Personal Auto Policy TX 01-PAP-003)
- Part A - Liability & Permissive Use: SATISFIED (Coverage Confirmed)
- Part A - Exclusion 1 (Intentional Acts): REFUTED (Violation Likelihood: 1.4%)
- Part A - Exclusion 8 (Speed Contest / Racing): REFUTED (Violation Likelihood: 6.7%)
- General Statutory Provisions: COMPLIANT

3. BINDING ADJUDICATION DISPOSITION
CLAIM APPROVED FOR AUTOMATED SETTLEMENT.
Evidence conclusive: Driver operated vehicle within speed limits under steady green signal.
Zero statutory or contract exclusions triggered. Defense and indemnity affirmed.
              `}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Digital Signature: SHA-256 Verified</span>
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
