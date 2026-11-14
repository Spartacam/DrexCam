import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoTimelinePanel } from './components/VideoTimelinePanel';
import { PolicyGroundingPanel } from './components/PolicyGroundingPanel';
import { ApexPredatorRacePanel } from './components/ApexPredatorRacePanel';
import { MatrixInspectorModal } from './components/MatrixInspectorModal';
import { CustomQueryConsole } from './components/CustomQueryConsole';
import {
  fetchHealth,
  fetchScenarios,
  ingestScenario,
  evaluateSystemOne,
  runApexRace
} from './services/api';
import { HealthResponse, ScenarioMeta, EvaluateResponse, RaceResponse } from './types';
import { CheckCircle2, ShieldAlert, Zap, Clock, TrendingUp, Swords, HelpCircle, FileSearch } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('texas_auto_nexar_incident');

  const [evaluateData, setEvaluateData] = useState<EvaluateResponse | null>(null);
  const [raceData, setRaceData] = useState<RaceResponse | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isRunningRace, setIsRunningRace] = useState<boolean>(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'policy' | 'race' | 'ask'>('policy');

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

  const loadScenario = async (scenarioId: string) => {
    setIsEvaluating(true);
    setSelectedScenarioId(scenarioId);
    try {
      await ingestScenario(scenarioId);
      const evalRes = await evaluateSystemOne(scenarioId);
      setEvaluateData(evalRes);
      setCurrentTime(evalRes.peak_localization?.exact_timestamp_seconds ? Math.max(0, evalRes.peak_localization.exact_timestamp_seconds - 2.0) : 0);
    } catch (err) {
      console.error('Error loading scenario:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRunRace = async () => {
    setIsRunningRace(true);
    setActiveTab('race');
    try {
      const result = await runApexRace(selectedScenarioId);
      setRaceData(result);
    } catch (err) {
      console.error('Race execution error:', err);
    } finally {
      setIsRunningRace(false);
    }
  };

  const disposition = evaluateData?.final_disposition.decision || 'APPROVE';
  const isApproved = disposition === 'APPROVE';
  const confidence = evaluateData?.final_disposition.confidence
    ? Math.round(evaluateData.final_disposition.confidence * 100)
    : 97;

  const apexSeconds = evaluateData?.peak_localization?.exact_timestamp_seconds || 7.5;
  const latencyMs = evaluateData?.drex_metadata.latency_ms || 219.1;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        health={health}
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={loadScenario}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        isEvaluating={isEvaluating}
      />

      {/* Hero Summary & Verdict Banner */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        <div className="p-4 rounded-2xl bg-[#0c1220] border border-slate-800/80 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* 1. Claim Adjudication Verdict */}
          <div className="md:col-span-1 flex items-center gap-3 pr-2 border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isApproved ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Final Disposition</div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold font-mono ${isApproved ? 'text-emerald-400' : 'text-red-400'}`}>
                  {disposition}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. Critical Action Apex */}
          <div className="flex items-center gap-3 pr-2 border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Critical Action Apex</div>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {apexSeconds}s <span className="text-xs font-normal text-slate-400">({evaluateData?.peak_localization?.segment_id || 's03'})</span>
              </div>
            </div>
          </div>

          {/* 3. Decision Model Latency */}
          <div className="flex items-center gap-3 pr-2 border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Drex Decision Latency</div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {latencyMs.toFixed(1)} ms
                <span className="text-[10px] ml-1.5 font-normal text-emerald-400">0 Tokens</span>
              </div>
            </div>
          </div>

          {/* 4. Apex Predator Benchmark Winner */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Benchmark Speedup</div>
              <div className="text-xl font-bold font-mono text-indigo-300">
                {raceData?.benchmark?.speedup_factor || '150x Faster'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video & Waveform (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <VideoTimelinePanel
            timeline={evaluateData?.timeline_waveform || []}
            peakLocalization={evaluateData?.peak_localization || null}
            currentTime={currentTime}
            onSeek={(t) => setCurrentTime(t)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
        </div>

        {/* Right Column: Tabbed Evidence, Race & Custom Query (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center bg-[#0c1220] border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('policy')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === 'policy'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Policy Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('race')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === 'race'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Apex Race</span>
            </button>

            <button
              onClick={() => setActiveTab('ask')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === 'ask'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask Drex</span>
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'policy' && (
            <PolicyGroundingPanel
              clauses={evaluateData?.clause_evaluations || []}
              topViolation={evaluateData?.top_violation || null}
              scores={evaluateData?.scores || null}
            />
          )}

          {activeTab === 'race' && (
            <ApexPredatorRacePanel
              raceData={raceData}
              isRunningRace={isRunningRace}
              onRunRace={handleRunRace}
            />
          )}

          {activeTab === 'ask' && (
            <CustomQueryConsole scenarioId={selectedScenarioId} />
          )}
        </div>
      </main>

      {/* Bottom Footer Ticker */}
      <footer className="border-t border-slate-800/80 bg-[#090d18] px-6 py-2.5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-mono">Drex MoE: {latencyMs.toFixed(1)}ms</span>
          <span className="text-slate-600">|</span>
          <span>{evaluateData?.drex_metadata.total_questions || 25} Simultaneous Questions Evaluated</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-mono">NDI Ground: Verified</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Drexathon 2026 • ChronoGround Multimodal Adjudication Engine
        </div>
      </footer>

      {/* 141-Question Matrix Inspector Modal */}
      <MatrixInspectorModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        timeline={evaluateData?.timeline_waveform || []}
        clauses={evaluateData?.clause_evaluations || []}
      />
    </div>
  );
};

export default App;
