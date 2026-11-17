import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

interface ConsoleOutputProps {
  logs: string[];
  onClear: () => void;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ logs, onClear }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-36">
      {/* Console Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300 font-mono text-[11px]">Python STDOUT Console (print() output)</span>
          <span className="text-[10px] text-slate-500 font-mono">({logs.length} logs)</span>
        </div>

        <button
          onClick={onClear}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          title="Clear Console Output"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Terminal lines */}
      <div
        ref={containerRef}
        className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] leading-relaxed select-text space-y-1 bg-black/50"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">
            Console ready. Any `print(...)` statements in your Python code will appear here in real time.
          </div>
        ) : (
          logs.map((line, idx) => {
            const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('glitch');
            const isSuccess = line.toLowerCase().includes('passed') || line.toLowerCase().includes('+10') || line.toLowerCase().includes('fixed');
            return (
              <div
                key={idx}
                className={`break-words ${
                  isError ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 select-none mr-2">&gt;</span>
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
