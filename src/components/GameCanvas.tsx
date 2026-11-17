import React, { useRef, useEffect } from 'react';
import { Player, Star, Meteor, Particle, GameState } from '../types/game';
import { ArrowLeft, ArrowRight, ArrowUp, RefreshCw } from 'lucide-react';

interface GameCanvasProps {
  player: Player;
  stars: Star[];
  meteors: Meteor[];
  particles: Particle[];
  gameState: GameState;
  showHitboxes: boolean;
  showCoordinates: boolean;
  showGrid: boolean;
  isPaused: boolean;
  hasActiveGlitch: boolean;
  activeGlitchName?: string;
  onRestart: () => void;
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  stars,
  meteors,
  particles,
  gameState,
  showHitboxes,
  showCoordinates,
  showGrid,
  isPaused,
  hasActiveGlitch,
  activeGlitchName,
  onRestart,
  onKeyDown,
  onKeyUp
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background stars cache
  const bgStarsRef = useRef<{ x: number; y: number; size: number; alpha: number; speed: number }[]>([]);

  useEffect(() => {
    if (bgStarsRef.current.length === 0) {
      const arr = [];
      for (let i = 0; i < 70; i++) {
        arr.push({
          x: Math.random() * 600,
          y: Math.random() * 420,
          size: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.3 + 0.1
        });
      }
      bgStarsRef.current = arr;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 420;

    // Clear background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Deep space gradient
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
    spaceGrad.addColorStop(0, '#040714');
    spaceGrad.addColorStop(0.7, '#0b132b');
    spaceGrad.addColorStop(1, '#1c1936');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, width, height);

    // Render background twinkling stars
    bgStarsRef.current.forEach((st) => {
      st.y += st.speed;
      if (st.y > height) st.y = 0;
      ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
      ctx.fillRect(st.x, st.y, st.size, st.size);
    });

    // Render subtle background grid if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Ground platform with neon edge
    const groundY = height - 50;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#1e1b4b');
    groundGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, width, 50);

    // Ground neon grid line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw perspective platform vertical lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + (x - width / 2) * 0.4, height);
      ctx.stroke();
    }

    // Render Particles (jetpack sparks, star sparkles, meteor fire)
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Render Stars (Energy collectibles)
    stars.forEach((star) => {
      if (star.collected) return;
      ctx.save();
      ctx.translate(star.x, star.y);
      ctx.rotate(star.rotation);

      // Star Glow
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, star.radius * 1.8);
      glow.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
      glow.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)');
      glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, star.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 5-point star geometry
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const points = 5;
      const outerR = star.radius;
      const innerR = star.radius * 0.45;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Debug Hitbox for star
      if (showHitboxes) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(star.x - star.radius, star.y - star.radius, star.radius * 2, star.radius * 2);
        ctx.fillStyle = '#22c55e';
        ctx.font = '10px monospace';
        ctx.fillText(`Star (${Math.round(star.x)}, ${Math.round(star.y)})`, star.x - 25, star.y - star.radius - 4);
      }
    });

    // Render Meteors (Falling hazards)
    meteors.forEach((m) => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);

      // Meteor heat glow
      const fireGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, m.radius * 2);
      fireGlow.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
      fireGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
      fireGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = fireGlow;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Jagged meteor rock body
      ctx.fillStyle = '#451a03';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sides = 8;
      for (let i = 0; i < sides; i++) {
        const angle = (i * Math.PI * 2) / sides;
        // Deterministic jagged offset based on index
        const dist = m.radius * (0.8 + 0.25 * ((i * 7) % 3));
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Burning core crater
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-2, -2, m.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Debug Hitbox for meteor
      if (showHitboxes) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(m.x - m.radius, m.y - m.radius, m.radius * 2, m.radius * 2);
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px monospace';
        ctx.fillText(`Meteor (${Math.round(m.x)}, ${Math.round(m.y)})`, m.x - 30, m.y - m.radius - 4);
      }
    });

    // Render Player (Pixel Astronaut)
    ctx.save();
    const px = player.x;
    const py = player.y;
    const pw = player.width;
    const ph = player.height;

    // Jetpack flames when jumping or moving
    if (!player.isGrounded || Math.abs(player.vx) > 0.5) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(px + 6, py + ph);
      ctx.lineTo(px + 12, py + ph + 8 + Math.random() * 4);
      ctx.lineTo(px + 18, py + ph);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(px + 14, py + ph);
      ctx.lineTo(px + 20, py + ph + 8 + Math.random() * 4);
      ctx.lineTo(px + 26, py + ph);
      ctx.fill();
    }

    // Astronaut Suit Body
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // Legs
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(px + 6, py + ph - 8, 8, 8);
    ctx.fillRect(px + pw - 14, py + ph - 8, 8, 8);

    // Torso / Suit
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 12, pw - 8, ph - 18, 4);
    ctx.fill();
    ctx.stroke();

    // Chest control unit
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(px + 12, py + 16, 8, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(px + 13, py + 18, 2, 2);

    // Helmet
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + 11, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet Visor (Cyan mirror glow)
    const visorGrad = ctx.createLinearGradient(px + 10, py + 5, px + pw - 10, py + 16);
    visorGrad.addColorStop(0, '#06b6d4');
    visorGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw / 2 + (player.vx > 0 ? 2 : player.vx < 0 ? -2 : 0), py + 11, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor reflection shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(px + pw / 2 - 4, py + 8, 3, 2);
    ctx.restore();

    // Debug Hitbox for player
    if (showHitboxes) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`Player: X=${Math.round(player.x)}, Y=${Math.round(player.y)}`, player.x - 20, player.y - 6);
    }

    // Velocity Vector debug arrow
    if (showCoordinates) {
      ctx.fillStyle = '#a855f7';
      ctx.font = '11px monospace';
      ctx.fillText(`(X: ${Math.round(player.x)}, Y: ${Math.round(player.y)})`, player.x, player.y + player.height + 14);

      // Coordinate axes markers along the canvas perimeter
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '9px monospace';
      for (let markX = 0; markX <= width; markX += 100) {
        ctx.fillText(`${markX}`, markX + 2, 10);
      }
      for (let markY = 50; markY <= height; markY += 100) {
        ctx.fillText(`${markY}`, 2, markY - 2);
      }
    }

    // Glitch notification watermark
    if (hasActiveGlitch && activeGlitchName) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(8, height - 42, 280, 24);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, height - 42, 280, 24);

      ctx.fillStyle = '#fca5a5';
      ctx.font = '11px monospace';
      ctx.fillText(`[BUG DETECTED] ${activeGlitchName}`, 14, height - 26);
      ctx.restore();
    }

    // Game Over Overlay
    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MISSION FAILED', width / 2, height / 2 - 20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText('Did a code glitch cause this premature exit?', width / 2, height / 2 + 12);
      ctx.fillText('Inspect the Python logic on the right or click Reset Wave!', width / 2, height / 2 + 34);
      ctx.textAlign = 'left';
    }

    // Paused Overlay
    if (isPaused && !gameState.isGameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('|| GAME PAUSED (STEP DEBUG MODE)', width / 2, height / 2);
      ctx.textAlign = 'left';
    }
  }, [
    player,
    stars,
    meteors,
    particles,
    gameState,
    showHitboxes,
    showCoordinates,
    showGrid,
    isPaused,
    hasActiveGlitch,
    activeGlitchName
  ]);

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">SCORE:</span>
            <span className="font-mono text-amber-400 font-bold text-sm">{gameState.score}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">LIVES:</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3].map((heart) => (
                <span
                  key={heart}
                  className={`text-sm ${heart <= gameState.lives ? 'text-rose-500 scale-100' : 'text-slate-700 scale-90'}`}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">STARS:</span>
            <span className="font-mono text-emerald-400 font-semibold">{gameState.starsCollected}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gameState.isGameOver && (
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-rose-600/90 hover:bg-rose-500 text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              Restart Wave
            </button>
          )}
          <span className="text-xs font-mono text-slate-500">600×420 Canvas</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex justify-center bg-black/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={420}
          className="max-w-full aspect-[600/420] object-contain shadow-inner"
        />

        {/* Floating CRT Scanline / Vignette effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* On-screen controls for touchscreen / Chromebook accessibility */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 mr-1 hidden sm:inline">Controls:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">A / ←</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">D / →</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">W / Space (Jump)</kbd>
        </div>

        {/* Touch Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onPointerDown={() => onKeyDown('ArrowLeft')}
            onPointerUp={() => onKeyUp('ArrowLeft')}
            className="p-1.5 bg-slate-800 rounded active:bg-slate-700 text-slate-200"
            title="Move Left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onPointerDown={() => onKeyDown('ArrowUp')}
            onPointerUp={() => onKeyUp('ArrowUp')}
            className="p-1.5 bg-slate-800 rounded active:bg-slate-700 text-slate-200"
            title="Jump"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onPointerDown={() => onKeyDown('ArrowRight')}
            onPointerUp={() => onKeyUp('ArrowRight')}
            className="p-1.5 bg-slate-800 rounded active:bg-slate-700 text-slate-200"
            title="Move Right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
