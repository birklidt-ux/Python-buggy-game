import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MISSIONS } from './services/gamePresets';
import { Player, Star, Meteor, Particle, GameState, KeysState, PythonExecutionResult } from './types/game';
import { pythonRuntime } from './services/pythonRunner';
import { sound } from './services/sound';
import { GameCanvas } from './components/GameCanvas';
import { CodeEditor } from './components/CodeEditor';
import { DebugInspector } from './components/DebugInspector';
import { ConsoleOutput } from './components/ConsoleOutput';
import { MissionCard } from './components/MissionCard';
import { TeacherModal } from './components/TeacherModal';
import { WorksheetModal } from './components/WorksheetModal';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Code2,
  Columns,
  GraduationCap,
  Volume2,
  VolumeX,
  FileText,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

export default function App() {
  // Current active mission
  const [currentMissionId, setCurrentMissionId] = useState<string>(MISSIONS[0].id);
  const currentMission = MISSIONS.find((m) => m.id === currentMissionId) || MISSIONS[0];

  // Codes stored per mission
  const [codes, setCodes] = useState<{ [id: string]: string }>(() => {
    const initial: { [id: string]: string } = {};
    MISSIONS.forEach((m) => {
      initial[m.id] = m.starterCode;
    });
    return initial;
  });

  const activeCode = codes[currentMissionId] || currentMission.starterCode;

  // View Layout Mode: 'split' | 'gui' | 'code'
  const [layoutMode, setLayoutMode] = useState<'split' | 'gui' | 'code'>('split');

  // Right pane tab: 'editor' | 'mission'
  const [rightTab, setRightTab] = useState<'editor' | 'mission'>('editor');

  // Sound FX state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Teacher & Worksheet Modals
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState<boolean>(false);

  // Debugger state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [showHitboxes, setShowHitboxes] = useState<boolean>(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Python validation and logs
  const [validationResult, setValidationResult] = useState<PythonExecutionResult | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Python 3.12 Engine Initialized.',
    'Ready for intro CS game debugging.'
  ]);

  // Mission test results: { [testId]: { passed: boolean, message: string } }
  const [testResults, setTestResults] = useState<{ [id: string]: { passed: boolean; message: string } }>({});
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Game Entities
  const [player, setPlayer] = useState<Player>({
    x: 280,
    y: 360,
    vx: 0,
    vy: 0,
    width: 32,
    height: 36,
    speed: 5,
    jumpForce: -10,
    isGrounded: true,
    color: '#38bdf8'
  });

  const [stars, setStars] = useState<Star[]>([
    { id: 1, x: 200, y: 150, radius: 14, points: 10, speedY: 0, rotation: 0, collected: false },
    { id: 2, x: 420, y: 180, radius: 14, points: 10, speedY: 0, rotation: 0, collected: false }
  ]);

  const [meteors, setMeteors] = useState<Meteor[]>([
    { id: 1, x: 150, y: -20, radius: 18, speedY: 3.2, speedX: 0, rotation: 0 }
  ]);

  const [particles, setParticles] = useState<Particle[]>([]);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    isGameOver: false,
    isVictory: false,
    wave: 1,
    starsCollected: 0,
    meteorsDodged: 0
  });

  // Keys state
  const keysRef = useRef<KeysState>({
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
  });

  // Ref to hold compiled hooks from student's Python code
  const compiledHooksRef = useRef(pythonRuntime.compileGameHooks(activeCode));

  // Ref to track invulnerability after taking damage
  const invulnerableUntilRef = useRef<number>(0);

  // Sync sound settings
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Recompile hooks whenever active code changes
  useEffect(() => {
    compiledHooksRef.current = pythonRuntime.compileGameHooks(activeCode);
  }, [activeCode]);

  // Reset / Spawn Game Wave
  const resetWave = useCallback(() => {
    setPlayer((prev) => ({
      ...prev,
      x: 280,
      y: 360,
      vx: 0,
      vy: 0,
      isGrounded: true
    }));

    setStars([
      { id: Date.now() + 1, x: 140 + Math.random() * 120, y: 160 + Math.random() * 80, radius: 14, points: 10, speedY: 0, rotation: 0, collected: false },
      { id: Date.now() + 2, x: 340 + Math.random() * 140, y: 160 + Math.random() * 80, radius: 14, points: 10, speedY: 0, rotation: 0, collected: false }
    ]);

    setMeteors([
      { id: Date.now() + 3, x: 100 + Math.random() * 400, y: -20, radius: 18, speedY: 3.2, speedX: 0, rotation: 0 }
    ]);

    setParticles([]);
    setGameState({
      score: 0,
      lives: 3,
      isGameOver: false,
      isVictory: false,
      wave: 1,
      starsCollected: 0,
      meteorsDodged: 0
    });
  }, []);

  // When switching mission, reset wave and run quick validation
  useEffect(() => {
    resetWave();
    setTestResults({});
  }, [currentMissionId, resetWave]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey for Run & Test: Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCodeAndTest();
        return;
      }

      // Avoid scrolling page with arrow keys or space when focused on canvas or body
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.cm-editor')) {
          e.preventDefault();
        }
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
      }
      if (e.key === ' ') {
        keysRef.current.space = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = false;
      }
      if (e.key === ' ') {
        keysRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update Game Physics & Hooks (Main Loop)
  const stepGameTick = useCallback(() => {
    setGameState((prevGameState) => {
      const hooks = compiledHooksRef.current;

      // Check game over base condition from Python hook
      const isOver = hooks.checkGameOver(prevGameState);
      if (isOver && !prevGameState.isGameOver) {
        sound.playGameOver();
        return { ...prevGameState, isGameOver: true };
      }
      if (prevGameState.isGameOver) return prevGameState;

      return prevGameState;
    });

    setPlayer((prevPlayer) => {
      const hooks = compiledHooksRef.current;
      const nextPlayer = { ...prevPlayer };
      const keys = { ...keysRef.current };

      // Play jump sound
      if ((keys.up || keys.space) && nextPlayer.isGrounded) {
        sound.playJump();
      }

      // Execute Python player update hook
      hooks.updatePlayer(nextPlayer, keys, 600);

      // Apply standard 2D gravity & ground constraint
      nextPlayer.vy += 0.45;
      nextPlayer.y += nextPlayer.vy;

      const groundY = 420 - 50 - nextPlayer.height;
      if (nextPlayer.y >= groundY) {
        nextPlayer.y = groundY;
        nextPlayer.vy = 0;
        nextPlayer.isGrounded = true;
      } else {
        nextPlayer.isGrounded = false;
      }

      return nextPlayer;
    });

    // Update Stars rotation
    setStars((prevStars) => {
      return prevStars.map((st) => ({
        ...st,
        rotation: st.rotation + 0.04
      }));
    });

    // Update Meteors physics via Python hook
    setMeteors((prevMeteors) => {
      const hooks = compiledHooksRef.current;
      return prevMeteors.map((m) => {
        const nextM = { ...m, rotation: m.rotation + 0.03 };
        hooks.updateMeteor(nextM, 420);

        // Respawn meteor if it falls below bottom
        if (nextM.y > 450) {
          nextM.y = -30;
          nextM.x = 80 + Math.random() * 440;
          nextM.speedY = 3.2; // reset speed
        }
        return nextM;
      });
    });

    // Check Star collisions
    setStars((prevStars) => {
      const hooks = compiledHooksRef.current;
      let anyCollected = false;

      const nextStars = prevStars.map((star) => {
        if (star.collected) return star;

        const isColliding = hooks.checkStarCollision(player, star);
        if (isColliding) {
          anyCollected = true;
          const updatedStar = { ...star, collected: true };

          // Execute student's Python collectible hook
          setGameState((g) => {
            const nextG = { ...g };
            hooks.collectStar(nextG, updatedStar, (logMsg: string) => {
              setConsoleLogs((l) => [...l.slice(-40), logMsg]);
            });
            return nextG;
          });

          sound.playStar();

          // Spawn star sparkle particles
          setParticles((pts) => [
            ...pts,
            ...Array.from({ length: 8 }).map(() => ({
              x: star.x,
              y: star.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#fde047',
              size: Math.random() * 3 + 1,
              alpha: 1,
              life: 0,
              maxLife: 20
            }))
          ]);

          return updatedStar;
        }
        return star;
      });

      // Respawn stars if all collected
      if (nextStars.every((s) => s.collected)) {
        setTimeout(() => {
          setStars([
            { id: Date.now() + 1, x: 120 + Math.random() * 160, y: 160 + Math.random() * 80, radius: 14, points: 10, speedY: 0, rotation: 0, collected: false },
            { id: Date.now() + 2, x: 320 + Math.random() * 160, y: 160 + Math.random() * 80, radius: 14, points: 10, speedY: 0, rotation: 0, collected: false }
          ]);
        }, 800);
      }

      return nextStars;
    });

    // Check Meteor collisions
    const now = Date.now();
    if (now > invulnerableUntilRef.current) {
      const hooks = compiledHooksRef.current;
      meteors.forEach((m) => {
        const isColliding = hooks.checkMeteorCollision(player, m);
        if (isColliding) {
          invulnerableUntilRef.current = now + 1200; // 1.2s invulnerability
          sound.playHit();

          // Deduct life
          setGameState((g) => {
            const nextLives = Math.max(0, g.lives - 1);
            const isGameOver = hooks.checkGameOver({ ...g, lives: nextLives });
            if (isGameOver) sound.playGameOver();
            return {
              ...g,
              lives: nextLives,
              isGameOver
            };
          });

          // Explosion particles
          setParticles((pts) => [
            ...pts,
            ...Array.from({ length: 12 }).map(() => ({
              x: player.x + player.width / 2,
              y: player.y + player.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#ef4444',
              size: Math.random() * 4 + 2,
              alpha: 1,
              life: 0,
              maxLife: 25
            }))
          ]);
        }
      });
    }

    // Update Particles
    setParticles((prevPts) =>
      prevPts
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
          alpha: 1 - p.life / p.maxLife
        }))
        .filter((p) => p.life < p.maxLife)
    );
  }, [player, meteors]);

  // Game loop ticker
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) * gameSpeed;
      if (delta >= 16.6) {
        if (!isPaused && !gameState.isGameOver) {
          stepGameTick();
        }
        lastTime = currentTime;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameSpeed, gameState.isGameOver, stepGameTick]);

  // Run Code and Test Suite
  const runCodeAndTest = async () => {
    setIsRunningTests(true);
    sound.playClick();

    // 1. Validate Python syntax
    const res = await pythonRuntime.validateCode(activeCode);
    setValidationResult(res);

    if (res.output.length > 0) {
      setConsoleLogs((prev) => [...prev.slice(-30), ...res.output]);
    }

    if (!res.success) {
      setIsRunningTests(false);
      setConsoleLogs((prev) => [
        ...prev.slice(-30),
        `[Error] ${res.error?.name}: ${res.error?.message}`,
        `[Tip] ${res.error?.friendlyExplanation}`
      ]);
      return;
    }

    // 2. Run Mission test cases
    const results: { [id: string]: { passed: boolean; message: string } } = {};
    for (const tc of currentMission.testCases) {
      const outcome = await tc.testFn(activeCode, pythonRuntime);
      results[tc.id] = outcome;
    }

    setTestResults(results);
    setIsRunningTests(false);

    const allPassed =
      currentMission.testCases.length > 0 &&
      currentMission.testCases.every((tc) => results[tc.id]?.passed);

    if (allPassed) {
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setConsoleLogs((prev) => [
        ...prev.slice(-30),
        `🎉 MISSION ${currentMission.number} ACCOMPLISHED! All bug verification tests passed!`
      ]);
    } else {
      setConsoleLogs((prev) => [
        ...prev.slice(-30),
        `[Test Suite] Code updated. Keep investigating to resolve all QA test cases.`
      ]);
    }
  };

  // Reset current mission code
  const handleResetCode = () => {
    if (window.confirm('Reset this mission back to the starter buggy code? Your edits will be replaced.')) {
      setCodes((prev) => ({
        ...prev,
        [currentMissionId]: currentMission.starterCode
      }));
      setTestResults({});
      setValidationResult(null);
      resetWave();
    }
  };

  // Glitch presence check for banner
  const hasGlitch = !currentMission.testCases.every((tc) => testResults[tc.id]?.passed);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Main Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 shrink-0">
        {/* Brand & Course Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                  PyBug Hunter
                </h1>
                <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.2 rounded font-mono font-medium">
                  CS Intro Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                High School Computer Science · Python Game Debugging Lab
              </p>
            </div>
          </div>
        </div>

        {/* Mission Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium hidden md:inline">Mission:</label>
          <select
            value={currentMissionId}
            onChange={(e) => setCurrentMissionId(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {MISSIONS.map((m) => (
              <option key={m.id} value={m.id}>
                Mission {m.number}: {m.title} ({m.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Layout Modes & Teacher Tools */}
        <div className="flex items-center gap-2">
          {/* Layout Mode Segmented Control */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setLayoutMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                layoutMode === 'split' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View (GUI + Code)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Split</span>
            </button>
            <button
              onClick={() => setLayoutMode('gui')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                layoutMode === 'gui' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="GUI Game Focus"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Game GUI</span>
            </button>
            <button
              onClick={() => setLayoutMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                layoutMode === 'code' ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Python Code Focus"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Python Code</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute 8-bit Sound Effects' : 'Unmute Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Printable Worksheet */}
          <button
            onClick={() => setIsWorksheetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            title="Open Printable Student Worksheet"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Lab Worksheet</span>
          </button>

          {/* Teacher Dashboard */}
          <button
            onClick={() => setIsTeacherModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
            title="Open Teacher Dashboard, Lesson Guide & Answer Key"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Teacher Guide</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* LEFT PANE: GUI GAME CANVAS & DEBUGGER */}
        {(layoutMode === 'split' || layoutMode === 'gui') && (
          <div
            className={`flex flex-col gap-3 overflow-y-auto h-full ${
              layoutMode === 'split' ? 'w-full lg:w-1/2' : 'w-full max-w-4xl mx-auto'
            }`}
          >
            {/* Game Canvas */}
            <GameCanvas
              player={player}
              stars={stars}
              meteors={meteors}
              particles={particles}
              gameState={gameState}
              showHitboxes={showHitboxes}
              showCoordinates={showCoordinates}
              showGrid={showGrid}
              isPaused={isPaused}
              hasActiveGlitch={hasGlitch}
              activeGlitchName={currentMission.title}
              onRestart={resetWave}
              onKeyDown={(key) => {
                if (key === 'ArrowLeft') keysRef.current.left = true;
                if (key === 'ArrowRight') keysRef.current.right = true;
                if (key === 'ArrowUp') keysRef.current.up = true;
              }}
              onKeyUp={(key) => {
                if (key === 'ArrowLeft') keysRef.current.left = false;
                if (key === 'ArrowRight') keysRef.current.right = false;
                if (key === 'ArrowUp') keysRef.current.up = false;
              }}
            />

            {/* Debug Inspector Toolstrip & Variable Watcher */}
            <DebugInspector
              player={player}
              meteors={meteors}
              stars={stars}
              gameState={gameState}
              isPaused={isPaused}
              gameSpeed={gameSpeed}
              showHitboxes={showHitboxes}
              showCoordinates={showCoordinates}
              showGrid={showGrid}
              onTogglePause={() => setIsPaused(!isPaused)}
              onStepFrame={stepGameTick}
              onChangeSpeed={(spd) => setGameSpeed(spd)}
              onToggleHitboxes={() => setShowHitboxes(!showHitboxes)}
              onToggleCoordinates={() => setShowCoordinates(!showCoordinates)}
              onToggleGrid={() => setShowGrid(!showGrid)}
            />

            {/* Python STDOUT Print Console */}
            <ConsoleOutput
              logs={consoleLogs}
              onClear={() => setConsoleLogs([])}
            />
          </div>
        )}

        {/* RIGHT PANE: PYTHON CODE WORKSPACE & MISSION QA BRIEFING */}
        {(layoutMode === 'split' || layoutMode === 'code') && (
          <div
            className={`flex flex-col h-full overflow-hidden ${
              layoutMode === 'split' ? 'w-full lg:w-1/2' : 'w-full max-w-4xl mx-auto'
            }`}
          >
            {/* Right Pane Tab Bar */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-t-xl shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightTab('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    rightTab === 'editor'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Python Editor</span>
                </button>

                <button
                  onClick={() => setRightTab('mission')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    rightTab === 'mission'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mission QA Briefing & Tests</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-mono hidden sm:inline">
                Mission {currentMission.number} of {MISSIONS.length}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-h-0 bg-slate-900 border-x border-b border-slate-800 rounded-b-xl overflow-hidden flex flex-col">
              {rightTab === 'editor' ? (
                <CodeEditor
                  code={activeCode}
                  starterCode={currentMission.starterCode}
                  solutionCode={currentMission.solutionCode}
                  fileName={`mission_${currentMission.number}_${currentMission.id.replace('-', '_')}.py`}
                  validationResult={validationResult}
                  isRunningTest={isRunningTests}
                  onCodeChange={(newCode) => {
                    setCodes((prev) => ({
                      ...prev,
                      [currentMissionId]: newCode
                    }));
                  }}
                  onRunTest={runCodeAndTest}
                  onResetCode={handleResetCode}
                />
              ) : (
                <div className="h-full overflow-y-auto p-2">
                  <MissionCard
                    mission={currentMission}
                    testResults={testResults}
                    isRunningTests={isRunningTests}
                    onRunMissionTests={runCodeAndTest}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Teacher Dashboard Modal */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onOpenWorksheet={() => setIsWorksheetModalOpen(true)}
        onSelectMission={(missionId) => setCurrentMissionId(missionId)}
      />

      {/* Printable Worksheet Modal */}
      <WorksheetModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
      />
    </div>
  );
}
