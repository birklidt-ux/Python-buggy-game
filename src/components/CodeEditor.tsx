import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, RotateCcw, Download, Copy, Check, AlertCircle, FileCode, Sparkles, Eye, EyeOff } from 'lucide-react';
import { PythonExecutionResult } from '../types/game';

interface CodeEditorProps {
  code: string;
  starterCode: string;
  solutionCode: string;
  fileName?: string;
  validationResult: PythonExecutionResult | null;
  isRunningTest: boolean;
  onCodeChange: (newCode: string) => void;
  onRunTest: () => void;
  onResetCode: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  starterCode,
  solutionCode,
  fileName = 'game_logic.py',
  validationResult,
  isRunningTest,
  onCodeChange,
  onRunTest,
  onResetCode
}) => {
  const [copied, setCopied] = useState(false);
  const [showSolutionPreview, setShowSolutionPreview] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Count lines modified from starter code
  const isCodeModified = code.trim() !== starterCode.trim();

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>{fileName}</span>
            {isCodeModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Modified" />}
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">Python 3</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSolutionPreview(!showSolutionPreview)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showSolutionPreview
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Solution Code Reference"
          >
            {showSolutionPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span className="hidden sm:inline">{showSolutionPreview ? 'Hide Solution' : 'Peek Solution'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Copy Python Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Download .py File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onResetCode}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
            title="Reset code to starter glitch"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onRunTest}
            disabled={isRunningTest}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition-all active:scale-95 disabled:opacity-50"
            title="Compile & Apply Python changes to Game (Ctrl + Enter)"
          >
            {isRunningTest ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run & Test</span>
            <kbd className="hidden lg:inline text-[9px] bg-emerald-800/80 px-1 py-0.2 rounded font-mono">^↵</kbd>
          </button>
        </div>
      </div>

      {/* Solution Preview Drawer (if active) */}
      {showSolutionPreview && (
        <div className="bg-amber-950/20 border-b border-amber-900/40 p-3 text-xs">
          <div className="flex items-center justify-between mb-1.5 text-amber-300 font-semibold">
            <span>Official Solution Code (Instructor Reference):</span>
            <button
              onClick={() => {
                onCodeChange(solutionCode);
                setShowSolutionPreview(false);
              }}
              className="text-[11px] underline hover:text-amber-200"
            >
              Copy Solution to Editor
            </button>
          </div>
          <pre className="p-2 bg-black/60 rounded text-amber-200/90 font-mono text-[11px] max-h-32 overflow-y-auto whitespace-pre">
            {solutionCode}
          </pre>
        </div>
      )}

      {/* Friendly Error Banner */}
      {validationResult?.error && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-rose-950/40 border-b border-rose-900/60 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-rose-300 font-mono">
                {validationResult.error.name}
                {validationResult.error.line && ` (Line ${validationResult.error.line})`}
              </span>
            </div>
            <p className="text-rose-200/90 font-mono text-[11px] break-words">
              {validationResult.error.message}
            </p>
            <p className="text-amber-300/90 mt-1 italic text-[11px]">
              💡 <span className="font-semibold not-italic">Teacher Tip:</span> {validationResult.error.friendlyExplanation}
            </p>
          </div>
        </div>
      )}

      {/* CodeMirror Workspace */}
      <div className="flex-1 min-h-[320px] overflow-auto text-sm font-mono">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[python()]}
          onChange={(val) => onCodeChange(val)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true
          }}
          className="h-full text-xs font-mono"
        />
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Lines: {code.split('\n').length}</span>
          <span>Chars: {code.length}</span>
          {isCodeModified ? (
            <span className="text-amber-400">Edited (Changes Pending Test)</span>
          ) : (
            <span className="text-slate-500">Original Buggy Code</span>
          )}
        </div>
        <div>
          <span>Tip: Press Ctrl+Enter to test</span>
        </div>
      </div>
    </div>
  );
};
