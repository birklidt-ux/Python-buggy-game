import React, { useState } from 'react';
import { MISSIONS } from '../services/gamePresets';
import { GraduationCap, X, CheckCircle2, Sliders, FileText, ExternalLink, HelpCircle } from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorksheet: () => void;
  onSelectMission: (missionId: string) => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onOpenWorksheet,
  onSelectMission
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(MISSIONS[0].id);

  if (!isOpen) return null;

  const currentMission = MISSIONS.find((m) => m.id === selectedMissionId) || MISSIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Teacher Dashboard & Lesson Guide</h2>
              <p className="text-xs text-indigo-300 font-mono">Intro to Computer Science & Python Debugging Lab</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenWorksheet();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Student Lab Worksheet</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pedagogical Overview */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-indigo-200">Classroom Lesson Objective</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Students act as game QA engineers debugging an arcade game. By moving between the <strong>live visual GUI</strong> and the <strong>underlying Python code</strong>, students build intuition for how mathematical coordinates, conditional branches, bounding-box collision math, and accumulators control what happens on screen.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-indigo-300/80 font-mono">
              <span className="bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">CSTA 2-AP-10 (Control Flow)</span>
              <span className="bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">CSTA 2-AP-11 (Variables & State)</span>
              <span className="bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">CSTA 2-AP-17 (Systematic Debugging)</span>
            </div>
          </div>

          {/* Mission Answer Keys */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Answer Key & Teacher Explanations</h3>
              <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                {MISSIONS.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMissionId(m.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${
                      selectedMissionId === m.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    M{m.number}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Mission Detailed Breakdown */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    MISSION {currentMission.number}: {currentMission.difficulty.toUpperCase()}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{currentMission.title}</h4>
                  <p className="text-xs text-slate-400">{currentMission.subtitle}</p>
                </div>
                <button
                  onClick={() => {
                    onSelectMission(currentMission.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Load in Workspace</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Glitch Symptom in GUI:</span>
                    <p className="text-rose-300 font-mono bg-rose-950/20 p-2.5 rounded border border-rose-900/40">
                      {currentMission.qaBugReport}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">CS Concept Taught:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800">
                      {currentMission.conceptDescription}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-emerald-400 font-semibold block mb-0.5">The Solution Code:</span>
                    <pre className="p-2.5 bg-black/70 text-emerald-300 font-mono text-[11px] rounded border border-emerald-900/40 max-h-48 overflow-y-auto whitespace-pre">
                      {currentMission.solutionCode}
                    </pre>
                  </div>

                  <div>
                    <span className="text-amber-400 font-semibold block mb-0.5">Common Student Misconceptions:</span>
                    <p className="text-slate-300 text-xs bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed">
                      {currentMission.number === 1 && 'Students often think X increases in both directions or forget that screen coordinates start at top-left.'}
                      {currentMission.number === 2 && 'Students frequently confuse `<` and `>` or forget that screen clamping requires subtracting the player\'s sprite width.'}
                      {currentMission.number === 3 && 'Students may not notice the extra line that deducts lives, teaching them to read the entire function body.'}
                      {currentMission.number === 4 && 'The classic `or` vs `and` bug! Visualizing the bounding boxes with "Show Hitboxes" makes this instantly click.'}
                      {currentMission.number === 5 && 'Demonstrates frame-rate physics. Students learn why game engines use constant velocity or delta-time.'}
                      {currentMission.number === 6 && 'Inverted Boolean conditions: students learn that base termination cases must test the failure threshold, not full health.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Discussion Prompts for Teachers */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Whole-Class Discussion Questions:</h4>
            <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
              <li>"Why is testing a game just as important as writing the initial code?"</li>
              <li>"How did stepping frame-by-frame help you isolate the exact moment the bug occurred?"</li>
              <li>"Why did changing `or` to `and` in the collision function change everything?"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
