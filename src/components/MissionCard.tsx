import React, { useState } from 'react';
import { Mission } from '../types/game';
import { Bug, CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp, BookOpen, Target, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/sound';

interface MissionCardProps {
  mission: Mission;
  testResults: { [id: string]: { passed: boolean; message: string } };
  isRunningTests: boolean;
  onRunMissionTests: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  testResults,
  isRunningTests,
  onRunMissionTests
}) => {
  const [revealedHint, setRevealedHint] = useState<number>(0);
  const [showConcept, setShowConcept] = useState<boolean>(true);

  const allPassed =
    mission.testCases.length > 0 &&
    mission.testCases.every((tc) => testResults[tc.id]?.passed);

  const handleTestRun = async () => {
    onRunMissionTests();
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Mission Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Mission {mission.number}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                mission.difficulty === 'Beginner'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : mission.difficulty === 'Intermediate'
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              {mission.difficulty}
            </span>
          </div>

          {allPassed && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 rounded animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>BUG RESOLVED!</span>
            </div>
          )}
        </div>

        <h2 className="text-lg font-bold text-slate-100">{mission.title}</h2>
        <p className="text-xs text-indigo-300/80 font-mono mt-0.5">{mission.subtitle}</p>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* QA Bug Report Card */}
        <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 mb-1.5">
            <Bug className="w-4 h-4 text-rose-400 shrink-0" />
            <span>QA Incident Report:</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed font-mono">
            {mission.qaBugReport}
          </p>
        </div>

        {/* Expected Behavior */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Target Objective:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {mission.expectedBehavior}
          </p>
        </div>

        {/* CS Concept Explanation */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowConcept(!showConcept)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Computer Science Concept: {mission.csConcept}</span>
            </div>
            {showConcept ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {showConcept && (
            <div className="p-3 pt-0 text-xs text-slate-300/90 leading-relaxed border-t border-slate-800/40 bg-black/20">
              {mission.conceptDescription}
            </div>
          )}
        </div>

        {/* Test Verification Suite */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Automated Bug Verification Tests:</span>
            <button
              onClick={handleTestRun}
              disabled={isRunningTests}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isRunningTests ? 'Testing...' : 'Verify Fixes'}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {mission.testCases.map((tc) => {
              const res = testResults[tc.id];
              return (
                <div
                  key={tc.id}
                  className={`flex items-start gap-2 p-2 rounded border text-xs ${
                    res?.passed
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                      : res
                      ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                      : 'bg-slate-900 border-slate-800/70 text-slate-400'
                  }`}
                >
                  {res?.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : res ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">{tc.description}</div>
                    {res && (
                      <div className={`text-[11px] mt-0.5 font-mono ${res.passed ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
                        {res.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progressive Teacher Hints */}
        <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Need a Hint? (Progressive Guidance)</span>
            </div>
            <span className="text-[11px] text-amber-400/70 font-normal">
              {revealedHint} of 3 unlocked
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setRevealedHint(Math.max(1, revealedHint === 1 ? 0 : 1))}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                revealedHint >= 1
                  ? 'bg-amber-950/60 border-amber-700 text-amber-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hint 1: Where to look
            </button>
            <button
              onClick={() => setRevealedHint(Math.max(2, revealedHint === 2 ? 1 : 2))}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                revealedHint >= 2
                  ? 'bg-amber-950/60 border-amber-700 text-amber-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hint 2: Logic Tip
            </button>
            <button
              onClick={() => setRevealedHint(Math.max(3, revealedHint === 3 ? 2 : 3))}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                revealedHint >= 3
                  ? 'bg-amber-950/60 border-amber-700 text-amber-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hint 3: Code Fix
            </button>
          </div>

          {revealedHint >= 1 && (
            <div className="p-2.5 bg-slate-950 rounded border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed font-mono">
              <span className="text-amber-400 font-bold block mb-0.5">Hint 1 (Location):</span>
              {mission.hints.level1}
            </div>
          )}

          {revealedHint >= 2 && (
            <div className="p-2.5 bg-slate-950 rounded border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed font-mono">
              <span className="text-amber-400 font-bold block mb-0.5">Hint 2 (The Logic Flaw):</span>
              {mission.hints.level2}
            </div>
          )}

          {revealedHint >= 3 && (
            <div className="p-2.5 bg-slate-950 rounded border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed font-mono">
              <span className="text-amber-400 font-bold block mb-0.5">Hint 3 (Solution Direction):</span>
              {mission.hints.level3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
