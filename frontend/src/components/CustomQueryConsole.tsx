import React, { useState } from 'react';
import { HelpCircle, Send, Sparkles, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { askCustomQuestion } from '../services/api';

interface CustomQueryConsoleProps {
  scenarioId: string;
}

export const CustomQueryConsole: React.FC<CustomQueryConsoleProps> = ({ scenarioId }) => {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const sampleQuestions = [
    'Did the vehicle brake hard before leaving the roadway?',
    'Was the incident caused by adverse weather or rain?',
    'Did driver exceed speed limit by more than 15 MPH?',
    'Was there any documented mechanical steering failure?',
  ];

  const handleAsk = async (qText?: string) => {
    const textToAsk = qText || question;
    if (!textToAsk.trim()) return;
    setIsAsking(true);
    try {
      const res = await askCustomQuestion(textToAsk, scenarioId);
      setResult(res);
      if (qText) setQuestion(qText);
    } catch (err) {
      console.error('Ask error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const prob = result?.answer?.noul ?? 0.5;
  const isHighProb = prob > 0.7;
  const isLowProb = prob < 0.3;

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Interactive Drex Ad-Hoc Question Console
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Sub-100ms
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ask any ad-hoc probability question against the current video timeline and policy state
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              {result.latency_ms}ms
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{result.model}</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type any custom question (e.g. 'Did the vehicle brake before impact?', 'Was there mechanical failure?')..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={isAsking || !question.trim()}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-cyan-600/20"
        >
          {isAsking ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Ask Drex
        </button>
      </form>

      {/* Quick Prompts */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-500 font-medium">Try asking:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(q)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Live Result Card */}
      {result && (
        <div className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">"{result.question}"</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {result.answer?.reasoning_summary || 'Evidence evaluated against multimodal state.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
            {/* Probability Gauge */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Probability</span>
              <span
                className={`font-mono text-base font-extrabold ${
                  isHighProb ? 'text-red-400' : isLowProb ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {(prob * 100).toFixed(1)}% {isHighProb ? 'TRUE' : isLowProb ? 'FALSE' : 'POSSIBLE'}
              </span>
            </div>

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                isHighProb
                  ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                  : isLowProb
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
              }`}
            >
              {isHighProb ? 'YES' : isLowProb ? 'NO' : '?'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
