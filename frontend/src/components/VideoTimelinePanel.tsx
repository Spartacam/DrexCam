import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Eye, Activity, Crosshair } from 'lucide-react';
import { VideoSegment, PeakLocalization } from '../types';

interface VideoTimelinePanelProps {
  timeline: VideoSegment[];
  peakLocalization: PeakLocalization | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const VideoTimelinePanel: React.FC<VideoTimelinePanelProps> = ({
  timeline,
  peakLocalization,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<VideoSegment | null>(null);
  const [videoMode, setVideoMode] = useState<'camera' | 'hud'>('camera');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync video element with currentTime and isPlaying
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Dynamic Telematics HUD Simulation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Incident active between 33s and 42s
      const isIncidentZone = currentTime >= 33.0 && currentTime <= 42.0;
      const isCriticalPeak = currentTime >= 36.0 && currentTime <= 39.0;

      // 1. Road & Sky Horizon Background
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      if (isCriticalPeak) {
        gradient.addColorStop(0, '#1c0a0a');
        gradient.addColorStop(0.55, '#2e1010');
        gradient.addColorStop(1, '#110707');
      } else {
        gradient.addColorStop(0, '#0a0f1d');
        gradient.addColorStop(0.55, '#151e33');
        gradient.addColorStop(1, '#080c14');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // 2. Horizon Line
      const horizonY = h * 0.52;
      ctx.strokeStyle = isCriticalPeak ? '#7f1d1d' : '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      // 3. Perspective Road Geometry
      ctx.fillStyle = isCriticalPeak ? '#180d0d' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(w * 0.46, horizonY);
      ctx.lineTo(w * 0.54, horizonY);
      ctx.lineTo(w * 0.95, h);
      ctx.lineTo(w * 0.05, h);
      ctx.closePath();
      ctx.fill();

      // 4. Center Double Yellow Line / Lane Breach
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 10]);

      // Lateral shift of vehicle perspective during violation
      let lateralShift = 0;
      if (currentTime >= 33 && currentTime < 36) {
        lateralShift = ((currentTime - 33) / 3) * 75; // Drifting left
      } else if (currentTime >= 36 && currentTime <= 39) {
        lateralShift = 75 + Math.sin(currentTime * 8) * 6; // Trespassing into opposing lane
      } else if (currentTime > 39 && currentTime <= 42) {
        lateralShift = 75 - ((currentTime - 39) / 3) * 110; // Swerving right onto shoulder
      } else if (currentTime > 42) {
        lateralShift = -35; // Stationary on shoulder
      }

      ctx.beginPath();
      ctx.moveTo(w * 0.5, horizonY);
      ctx.lineTo(w * 0.5 + lateralShift, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Oncoming Vehicle Hazard Box during Peak (t=36s to 39s)
      if (isCriticalPeak) {
        const hazardScale = Math.min(1.0, (currentTime - 35.5) / 2.5);
        const boxW = 85 * hazardScale + 45;
        const boxH = 55 * hazardScale + 35;
        const boxX = w * 0.48 - boxW / 2;
        const boxY = horizonY + 25 * hazardScale;

        // Bounding box
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Flashing hazard label
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('CRITICAL PROXIMITY: 1.8 FT', boxX - 10, boxY - 8);

        // Headlight beams
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(boxX + 15, boxY + boxH - 12, 12, 0, Math.PI * 2);
        ctx.arc(boxX + boxW - 15, boxY + boxH - 12, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Speed Calculation
      let speedMph = 34;
      if (currentTime >= 30 && currentTime < 36) {
        speedMph = Math.round(34 + ((currentTime - 30) / 6) * 18); // Accelerates to 52mph
      } else if (currentTime >= 36 && currentTime <= 39) {
        speedMph = 52;
      } else if (currentTime > 39 && currentTime <= 42) {
        speedMph = Math.max(0, Math.round(52 - ((currentTime - 39) / 3) * 52));
      } else if (currentTime > 42) {
        speedMph = 0;
      }

      // 7. Telematics HUD Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(16, 16, 210, 84);
      ctx.strokeStyle = isIncidentZone ? '#ef4444' : '#334155';
      ctx.strokeRect(16, 16, 210, 84);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('OPTICAL TELEMATICS • CAM-04', 26, 32);

      ctx.fillStyle = speedMph > 40 ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${speedMph} MPH`, 26, 60);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`LIMIT: 35 MPH | GPS: 37.7749°N`, 26, 78);
      ctx.fillText(`G-FORCE: ${isIncidentZone ? '0.82G (LATERAL)' : '0.04G'}`, 26, 92);

      // Incident Alert Banner
      if (isIncidentZone) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(w - 240, 16, 224, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⚠ DOUBLE YELLOW TRESPASS', w - 228, 36);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="flex flex-col bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Multimodal Telematics &amp; Temporal Localization
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVideoMode(videoMode === 'camera' ? 'hud' : 'camera')}
            className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {videoMode === 'camera' ? '📹 Dashcam Stream' : '🖥️ Telematics HUD'}
          </button>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            {timeline.length || 6} Segments • 3.0s Windows
          </span>
        </div>
      </div>

      {/* Video Simulation / Camera Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        {videoMode === 'camera' ? (
          <video
            ref={videoRef}
            src="/api/media/video"
            className="w-full h-full object-cover"
            playsInline
            muted
            onTimeUpdate={(e) => {
              if (isPlaying) {
                onSeek(Math.round(e.currentTarget.currentTime * 10) / 10);
              }
            }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />
        )}

        {/* Floating Telematics Timecode */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-slate-700/80 px-2.5 py-1 rounded font-mono text-xs text-cyan-300">
          {formatTime(currentTime)} / {formatTime(timeline.length > 0 ? timeline[timeline.length - 1].t_end : 180)}
        </div>

        {/* Video Transport Controls Overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-black/70 backdrop-blur rounded-xl px-4 py-2 border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition shadow-md shadow-cyan-600/30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => onSeek(0)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset to 0s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-300">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Jump to Peak Button */}
          {peakLocalization && (
            <button
              onClick={() => onSeek(peakLocalization.exact_timestamp_seconds)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 transition shadow-sm animate-pulse"
            >
              <Crosshair className="w-3.5 h-3.5 text-red-400" />
              Seek to Drex Peak ({peakLocalization.exact_timestamp_seconds}s)
            </button>
          )}
        </div>
      </div>

      {/* Drex Synchronized Probability Waveform */}
      <div className="p-5 flex flex-col gap-3 bg-[#0a0e1a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Drex System One Probability Waveform
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700"></span> Normal
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Onset
            </span>
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Apex ({peakLocalization ? `${(peakLocalization.probability * 100).toFixed(1)}%` : 'Peak'})
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Offset
            </span>
          </div>
        </div>

        {/* Interactive Segment Bar Chart */}
        <div className="relative h-28 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-end gap-[3px] select-none">
          {timeline.map((seg, idx) => {
            const isHovered = hoveredSegment?.id === seg.id || hoveredSegment?.segment_id === seg.segment_id;
            const isCurrentSeg = currentTime >= seg.t_start && currentTime < seg.t_end;
            const prob = seg.probability;

            // Bar color logic based on Drex probability and boundary
            let barColor = 'bg-slate-800 hover:bg-slate-700';
            if (seg.boundary === 'onset' || prob > 0.88 && prob < 0.95) {
              barColor = 'bg-amber-500 hover:bg-amber-400 shadow-sm shadow-amber-500/50';
            } else if (seg.boundary === 'continuation' || prob >= 0.95) {
              barColor = 'bg-red-500 hover:bg-red-400 ring-2 ring-red-400/50 drex-glow-red animate-pulse';
            } else if (seg.boundary === 'offset' || (prob > 0.80 && prob <= 0.88)) {
              barColor = 'bg-orange-500 hover:bg-orange-400';
            } else if (prob > 0.20) {
              barColor = 'bg-cyan-900/80 hover:bg-cyan-700';
            }

            const barHeightPct = Math.max(8, Math.round(prob * 100));

            return (
              <div
                key={seg.id || seg.segment_id || idx}
                onClick={() => onSeek(seg.t_start)}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ height: `${barHeightPct}%` }}
                className={`flex-1 rounded-t-sm transition-all duration-150 cursor-pointer relative ${barColor} ${
                  isCurrentSeg ? 'ring-1 ring-cyan-300' : ''
                }`}
              >
                {/* Playhead marker indicator on active segment */}
                {isCurrentSeg && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></div>
                )}
              </div>
            );
          })}

          {/* Timecode markers underneath */}
          <div className="absolute -bottom-5 left-2 right-2 flex justify-between text-[10px] text-slate-500 font-mono pointer-events-none">
            <span>0s</span>
            <span>{peakLocalization ? `${peakLocalization.exact_timestamp_seconds}s (${peakLocalization.segment_id} Apex)` : 'Apex'}</span>
            <span>{timeline.length > 0 ? `${timeline[timeline.length - 1].t_end}s` : '180s'}</span>
          </div>
        </div>

        {/* Hovered Segment Detail Card */}
        <div className="mt-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          {hoveredSegment ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-300">
                  Segment {hoveredSegment.id || hoveredSegment.segment_id} ({hoveredSegment.t_start}s – {hoveredSegment.t_end}s)
                </span>
                <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200">
                  Role: <span className="uppercase text-cyan-400">{hoveredSegment.boundary}</span> (p = {(hoveredSegment.probability * 100).toFixed(1)}%)
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">{hoveredSegment.transcript}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {hoveredSegment.visual_tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Hover over any segment bar to view Drex probability &amp; telematics tags.</span>
              <span className="text-cyan-400 font-mono">Click to jump playback</span>
            </div>
          )}
        </div>

        {/* Action Boundary Badge Strip */}
        {peakLocalization && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Incident Onset</div>
              <div className="font-mono font-bold text-amber-400">{peakLocalization.action_boundaries.onset}</div>
            </div>
            <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 drex-glow-red">
              <div className="text-[10px] uppercase text-red-400 font-semibold">Critical Apex</div>
              <div className="font-mono font-bold text-red-300">{peakLocalization.action_boundaries.peak}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Incident Offset</div>
              <div className="font-mono font-bold text-orange-400">{peakLocalization.action_boundaries.offset}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

