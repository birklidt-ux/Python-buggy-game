import React from 'react';
import { Player, Meteor, Star, GameState } from '../types/game';
import { Play, Pause, StepForward, Eye, Gauge, Compass } from 'lucide-react';

interface DebugInspectorProps {
  player: Player;
  meteors: Meteor[];
  stars: Star[];
  gameState: GameState;
  isPaused: boolean;
  gameSpeed: number;
  showHitboxes: boolean;
  showCoordinates: boolean;
  showGrid: boolean;
  onTogglePause: () => void;
  onStepFrame: () => void;
  onChangeSpeed: (speed: number) => void;
  onToggleHitboxes: () => void;
  onToggleCoordinates: () => void;
  onToggleGrid: () => void;
}

export const DebugInspector: React.FC<DebugInspectorProps> = ({
  player,
  meteors,
  stars,
  gameState,
  isPaused,
  gameSpeed,
  showHitboxes,
  showCoordinates,
  showGrid,
  onTogglePause,
  onStepFrame,
  onChangeSpeed,
  onToggleHitboxes,
  onToggleCoordinates,
  onToggleGrid
}) => {
  const activeMeteor = meteors[0];
  const activeStar = stars[0];

  // Calculated distances for live debugger inspection
  const meteorDx = activeMeteor ? Math.round(Math.abs(player.x + player.width / 2 - activeMeteor.x)) : null;
  const meteorDy = activeMeteor ? Math.round(Math.abs(player.y + player.height / 2 - activeMeteor.y)) : null;
  const isMeteorOverlapping = meteorDx !== null && meteorDy !== null ? meteorDx < 32 && meteorDy < 32 : false;

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-3 text-xs">
      {/* Title & Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Debugger & Variable Watcher</span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors ${
              isPaused ? 'bg-amber-600/90 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title={isPaused ? 'Resume Game' : 'Pause Game for Debugging'}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onStepFrame}
            disabled={!isPaused}
            className="flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors"
            title="Advance exactly 1 frame (1/60s) to observe state changes"
          >
            <StepForward className="w-3 h-3" />
            <span>Step Frame</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
          <Gauge className="w-3 h-3 text-slate-500 ml-1" />
          {[0.25, 0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-1.5 py-0.5 rounded font-mono ${
                gameSpeed === spd
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Visual Debug Overlays Toggles */}
      <div className="flex flex-wrap items-center gap-2 py-2 border-b border-slate-800 text-[11px]">
        <span className="text-slate-500 font-medium">Visual Toggles:</span>
        <button
          onClick={onToggleHitboxes}
          className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
            showHitboxes
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Show Hitboxes</span>
        </button>

        <button
          onClick={onToggleCoordinates}
          className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
            showCoordinates
              ? 'bg-purple-950/60 border-purple-700/80 text-purple-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Show (X, Y) Markers</span>
        </button>

        <button
          onClick={onToggleGrid}
          className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
            showGrid
              ? 'bg-cyan-950/60 border-cyan-700/80 text-cyan-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Coordinate Grid</span>
        </button>
      </div>

      {/* Live Variable Inspection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Player Position</div>
          <div className="text-cyan-400 font-semibold text-xs">
            X: {Math.round(player.x)} | Y: {Math.round(player.y)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Speed: {player.speed} | vY: {player.vy.toFixed(1)}
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Active Hazard</div>
          {activeMeteor ? (
            <>
              <div className="text-rose-400 font-semibold text-xs">
                X: {Math.round(activeMeteor.x)} | Y: {Math.round(activeMeteor.y)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Speed: {(activeMeteor.speedY || 3.2).toFixed(1)} px/f
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs">No active hazard</div>
          )}
        </div>

        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Hitbox Delta</div>
          {meteorDx !== null && meteorDy !== null ? (
            <>
              <div className="text-amber-400 font-semibold text-xs">
                dx: {meteorDx}px | dy: {meteorDy}px
              </div>
              <div className={`text-[10px] mt-0.5 font-bold ${isMeteorOverlapping ? 'text-rose-400' : 'text-slate-500'}`}>
                {isMeteorOverlapping ? 'OVERLAP COLLIDING!' : 'No Collision'}
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs">-</div>
          )}
        </div>

        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Game State</div>
          <div className="text-emerald-400 font-semibold text-xs">
            Score: {gameState.score} | Lives: {gameState.lives}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Status: {gameState.isGameOver ? 'GAME OVER' : 'PLAYING'}
          </div>
        </div>
      </div>
    </div>
  );
};
