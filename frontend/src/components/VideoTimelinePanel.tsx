import React, { useState, useRef, useEffect } from 'react';
import { VideoSegment, PeakLocalization } from '../types';
import { Eye, Crosshair, Activity, Clock } from 'lucide-react';

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
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<VideoSegment | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync external seek time with video element
  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const activeSegment =
    timeline.find((s) => currentTime >= s.t_start && currentTime < s.t_end) ||
    timeline[0];

  const displaySegment = hoveredSegment || activeSegment;

  const totalDuration = timeline.length > 0 ? timeline[timeline.length - 1].t_end : 18;

  const formatSecs = (sec: number) => `${sec.toFixed(1)}s`;

  return (
    <div className="flex flex-col bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">Incident Video &amp; Temporal Waveform</h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
          {timeline.length} Segments • {totalDuration}s
        </span>
      </div>

      {/* Real HTML5 Video Player */}
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          src="/api/media/video"
          controls
          playsInline
          className="w-full h-full object-contain"
          onTimeUpdate={(e) => onSeek(e.currentTarget.currentTime)}
        />

        {/* Quick Apex Jump Button */}
        {peakLocalization && (
          <button
            onClick={() => onSeek(peakLocalization.exact_timestamp_seconds)}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-lg backdrop-blur transition"
            title="Jump directly to critical action apex"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Apex {peakLocalization.exact_timestamp_seconds}s</span>
          </button>
        )}
      </div>

      {/* Synchronized Probability Waveform */}
      <div className="p-4 flex flex-col gap-3 bg-[#0a0e1a]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drex Probabilistic Timeline</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-700"></span> Normal
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Active
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Apex Peak
            </span>
          </div>
        </div>

        {/* Interactive Segment Bar Waveform */}
        <div className="relative h-24 bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-end gap-1 select-none">
          {timeline.map((seg, idx) => {
            const isCurrent = currentTime >= seg.t_start && currentTime < seg.t_end;
            const prob = seg.probability;

            let barColor = 'bg-slate-800 hover:bg-slate-700';
            if (seg.boundary === 'continuation' || prob >= 0.90) {
              barColor = 'bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/40 ring-1 ring-cyan-200';
            } else if (seg.boundary === 'onset' || (prob >= 0.60 && prob < 0.90)) {
              barColor = 'bg-amber-400 hover:bg-amber-300 shadow-sm shadow-amber-400/30';
            } else if (seg.boundary === 'offset' || prob >= 0.30) {
              barColor = 'bg-orange-400/80 hover:bg-orange-300';
            }

            const barHeightPct = Math.max(10, Math.round(prob * 100));

            return (
              <div
                key={seg.id || seg.segment_id || idx}
                onClick={() => onSeek(seg.t_start)}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ height: `${barHeightPct}%` }}
                className={`flex-1 rounded-t-sm transition-all duration-150 cursor-pointer relative ${barColor} ${
                  isCurrent ? 'ring-2 ring-white scale-105 z-10' : ''
                }`}
                title={`[${seg.id || seg.segment_id}] ${seg.t_start}s-${seg.t_end}s | Prob: ${(prob * 100).toFixed(1)}%`}
              >
                {/* Micro segment label */}
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500">
                  {seg.id || seg.segment_id}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time markers */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>0.0s</span>
          <span>{peakLocalization ? `Apex ${peakLocalization.exact_timestamp_seconds}s` : `${(totalDuration / 2).toFixed(1)}s`}</span>
          <span>{formatSecs(totalDuration)}</span>
        </div>

        {/* Active / Hovered Segment Detail */}
        {displaySegment && (
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Segment {displaySegment.id || displaySegment.segment_id} ({displaySegment.t_start}s – {displaySegment.t_end}s)
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                Role: <span className="uppercase text-cyan-400 font-bold">{displaySegment.boundary}</span> ({(displaySegment.probability * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{displaySegment.transcript}</p>
            {displaySegment.visual_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {displaySegment.visual_tags.map((tag, i) => (
                  <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
