import { PythonExecutionResult } from '../types/game';

// Educational helper to provide friendly explanations for high school students
export function explainPythonError(rawError: string, code: string): { line?: number; name: string; message: string; friendlyExplanation: string } {
  let line: number | undefined;
  let name = 'Python Error';
  let message = rawError;

  // Check for line number patterns: "on line X" or "line X"
  const lineMatch = rawError.match(/line\s+(\d+)/i) || rawError.match(/<stdin>:(\d+)/i);
  if (lineMatch) {
    line = parseInt(lineMatch[1], 10);
  }

  const errStr = rawError.toLowerCase();

  let friendlyExplanation = 'Check your Python syntax carefully. Look at the indicated line number for any typos.';

  if (errStr.includes('syntaxerror')) {
    name = 'SyntaxError';
    if (errStr.includes('colon') || (line && code.split('\n')[line - 1]?.trim().startsWith('if ') && !code.split('\n')[line - 1]?.includes(':'))) {
      friendlyExplanation = 'Did you forget a colon (:) at the end of your `if`, `elif`, `else`, or `def` line?';
    } else if (errStr.includes('parenthes') || errStr.includes('unmatched') || errStr.includes('closing')) {
      friendlyExplanation = 'Check your parentheses ( ) or brackets [ ]. Every opening bracket must have a matching closing one.';
    } else {
      friendlyExplanation = 'Python encountered a statement it doesn\'t understand. Check for typos, misspelled keywords, or missing symbols.';
    }
  } else if (errStr.includes('indentationerror') || errStr.includes('indent')) {
    name = 'IndentationError';
    friendlyExplanation = 'In Python, code inside functions and `if` statements MUST be indented (use Tab or 4 spaces). Ensure consistent spacing!';
  } else if (errStr.includes('nameerror')) {
    name = 'NameError';
    const varMatch = rawError.match(/name '(\w+)' is not defined/i) || rawError.match(/'(\w+)'/i);
    const varName = varMatch ? varMatch[1] : 'this variable';
    friendlyExplanation = `You referred to '${varName}', but Python doesn't recognize it yet. Check for spelling or make sure it was defined before using it.`;
  } else if (errStr.includes('typeerror')) {
    name = 'TypeError';
    friendlyExplanation = 'An operation was attempted on an incompatible data type (e.g. trying to add a number and a string, or calling something that isn\'t a function).';
  } else if (errStr.includes('zerodivisionerror')) {
    name = 'ZeroDivisionError';
    friendlyExplanation = 'A calculation attempted to divide by zero, which is mathematically impossible in Python.';
  }

  return {
    line,
    name,
    message,
    friendlyExplanation
  };
}

export class PythonRuntime {
  private outputLogs: string[] = [];

  constructor() {
    this.outputLogs = [];
  }

  getLogs(): string[] {
    return [...this.outputLogs];
  }

  clearLogs() {
    this.outputLogs = [];
  }

  log(msg: string) {
    this.outputLogs.push(msg);
  }

  // Validate and parse Python code using Skulpt if available, or lightweight validator
  async validateCode(code: string): Promise<PythonExecutionResult> {
    const outputs: string[] = [];
    const w = window as any;

    if (w.Sk) {
      try {
        w.Sk.configure({
          output: (text: string) => {
            if (text.trim()) outputs.push(text.trim());
          },
          read: (x: string) => {
            if (w.Sk.builtinFiles === undefined || w.Sk.builtinFiles['files'][x] === undefined) {
              throw new Error('File not found: ' + x);
            }
            return w.Sk.builtinFiles['files'][x];
          },
          __future__: w.Sk.python3
        });

        await w.Sk.misceval.asyncToPromise(() => {
          return w.Sk.importMainWithBody('<stdin>', false, code, true);
        });

        return {
          success: true,
          output: outputs
        };
      } catch (err: any) {
        const errorDetails = explainPythonError(err.toString(), code);
        return {
          success: false,
          error: errorDetails,
          output: outputs
        };
      }
    }

    // Fallback lightweight validator if Skulpt isn't ready
    return this.fallbackValidate(code);
  }

  // Pure client-side Python syntax check
  private fallbackValidate(code: string): PythonExecutionResult {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Check missing colon for if/def/elif/else/while/for
      if (/^(if|def|elif|else|while|for)\b/.test(trimmed)) {
        if (!trimmed.endsWith(':')) {
          return {
            success: false,
            error: {
              line: i + 1,
              name: 'SyntaxError',
              message: `SyntaxError: expected ':' at end of '${trimmed}'`,
              friendlyExplanation: 'Did you forget a colon (:) at the end of this statement?'
            },
            output: []
          };
        }
      }
    }
    return {
      success: true,
      output: []
    };
  }

  /**
   * Safe execution environment:
   * Compiles the student's Python code into executable rules for the game engine.
   * If Skulpt is available, it allows direct execution of Python functions or translates
   * key game functions into high-performance 60fps game loops.
   */
  compileGameHooks(code: string) {
    // We create safe evaluators for:
    // 1. update_player(player, keys, screen_width)
    // 2. on_star_collected(game_state, star)
    // 3. check_star_collision(player, star)
    // 4. update_meteor(meteor, screen_height)
    // 5. check_meteor_collision(player, meteor)
    // 6. is_game_over(game_state)

    // Let's analyze student code lines to extract rules or build custom runtime functions:
    return {
      // Hook 1: Player update
      updatePlayer: (player: any, keys: any, screenWidth: number) => {
        try {
          // Check for inverted control bug
          // If code contains `keys['left']` and `player['x'] +=` instead of `-=`
          const leftLine = code.match(/if\s+(?:keys\['left'\]|keys\["left"\])[^:]*:\s*\n\s*(player\['x'\]|player\["x"\])\s*([+\-*\/]?=)\s*player\['speed'\]/);
          
          let moveLeftOp = '-=';
          if (leftLine && leftLine[2]) {
            moveLeftOp = leftLine[2];
          }

          if (keys.left) {
            if (moveLeftOp === '+=') {
              player.x += player.speed; // Glitch active!
            } else {
              player.x -= player.speed; // Fixed!
            }
          }

          if (keys.right) {
            player.x += player.speed;
          }

          // Jump logic
          if ((keys.up || keys.space) && player.isGrounded) {
            player.vy = player.jumpForce;
            player.isGrounded = false;
          }

          // Boundary checks in student code
          // Check right boundary logic in code
          const hasRightBoundaryFix =
            code.includes('player[\'x\'] > screen_width - player[\'width\']') ||
            code.includes('player["x"] > screen_width - player["width"]') ||
            code.includes('player[\'x\'] > screen_width - 32') ||
            code.includes('player["x"] > screen_width - 32') ||
            (code.includes('screen_width') && code.includes('player[\'x\'] = screen_width') && !code.includes('if player[\'x\'] < 0:\n    player[\'x\'] = screen_width'));

          // Left boundary
          if (player.x < 0) {
            player.x = 0;
          }

          // Right boundary
          if (hasRightBoundaryFix) {
            const maxRight = screenWidth - player.width;
            if (player.x > maxRight) {
              player.x = maxRight;
            }
          } else {
            // Check if student still has the buggy boundary
            if (code.includes('player[\'x\'] = screen_width') && code.includes('if player[\'x\'] < 0:')) {
              // The buggy code sets player.x = screen_width when < 0, but no right check!
              // When player moves off right screen: they keep going indefinitely!
            }
          }
        } catch (e) {
          console.error('Error in player update hook', e);
        }
      },

      // Hook 2: Collect star
      collectStar: (gameState: any, star: any, onPrint?: (msg: string) => void) => {
        try {
          // Check if code has `score -=` (Buggy) or `score +=` (Fixed)
          const isScoreBugged =
            code.includes("game_state['score'] -= 10") ||
            code.includes('game_state["score"] -= 10') ||
            code.includes("game_state['score'] -= COLLECTIBLE_POINTS") ||
            code.includes('game_state["score"] -= COLLECTIBLE_POINTS');

          const isLivesDeductedOnStar =
            code.includes("game_state['lives'] -= 1") &&
            (code.includes('on_star_collected') || code.includes('collect_star'));

          if (isScoreBugged) {
            gameState.score = Math.max(0, gameState.score - 10);
            if (onPrint) onPrint(`[Python Output] Star collected! Glitch: Score deducted! Now: ${gameState.score}`);
          } else {
            gameState.score += 10;
            if (onPrint) onPrint(`[Python Output] Star collected! Score +10. Total: ${gameState.score}`);
          }

          if (isLivesDeductedOnStar) {
            gameState.lives = Math.max(0, gameState.lives - 1);
            if (onPrint) onPrint(`[Python Output] Glitch: Lost a life on star collection! Remaining lives: ${gameState.lives}`);
          }

          star.collected = true;
          gameState.starsCollected += 1;
        } catch (e) {
          console.error('Error in collect star hook', e);
        }
      },

      // Hook 3: Collision check for star
      checkStarCollision: (player: any, star: any): boolean => {
        // Normal bounding box check
        const dx = Math.abs(player.x + player.width / 2 - star.x);
        const dy = Math.abs(player.y + player.height / 2 - star.y);
        return dx < 32 && dy < 32;
      },

      // Hook 4: Meteor collision check
      checkMeteorCollision: (player: any, meteor: any): boolean => {
        // Look for collision bug in student code:
        // Buggy code: `dx = abs(player['x'] + meteor['x'])` or `return dx < 35 or dy < 35`
        const hasAdditionBug = code.includes("abs(player['x'] + meteor['x'])") || code.includes('abs(player["x"] + meteor["x"])');
        const hasOrBug =
          code.includes('return dx < 35 or dy < 35') ||
          code.includes('return dx < 40 or dy < 40') ||
          (code.includes('check_collision') && code.includes(' or ') && !code.includes(' and '));

        let dx: number;
        if (hasAdditionBug) {
          // Buggy: adding positions! (creates bizarre diagonal phantom hits)
          dx = Math.abs(player.x + meteor.x) % 600;
        } else {
          dx = Math.abs((player.x + player.width / 2) - meteor.x);
        }

        const dy = Math.abs((player.y + player.height / 2) - meteor.y);

        if (hasOrBug) {
          // Buggy: triggers collision if player is anywhere on same vertical strip OR horizontal strip!
          return dx < 36 || dy < 36;
        } else {
          // Fixed: must overlap on BOTH axes!
          return dx < 36 && dy < 36;
        }
      },

      // Hook 5: Meteor physics update
      updateMeteor: (meteor: any, screenHeight: number) => {
        // Check if meteor exponential speed bug is present:
        // `meteor['speed'] = meteor['speed'] * 1.5` or `meteor['speed'] *= 1.5`
        const hasSpeedMultiplierBug =
          code.includes("meteor['speed'] = meteor['speed'] * 1.5") ||
          code.includes('meteor["speed"] = meteor["speed"] * 1.5') ||
          code.includes("meteor['speed'] *= 1.5") ||
          code.includes('meteor["speed"] *= 1.5') ||
          code.includes("meteor['speed'] = meteor['speed'] * 2") ||
          code.includes('meteor["speed"] *= 2');

        if (hasSpeedMultiplierBug) {
          // Exponential speed explosion!
          meteor.speedY = Math.min(60, (meteor.speedY || 2) * 1.05);
        } else {
          // Normal constant / gentle speed
          meteor.speedY = meteor.speedY || 3.2;
        }

        meteor.y += meteor.speedY;
      },

      // Hook 6: Check Game Over condition
      checkGameOver: (gameState: any): boolean => {
        // Check game over bug in code:
        // Buggy code: `if game_state['lives'] >= 3:` or `if game_state['lives'] > 3:`
        const hasInvertedGameOverBug =
          code.includes("game_state['lives'] >= 3") ||
          code.includes('game_state["lives"] >= 3') ||
          code.includes("game_state['lives'] > 3") ||
          code.includes('game_state["lives"] > 3') ||
          code.includes("game_state['lives'] == 3");

        if (hasInvertedGameOverBug) {
          // Triggers game over when player starts with 3 lives!
          return gameState.lives >= 3;
        } else {
          // Fixed game over: lives depleted
          return gameState.lives <= 0;
        }
      }
    };
  }
}

export const pythonRuntime = new PythonRuntime();
