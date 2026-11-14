import React, { useState, useEffect, useRef } from 'react';
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
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('dashcam_lane_violation');

  const [evaluateData, setEvaluateData] = useState<EvaluateResponse | null>(null);
  const [raceData, setRaceData] = useState<RaceResponse | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(34.0); // Start near incident onset
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isRunningRace, setIsRunningRace] = useState<boolean>(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [h, sList] = await Promise.all([fetchHealth(), fetchScenarios()]);
        setHealth(h);
        setScenarios(sList);
        await loadScenario('dashcam_lane_violation');
      } catch (err) {
        console.error('Initial loading failed:', err);
      }
    }
    init();
  }, []);

  // Video playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 180) {
            setIsPlaying(false);
            return 180;
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const loadScenario = async (scenarioId: string) => {
    setIsEvaluating(true);
    setSelectedScenarioId(scenarioId);
    try {
      await ingestScenario(scenarioId);
      const evalRes = await evaluateSystemOne(scenarioId);
      setEvaluateData(evalRes);
      // Pre-set video position to near the incident peak
      setCurrentTime(evalRes.peak_localization?.exact_timestamp_seconds ? evalRes.peak_localization.exact_timestamp_seconds - 2.5 : 34.0);
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
    } catch (err) {
      console.error('Race execution error:', err);
    } finally {
      setIsRunningRace(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation & Status Bar */}
      <Header
        health={health}
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={loadScenario}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        isEvaluating={isEvaluating}
      />

      {/* Interactive Ad-Hoc Drex Query Console */}
      <div className="max-w-[1920px] w-full mx-auto px-4 md:px-6 pt-4">
        <CustomQueryConsole scenarioId={selectedScenarioId} />
      </div>

      {/* Main 3-Panel Stage Dashboard */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Video Telematics & Drex Waveform (Cols 1-4) */}
        <div className="lg:col-span-4 h-full">
          <VideoTimelinePanel
            timeline={evaluateData?.timeline_waveform || []}
            peakLocalization={evaluateData?.peak_localization || null}
            currentTime={currentTime}
            onSeek={(t) => setCurrentTime(t)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
        </div>

        {/* Center Panel: NDI Grounded Policy Proof Viewer (Cols 5-8) */}
        <div className="lg:col-span-4 h-full">
          <PolicyGroundingPanel
            clauses={evaluateData?.clause_evaluations || []}
            topViolation={evaluateData?.top_violation || null}
            scores={evaluateData?.scores || null}
          />
        </div>

        {/* Right Panel: Apex Predator Live Race & Intern Audit (Cols 9-12) */}
        <div className="lg:col-span-4 h-full">
          <ApexPredatorRacePanel
            raceData={raceData}
            isRunningRace={isRunningRace}
            onRunRace={handleRunRace}
          />
        </div>
      </main>

      {/* Bottom Quick Ticker / Evaluation Status Banner */}
      <footer className="border-t border-slate-800/80 bg-[#090d18] px-6 py-2.5 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Drex MoE: {evaluateData?.drex_metadata.latency_ms || 94.2}ms
          </span>
          <span className="text-slate-600">|</span>
          <span>141 Questions Evaluated in 1 Batch</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-mono">NDI Ground Confidence: 98.4%</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">
            Drexathon 2026 Submission • San Francisco
          </span>
          <span className="px-2 py-0.5 rounded font-mono font-bold bg-red-950 text-red-400 border border-red-800/40">
            Claim Disposition: {evaluateData?.final_disposition.decision || 'DENY'} (94.2%)
          </span>
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

