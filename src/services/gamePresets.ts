import { Mission } from '../types/game';

export const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    number: 1,
    title: 'The Inverted Thruster',
    subtitle: 'Operators & Screen Coordinates',
    difficulty: 'Beginner',
    csConcept: 'Coordinate Systems & Arithmetic Operators (+ vs -)',
    conceptDescription: 'In 2D computer graphics, the origin (0, 0) is at the TOP-LEFT corner of the screen. Moving RIGHT increases the X coordinate (+), while moving LEFT decreases the X coordinate (-).',
    qaBugReport: 'PILOT COMPLAINT #101: Astronaut cannot navigate left! When the pilot presses the LEFT arrow key (or A), the thrusters fire in reverse and push the astronaut to the right! Navigating right also moves to the right.',
    expectedBehavior: 'Pressing LEFT should move the astronaut left (-= speed), while pressing RIGHT moves right (+= speed).',
    starterCode: `# Mission 1: The Inverted Thruster
# Fix the astronaut's horizontal movement controls.

def update_player(player, keys):
    """
    Updates player position based on active keyboard keys.
    keys is a dictionary: {'left': bool, 'right': bool, 'up': bool}
    """
    # Moving RIGHT increases X coordinate
    if keys['right']:
        player['x'] += player['speed']

    # BUG HERE! Moving LEFT should DECREASE X coordinate!
    if keys['left']:
        player['x'] += player['speed']  # <-- Why is this adding?
        
    print(f"Astronaut X Position: {player['x']}")
`,
    solutionCode: `# Mission 1: The Inverted Thruster - SOLUTION
def update_player(player, keys):
    """
    Updates player position based on active keyboard keys.
    keys is a dictionary: {'left': bool, 'right': bool, 'up': bool}
    """
    # Moving RIGHT increases X coordinate
    if keys['right']:
        player['x'] += player['speed']

    # FIXED: Decrement player['x'] when moving left!
    if keys['left']:
        player['x'] -= player['speed']
        
    print(f"Astronaut X Position: {player['x']}")
`,
    hints: {
      level1: 'Look at line 14 inside the `if keys[\'left\']:` statement.',
      level2: 'Notice the assignment operator on player[\'x\']. In computer graphics, moving left means X gets smaller.',
      level3: 'Change `player[\'x\'] += player[\'speed\']` to `player[\'x\'] -= player[\'speed\']`.'
    },
    testCases: [
      {
        id: 't1',
        description: 'Pressing LEFT decreases player X coordinate',
        testFn: async (code) => {
          const hasSubtraction = code.includes("player['x'] -= player['speed']") || code.includes('player["x"] -= player["speed"]');
          const stillHasAddition = code.includes("if keys['left']:\n        player['x'] += player['speed']") || code.includes("if keys['left']:\n    player['x'] += player['speed']");
          if (hasSubtraction && !stillHasAddition) {
            return { passed: true, message: 'Correct! LEFT now subtracts from X coordinate.' };
          }
          return { passed: false, message: 'Astronaut still moves right when pressing left. Check the operator in if keys[\'left\']:' };
        }
      },
      {
        id: 't2',
        description: 'Pressing RIGHT continues to increase player X coordinate',
        testFn: async (code) => {
          const hasRightAdd = code.includes("player['x'] += player['speed']") || code.includes('player["x"] += player["speed"]');
          if (hasRightAdd) {
            return { passed: true, message: 'RIGHT key properly moves astronaut right.' };
          }
          return { passed: false, message: 'Make sure the right key still adds to player[\'x\'].' };
        }
      }
    ]
  },
  {
    id: 'mission-2',
    number: 2,
    title: 'The Cosmic Abyss',
    subtitle: 'Screen Boundaries & Conditional Clamping',
    difficulty: 'Beginner',
    csConcept: 'Boundary Checking & Comparison Operators (> vs <)',
    conceptDescription: 'Game objects must stay inside the viewport. We prevent them from walking off-screen by clamping their coordinates: `x = max(0, min(max_width, x))`.',
    qaBugReport: 'PILOT COMPLAINT #204: If the astronaut keeps walking to the right side of the screen, they vanish into deep space and are lost forever! The left wall works fine, but the right wall seems completely non-existent.',
    expectedBehavior: 'The astronaut should stop at the right edge of the screen (`screen_width - player["width"]`) and not walk off into the abyss.',
    starterCode: `# Mission 2: The Cosmic Abyss
# Prevent the astronaut from falling off the right edge of the screen.

def clamp_player_boundaries(player, screen_width):
    """
    Prevents astronaut from moving off-screen.
    screen_width is 600 pixels. player['width'] is 32 pixels.
    """
    # Left edge boundary works correctly:
    if player['x'] < 0:
        player['x'] = 0

    # BUG HERE! The junior developer made a copy-paste error!
    # They checked '< 0' instead of checking if X is beyond the right screen edge!
    if player['x'] < 0:
        player['x'] = screen_width - player['width']
`,
    solutionCode: `# Mission 2: The Cosmic Abyss - SOLUTION
def clamp_player_boundaries(player, screen_width):
    """
    Prevents astronaut from moving off-screen.
    screen_width is 600 pixels. player['width'] is 32 pixels.
    """
    # Left edge boundary:
    if player['x'] < 0:
        player['x'] = 0

    # FIXED: Check if astronaut reaches or exceeds right edge!
    if player['x'] > screen_width - player['width']:
        player['x'] = screen_width - player['width']
`,
    hints: {
      level1: 'Look at the second `if` condition in `clamp_player_boundaries`. It has a copy-paste mistake.',
      level2: 'To check if the player passed the right edge, should X be LESS than 0, or GREATER than `screen_width - player[\'width\']`?',
      level3: 'Change `if player[\'x\'] < 0:` on line 14 to `if player[\'x\'] > screen_width - player[\'width\']:`.'
    },
    testCases: [
      {
        id: 't1',
        description: 'Right boundary check uses greater-than (>) comparison',
        testFn: async (code) => {
          const hasRightGreater = code.includes("player['x'] > screen_width - player['width']") || 
                                  code.includes('player["x"] > screen_width - player["width"]') ||
                                  code.includes("player['x'] >= screen_width - player['width']");
          if (hasRightGreater) {
            return { passed: true, message: 'Boundary check correctly uses > operator with screen_width!' };
          }
          return { passed: false, message: 'Right boundary check should verify if player[\'x\'] > screen_width - player[\'width\'].' };
        }
      }
    ]
  },
  {
    id: 'mission-3',
    number: 3,
    title: 'The Cursed Energy Star',
    subtitle: 'Score Accumulation & State Updates',
    difficulty: 'Intermediate',
    csConcept: 'Variable Re-assignment & Accumulator Pattern (+=)',
    conceptDescription: 'In games, collecting a reward should increment the player\'s score (`score = score + 10` or `score += 10`). Decrementing score or reducing lives turns rewards into penalties!',
    qaBugReport: 'PLAYER COMPLAINT #312: Collecting glowing yellow stars makes the score GO DOWN! Even worse, collecting a star sometimes kills the astronaut because it takes away a life!',
    expectedBehavior: 'Touching a star should grant +10 points to the score and NOT reduce any player lives.',
    starterCode: `# Mission 3: The Cursed Energy Star
# Fix the reward logic when collecting space stars.

COLLECTIBLE_POINTS = 10

def on_star_collected(game_state, star):
    """
    Triggered whenever the astronaut touches an energy star.
    game_state has: 'score', 'lives', 'stars_collected'
    """
    # BUG 1: The programmer subtracted points instead of adding them!
    game_state['score'] -= COLLECTIBLE_POINTS

    # BUG 2: Why are we taking away a life when catching a star?!
    game_state['lives'] -= 1

    star['collected'] = True
    print(f"Star collected! Score: {game_state['score']}, Lives: {game_state['lives']}")
`,
    solutionCode: `# Mission 3: The Cursed Energy Star - SOLUTION
COLLECTIBLE_POINTS = 10

def on_star_collected(game_state, star):
    """
    Triggered whenever the astronaut touches an energy star.
    game_state has: 'score', 'lives', 'stars_collected'
    """
    # FIXED: Add points instead of subtracting!
    game_state['score'] += COLLECTIBLE_POINTS

    # FIXED: Removed accidental penalty to player lives!
    star['collected'] = True
    print(f"Star collected! Score: {game_state['score']}, Lives: {game_state['lives']}")
`,
    hints: {
      level1: 'Look at how `game_state[\'score\']` and `game_state[\'lives\']` are updated in `on_star_collected`.',
      level2: 'Stars should reward points with `+=`, and collecting a star shouldn\'t touch `game_state[\'lives\']`.',
      level3: 'Change `-=` to `+=` on score, and delete or comment out the line `game_state[\'lives\'] -= 1`.'
    },
    testCases: [
      {
        id: 't1',
        description: 'Score increments by 10 points when star is collected',
        testFn: async (code) => {
          const hasAddScore = code.includes("game_state['score'] += COLLECTIBLE_POINTS") || 
                              code.includes('game_state["score"] += COLLECTIBLE_POINTS') ||
                              code.includes("game_state['score'] += 10") ||
                              code.includes('game_state["score"] += 10');
          if (hasAddScore) {
            return { passed: true, message: 'Score now correctly increases on star collection!' };
          }
          return { passed: false, message: 'Score is still being deducted or not added with +=.' };
        }
      },
      {
        id: 't2',
        description: 'Lives are preserved (no lives penalty on star collection)',
        testFn: async (code) => {
          const hasLivesDeduction = code.includes("game_state['lives'] -= 1") || code.includes('game_state["lives"] -= 1');
          if (!hasLivesDeduction) {
            return { passed: true, message: 'Astronaut lives are no longer penalized on star pickup!' };
          }
          return { passed: false, message: 'Remove the line `game_state[\'lives\'] -= 1`.' };
        }
      }
    ]
  },
  {
    id: 'mission-4',
    number: 4,
    title: 'The Phantom Meteor Hitbox',
    subtitle: 'Collision Detection & Boolean Logic',
    difficulty: 'Intermediate',
    csConcept: 'Axis-Aligned Bounding Boxes (AABB) & Logical AND vs OR',
    conceptDescription: 'For two 2D boxes to collide, their distances must overlap on BOTH the horizontal (X) axis AND the vertical (Y) axis. Using OR means a collision triggers whenever the objects share a row or column anywhere on the screen!',
    qaBugReport: 'QA INCIDENT #408: Astronaut takes damage and loses a heart when an asteroid is on the exact opposite side of the screen! (Tip: Turn on the "Show Hitboxes" toggle to see the bizarre phantom hit zone).',
    expectedBehavior: 'Damage should only occur when the astronaut and meteor physically overlap on both the X and Y axes.',
    starterCode: `# Mission 4: The Phantom Meteor Hitbox
# Fix the bounding box collision math between astronaut and meteor.

def check_meteor_collision(player, meteor):
    """
    Returns True if astronaut and meteor collide, False otherwise.
    player: {'x': float, 'y': float, 'width': 32, 'height': 32}
    meteor: {'x': float, 'y': float, 'radius': 16}
    """
    # BUG 1: The developer used '+' instead of '-' to find the distance between X coordinates!
    dx = abs(player['x'] + meteor['x'])
    dy = abs(player['y'] - meteor['y'])

    # BUG 2: Logical OR used instead of AND!
    # This triggers collision if they share the same column OR the same row!
    if dx < 35 or dy < 35:
        return True
    
    return False
`,
    solutionCode: `# Mission 4: The Phantom Meteor Hitbox - SOLUTION
def check_meteor_collision(player, meteor):
    """
    Returns True if astronaut and meteor collide, False otherwise.
    player: {'x': float, 'y': float, 'width': 32, 'height': 32}
    meteor: {'x': float, 'y': float, 'radius': 16}
    """
    # FIXED: Distance formula is |x1 - x2| (subtraction)
    dx = abs(player['x'] - meteor['x'])
    dy = abs(player['y'] - meteor['y'])

    # FIXED: Collision requires overlap on BOTH X and Y axes (logical AND)!
    if dx < 35 and dy < 35:
        return True
    
    return False
`,
    hints: {
      level1: 'There are two bugs: one in the calculation of `dx`, and one in the `if` condition at line 14.',
      level2: 'To find the distance between two positions on a number line, do you ADD them or SUBTRACT them? And must both dimensions overlap?',
      level3: 'Change `abs(player[\'x\'] + meteor[\'x\'])` to `abs(player[\'x\'] - meteor[\'x\'])`, and change `or` to `and` in the `if` statement.'
    },
    testCases: [
      {
        id: 't1',
        description: 'X distance calculates difference with subtraction (-)',
        testFn: async (code) => {
          const hasSubtract = code.includes("abs(player['x'] - meteor['x'])") || code.includes('abs(player["x"] - meteor["x"])');
          if (hasSubtract) {
            return { passed: true, message: 'dx calculation correctly subtracts player X and meteor X!' };
          }
          return { passed: false, message: 'Make sure `dx = abs(player[\'x\'] - meteor[\'x\'])` uses subtraction.' };
        }
      },
      {
        id: 't2',
        description: 'Collision requires both horizontal and vertical overlap (and)',
        testFn: async (code) => {
          const hasAnd = code.includes('dx < 35 and dy < 35') || code.includes('dx < 36 and dy < 36') || code.includes('dx < 32 and dy < 32');
          if (hasAnd) {
            return { passed: true, message: 'Bounding box overlap correctly enforces logical AND!' };
          }
          return { passed: false, message: 'Change `or` to `and` so collision requires overlap on both axes.' };
        }
      }
    ]
  },
  {
    id: 'mission-5',
    number: 5,
    title: 'The Warp-Speed Asteroid',
    subtitle: 'Game Loops & Physics Accrual',
    difficulty: 'Intermediate',
    csConcept: 'Linear vs Exponential Growth & Frame Rate Delta',
    conceptDescription: 'Game loops run 60 times every second. Multiplying speed by a factor like 1.5 each frame causes exponential explosion: after just 10 frames, speed jumps by over 57x!',
    qaBugReport: 'PLAYTEST REPORT #501: As soon as an asteroid enters the sky, it accelerates at supersonic hyperdrive speeds and flashes across the screen like a glitching laser beam! Nobody can dodge it.',
    expectedBehavior: 'Meteors should fall smoothly downward at a steady, manageable speed (e.g. constant speed of 3 to 4 pixels per frame).',
    starterCode: `# Mission 5: The Warp-Speed Asteroid
# Tame the out-of-control asteroid physics in the 60 FPS game loop.

def update_meteor(meteor, screen_height):
    """
    Called 60 times per second to update meteor falling physics.
    meteor has: 'x', 'y', 'speed' (initial speed is 3.0)
    """
    # BUG HERE! Multiplying speed by 1.5 every frame causes exponential growth!
    # Frame 1: speed = 4.5
    # Frame 5: speed = 22.7
    # Frame 20: speed = 6,650 px/second!
    meteor['speed'] = meteor['speed'] * 1.5

    # Move meteor downward by speed
    meteor['y'] += meteor['speed']
`,
    solutionCode: `# Mission 5: The Warp-Speed Asteroid - SOLUTION
def update_meteor(meteor, screen_height):
    """
    Called 60 times per second to update meteor falling physics.
    meteor has: 'x', 'y', 'speed' (initial speed is 3.0)
    """
    # FIXED: Keep speed steady, or add gentle linear gravity
    # Steady falling speed of 3.2 pixels per frame
    meteor['speed'] = 3.2

    # Move meteor downward smoothly
    meteor['y'] += meteor['speed']
`,
    hints: {
      level1: 'Look at `meteor[\'speed\'] = meteor[\'speed\'] * 1.5`. Multiplying on every frame causes exponential explosion.',
      level2: 'Set `meteor[\'speed\']` to a reasonable constant number (like 3.0 or 3.2) or remove the multiplier.',
      level3: 'Replace `meteor[\'speed\'] = meteor[\'speed\'] * 1.5` with `meteor[\'speed\'] = 3.2`.'
    },
    testCases: [
      {
        id: 't1',
        description: 'Remove exponential speed multiplication',
        testFn: async (code) => {
          const hasExponential = code.includes('* 1.5') || code.includes('*= 1.5') || code.includes('* 2') || code.includes('*= 2');
          if (!hasExponential) {
            return { passed: true, message: 'Exponential acceleration glitch successfully removed!' };
          }
          return { passed: false, message: 'The meteor speed is still being multiplied every frame (* 1.5).' };
        }
      }
    ]
  },
  {
    id: 'mission-6',
    number: 6,
    title: 'The Premature Game Over',
    subtitle: 'Flow Control & Base Conditions',
    difficulty: 'Advanced',
    csConcept: 'Conditional Comparisons & Edge Case Testing',
    conceptDescription: 'A game over condition defines when play terminates. If you check `lives >= 3`, the game will end immediately when the player starts with full health!',
    qaBugReport: 'PLAYTEST REPORT #603: The game ends as soon as it begins! A big "GAME OVER" screen pops up immediately even though the player hasn\'t even touched a single meteor and has 3 full hearts!',
    expectedBehavior: 'Game Over should only trigger when player lives reach 0 (or less). At 3 lives, the game must continue playing.',
    starterCode: `# Mission 6: The Premature Game Over
# Fix the condition that determines when the game ends.

def is_game_over(game_state):
    """
    Returns True if the game is over, False if the player can keep playing.
    game_state['lives'] starts at 3.
    """
    # BUG HERE! The developer wrote '>= 3' instead of '<= 0'!
    # Because player starts with 3 lives, game ends on frame 1!
    if game_state['lives'] >= 3:
        print("Game Over triggered because lives >= 3!")
        return True

    return False
`,
    solutionCode: `# Mission 6: The Premature Game Over - SOLUTION
def is_game_over(game_state):
    """
    Returns True if the game is over, False if the player can keep playing.
    game_state['lives'] starts at 3.
    """
    # FIXED: Game over should only trigger when player runs out of lives!
    if game_state['lives'] <= 0:
        print("Game Over triggered! Lives depleted.")
        return True

    return False
`,
    hints: {
      level1: 'Look at the comparison inside `if game_state[\'lives\'] >= 3:`.',
      level2: 'When SHOULD a game end? When lives are 3, or when lives have run out (0)?',
      level3: 'Change `>= 3` to `<= 0`.'
    },
    testCases: [
      {
        id: 't1',
        description: 'Game over condition checks for <= 0 lives',
        testFn: async (code) => {
          const hasZeroCheck = code.includes("game_state['lives'] <= 0") || 
                               code.includes('game_state["lives"] <= 0') ||
                               code.includes("game_state['lives'] == 0") ||
                               code.includes('game_state["lives"] == 0');
          const stillHasThree = code.includes("game_state['lives'] >= 3") || code.includes('game_state["lives"] >= 3');
          if (hasZeroCheck && !stillHasThree) {
            return { passed: true, message: 'Game over now properly triggers only when lives run out (<= 0)!' };
          }
          return { passed: false, message: 'Game over condition should be `game_state[\'lives\'] <= 0`.' };
        }
      }
    ]
  },
  {
    id: 'master-arcade',
    number: 7,
    title: 'Master Game Engine',
    subtitle: 'Integrated All-in-One Arcade Lab',
    difficulty: 'Advanced',
    csConcept: 'Software Architecture & Module Integration',
    conceptDescription: 'In professional software, individual functions connect to form an entire interactive system. Test all game loops, state changes, and mechanics in harmony.',
    qaBugReport: 'ALL-SYSTEMS LAB: This master file contains the full Python arcade engine! You can toggle any individual glitch from the Teacher Glitch Panel or write your own custom mechanics.',
    expectedBehavior: 'All systems functioning together smoothly: responsive movement, boundary collision, scoring, particle trails, and health tracking.',
    starterCode: `# Master Game Engine: Astro-Catcher Full Suite
# Includes player controls, boundary checks, collectible logic, and hazard physics.

SCREEN_WIDTH = 600
SCREEN_HEIGHT = 420
COLLECTIBLE_POINTS = 10

def update_player(player, keys):
    # Movement
    if keys['right']:
        player['x'] += player['speed']
    if keys['left']:
        player['x'] -= player['speed']
        
    # Jump / Jetpack
    if (keys['up'] or keys['space']) and player['is_grounded']:
        player['vy'] = player['jump_force']
        player['is_grounded'] = False
        
    # Apply Gravity
    player['vy'] += 0.4
    player['y'] += player['vy']
    
    # Ground collision
    ground_y = SCREEN_HEIGHT - 60
    if player['y'] > ground_y:
        player['y'] = ground_y
        player['vy'] = 0
        player['is_grounded'] = True
        
    # Boundaries
    if player['x'] < 0:
        player['x'] = 0
    if player['x'] > SCREEN_WIDTH - player['width']:
        player['x'] = SCREEN_WIDTH - player['width']

def on_star_collected(game_state, star):
    game_state['score'] += COLLECTIBLE_POINTS
    star['collected'] = True

def check_meteor_collision(player, meteor):
    dx = abs(player['x'] - meteor['x'])
    dy = abs(player['y'] - meteor['y'])
    return dx < 32 and dy < 32

def update_meteor(meteor):
    meteor['speed'] = 3.2
    meteor['y'] += meteor['speed']

def is_game_over(game_state):
    return game_state['lives'] <= 0
`,
    solutionCode: `# Master Game Engine Solution
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 420
COLLECTIBLE_POINTS = 10

def update_player(player, keys):
    if keys['right']:
        player['x'] += player['speed']
    if keys['left']:
        player['x'] -= player['speed']
    if (keys['up'] or keys['space']) and player['is_grounded']:
        player['vy'] = player['jump_force']
        player['is_grounded'] = False
        
    player['vy'] += 0.4
    player['y'] += player['vy']
    ground_y = SCREEN_HEIGHT - 60
    if player['y'] > ground_y:
        player['y'] = ground_y
        player['vy'] = 0
        player['is_grounded'] = True
        
    if player['x'] < 0:
        player['x'] = 0
    if player['x'] > SCREEN_WIDTH - player['width']:
        player['x'] = SCREEN_WIDTH - player['width']

def on_star_collected(game_state, star):
    game_state['score'] += COLLECTIBLE_POINTS
    star['collected'] = True

def check_meteor_collision(player, meteor):
    dx = abs(player['x'] - meteor['x'])
    dy = abs(player['y'] - meteor['y'])
    return dx < 32 and dy < 32

def update_meteor(meteor):
    meteor['speed'] = 3.2
    meteor['y'] += meteor['speed']

def is_game_over(game_state):
    return game_state['lives'] <= 0
`,
    hints: {
      level1: 'All modules are working together in this master file.',
      level2: 'You can test custom features: change player speed, jump height, or score points!',
      level3: 'Try modifying `COLLECTIBLE_POINTS = 50` or `player[\'speed\'] += 2` for a turbo mode!'
    },
    testCases: [
      {
        id: 't1',
        description: 'Complete arcade logic compiles without syntax errors',
        testFn: async (code, runner) => {
          const res = await runner.validateCode(code);
          if (res.success) {
            return { passed: true, message: 'All Master Python functions compiled successfully!' };
          }
          return { passed: false, message: res.error?.friendlyExplanation || 'Syntax error in master script.' };
        }
      }
    ]
  }
];
