import React from 'react';
import { MISSIONS } from '../services/gamePresets';
import { Printer, X, Download } from 'lucide-react';

interface WorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorksheetModal: React.FC<WorksheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div>
            <h2 className="text-base font-bold">Printable CS Lab Assignment</h2>
            <p className="text-xs text-slate-400">Ready to print or save as PDF for your classroom</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Worksheet (Ctrl+P)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Worksheet Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white font-sans text-slate-900 print:overflow-visible print:p-4">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                  Computer Science Lab: Python Game Debugging
                </h1>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  Course: Intro to Computer Science & Coding · Instructor: Classroom Lab
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                PyBug Hunter Arcade Lab
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="font-bold">Student Name:</span> ___________________________
              </div>
              <div>
                <span className="font-bold">Date:</span> ___________________
              </div>
              <div>
                <span className="font-bold">Period / Block:</span> _________
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3.5 bg-slate-100 rounded-lg text-xs leading-relaxed border border-slate-300">
            <span className="font-bold uppercase tracking-wider block mb-1">Lab Instructions:</span>
            You are a Game Software Engineer at Pixel Dynamics. A junior developer pushed code with multiple bugs and glitches that broke the arcade engine. For each mission:
            <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-700">
              <li>Play the game GUI and observe the malfunctioning behavior.</li>
              <li>Inspect the Python code in the code editor to locate the error.</li>
              <li>Fix the code, click <strong>Run & Test</strong>, and verify that the automated tests pass.</li>
              <li>Fill out your findings below for instructor grading.</li>
            </ol>
          </div>

          {/* Missions Questions */}
          <div className="space-y-6">
            {MISSIONS.slice(0, 5).map((m) => (
              <div key={m.id} className="p-4 border border-slate-300 rounded-lg space-y-3 break-inside-avoid">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Mission {m.number}: {m.title} ({m.csConcept})
                  </h3>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    [ ___ / 10 pts ]
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-semibold text-slate-800">1. Symptom: What glitch did you observe when playing the game GUI?</span>
                    <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800">2. Root Cause: Which Python operator or condition caused the bug?</span>
                    <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800">3. The Fix: Write the corrected line(s) of Python code:</span>
                    <div className="h-14 bg-slate-50 border border-slate-200 rounded p-2 font-mono text-[11px] text-slate-400 mt-1">
                      # Write your fixed Python code here
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reflection Question */}
          <div className="p-4 border border-slate-300 rounded-lg space-y-2 break-inside-avoid">
            <h3 className="font-bold text-sm text-slate-900">
              Reflection Question (10 Points)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Why was using the <strong>"Show Hitboxes"</strong> and <strong>"Step Frame"</strong> debug tools more effective than just guessing what was wrong in Mission 4 (Phantom Collision)? How do professional programmers use debuggers in real-world software?
            </p>
            <div className="h-20 border-b border-dashed border-slate-300 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
