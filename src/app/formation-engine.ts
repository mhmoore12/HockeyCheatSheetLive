import {
  NormalizedPoint,
  PLAYER_ROLES,
  PlayerPlacement,
  PlayerRole,
  Possession,
  PuckState,
  RelativeZone,
  Responsibility,
  RINK_HEIGHT,
  RINK_WIDTH,
  RinkLane,
  RinkZone,
  TeamId,
  TeamPhase,
  TeamScenario,
} from './hockey.models';

type LocalPlacements = Readonly<Record<PlayerRole, NormalizedPoint>>;
type TemplateKey = `${TeamPhase}:${RelativeZone}`;

const point = (x: number, y: number): NormalizedPoint => ({ x, y });

const CENTER_FACEOFF_TEMPLATE: LocalPlacements = {
  LW: point(94, 31),
  C: point(96, 42.5),
  RW: point(94, 54),
  LD: point(78, 32),
  RD: point(78, 53),
  G: point(22, 42.5),
};

const UPPER_TEMPLATES: Readonly<Record<TemplateKey, LocalPlacements>> = {
  'inPossession:defensive': {
    LW: point(72, 17),
    C: point(57, 39),
    RW: point(82, 64),
    LD: point(31, 19),
    RD: point(24, 54),
    G: point(8, 39),
  },
  'outOfPossession:defensive': {
    LW: point(65, 18),
    C: point(38, 41),
    RW: point(48, 63),
    LD: point(27, 20),
    RD: point(19, 44),
    G: point(8, 40),
  },
  'loose:defensive': {
    LW: point(61, 18),
    C: point(39, 35),
    RW: point(52, 64),
    LD: point(28, 19),
    RD: point(20, 46),
    G: point(8, 40),
  },
  'inPossession:neutral': {
    LW: point(109, 17),
    C: point(99, 40),
    RW: point(119, 66),
    LD: point(81, 31),
    RD: point(75, 55),
    G: point(8, 42.5),
  },
  'outOfPossession:neutral': {
    LW: point(106, 19),
    C: point(96, 41),
    RW: point(91, 63),
    LD: point(77, 30),
    RD: point(72, 56),
    G: point(8, 42.5),
  },
  'loose:neutral': {
    LW: point(105, 18),
    C: point(96, 38),
    RW: point(91, 64),
    LD: point(76, 29),
    RD: point(73, 56),
    G: point(8, 42.5),
  },
  'inPossession:offensive': {
    LW: point(155, 16),
    C: point(166, 41),
    RW: point(174, 64),
    LD: point(132, 12),
    RD: point(130, 57),
    G: point(8, 42.5),
  },
  'outOfPossession:offensive': {
    LW: point(158, 18),
    C: point(146, 34),
    RW: point(137, 61),
    LD: point(124, 13),
    RD: point(122, 57),
    G: point(8, 42.5),
  },
  'loose:offensive': {
    LW: point(156, 18),
    C: point(146, 35),
    RW: point(140, 61),
    LD: point(125, 13),
    RD: point(123, 57),
    G: point(8, 42.5),
  },
};

const MIDDLE_TEMPLATES: Readonly<Record<TemplateKey, LocalPlacements>> = {
  'inPossession:defensive': {
    LW: point(73, 18),
    C: point(55, 42.5),
    RW: point(73, 67),
    LD: point(31, 34),
    RD: point(31, 51),
    G: point(8, 42.5),
  },
  'outOfPossession:defensive': {
    LW: point(58, 19),
    C: point(31, 42.5),
    RW: point(58, 66),
    LD: point(23, 31),
    RD: point(23, 54),
    G: point(8, 42.5),
  },
  'loose:defensive': {
    LW: point(59, 18),
    C: point(35, 42.5),
    RW: point(59, 67),
    LD: point(24, 30),
    RD: point(24, 55),
    G: point(8, 42.5),
  },
  'inPossession:neutral': {
    LW: point(111, 19),
    C: point(105, 42.5),
    RW: point(111, 66),
    LD: point(82, 31),
    RD: point(82, 54),
    G: point(8, 42.5),
  },
  'outOfPossession:neutral': {
    LW: point(102, 20),
    C: point(98, 42.5),
    RW: point(102, 65),
    LD: point(77, 31),
    RD: point(77, 54),
    G: point(8, 42.5),
  },
  'loose:neutral': {
    LW: point(102, 19),
    C: point(100, 42.5),
    RW: point(102, 66),
    LD: point(78, 31),
    RD: point(78, 54),
    G: point(8, 42.5),
  },
  'inPossession:offensive': {
    LW: point(158, 19),
    C: point(162, 42.5),
    RW: point(158, 66),
    LD: point(132, 29),
    RD: point(132, 56),
    G: point(8, 42.5),
  },
  'outOfPossession:offensive': {
    LW: point(153, 20),
    C: point(158, 42.5),
    RW: point(153, 65),
    LD: point(124, 29),
    RD: point(124, 56),
    G: point(8, 42.5),
  },
  'loose:offensive': {
    LW: point(153, 19),
    C: point(158, 42.5),
    RW: point(153, 66),
    LD: point(125, 29),
    RD: point(125, 56),
    G: point(8, 42.5),
  },
};

export function classifyZone(x: number): RinkZone {
  if (x < 75) return 'west';
  if (x > 125) return 'east';
  return 'neutral';
}

export function classifyLane(y: number): RinkLane {
  if (y < RINK_HEIGHT / 3) return 'upper';
  if (y > (RINK_HEIGHT * 2) / 3) return 'lower';
  return 'middle';
}

export function createPuckState(pointValue: NormalizedPoint, possession: Possession): PuckState {
  const clamped = clampToRink(pointValue);
  return {
    point: clamped,
    zone: classifyZone(clamped.x),
    lane: classifyLane(clamped.y),
    possession,
  };
}

export function clampToRink(value: NormalizedPoint): NormalizedPoint {
  let x = Math.min(198, Math.max(2, value.x));
  let y = Math.min(83, Math.max(2, value.y));
  const radius = 20;
  const centers = [point(22, 22), point(178, 22), point(22, 63), point(178, 63)];
  const inLeft = x < 22;
  const inRight = x > 178;
  const inTop = y < 22;
  const inBottom = y > 63;

  if ((inLeft || inRight) && (inTop || inBottom)) {
    const center = centers.find(
      (candidate) =>
        (inLeft ? candidate.x === 22 : candidate.x === 178) &&
        (inTop ? candidate.y === 22 : candidate.y === 63),
    );
    if (center) {
      const dx = x - center.x;
      const dy = y - center.y;
      const distance = Math.hypot(dx, dy);
      if (distance > radius) {
        x = center.x + (dx / distance) * radius;
        y = center.y + (dy / distance) * radius;
      }
    }
  }

  return point(x, y);
}

export function buildTeamScenario(team: TeamId, puck: PuckState): TeamScenario {
  const localPuck = toLocal(team, puck.point);
  const relativeZone = classifyRelativeZone(localPuck.x);
  const lane = classifyLane(localPuck.y);
  const phase = phaseFor(team, puck.possession);
  const localPlacements = placementTemplate(phase, relativeZone, lane, localPuck);
  const players = PLAYER_ROLES.map<PlayerPlacement>((role) => ({
    id: `${team}-${role}`,
    team,
    role,
    point: toGlobal(team, localPlacements[role]),
  }));
  const responsibilities = PLAYER_ROLES.map((role) =>
    responsibilityFor(role, relativeZone, phase, lane),
  );

  return { team, phase, relativeZone, lane, players, responsibilities };
}

export function areaCenter(zone: RinkZone, lane: RinkLane): NormalizedPoint {
  const x: Record<RinkZone, number> = { west: 42, neutral: 100, east: 158 };
  const y: Record<RinkLane, number> = { upper: 16, middle: 42.5, lower: 69 };
  return point(x[zone], y[lane]);
}

function classifyRelativeZone(localX: number): RelativeZone {
  if (localX < 75) return 'defensive';
  if (localX > 125) return 'offensive';
  return 'neutral';
}

function phaseFor(team: TeamId, possession: Possession): TeamPhase {
  if (possession === 'loose') return 'loose';
  return possession === team ? 'inPossession' : 'outOfPossession';
}

function toLocal(team: TeamId, value: NormalizedPoint): NormalizedPoint {
  return team === 'home' ? value : point(RINK_WIDTH - value.x, RINK_HEIGHT - value.y);
}

function toGlobal(team: TeamId, value: NormalizedPoint): NormalizedPoint {
  return toLocal(team, value);
}

function placementTemplate(
  phase: TeamPhase,
  zone: RelativeZone,
  lane: RinkLane,
  puck: NormalizedPoint,
): LocalPlacements {
  const isCenterFaceoff =
    phase === 'loose' &&
    Math.abs(puck.x - RINK_WIDTH / 2) < 0.01 &&
    Math.abs(puck.y - RINK_HEIGHT / 2) < 0.01;
  const key: TemplateKey = `${phase}:${zone}`;
  const upper = isCenterFaceoff ? CENTER_FACEOFF_TEMPLATE : UPPER_TEMPLATES[key];
  const middle = isCenterFaceoff ? CENTER_FACEOFF_TEMPLATE : MIDDLE_TEMPLATES[key];
  const lower = mirrorTemplate(upper);
  const laterallyInterpolated =
    puck.y <= RINK_HEIGHT / 2
      ? interpolateTemplate(upper, middle, inverseLerp(8, RINK_HEIGHT / 2, puck.y))
      : interpolateTemplate(middle, lower, inverseLerp(RINK_HEIGHT / 2, 77, puck.y));
  const leader = puckLeader(zone, lane);
  const zoneCenter: Record<RelativeZone, number> = {
    defensive: 38,
    neutral: 100,
    offensive: 162,
  };

  return PLAYER_ROLES.reduce<Record<PlayerRole, NormalizedPoint>>(
    (placements, role) => {
      const base = laterallyInterpolated[role];
      if (role === 'G') {
        placements[role] = point(22, clamp(34, 51, 42.5 + (puck.y - 42.5) * 0.18));
        return placements;
      }

      const isDefense = role === 'LD' || role === 'RD';
      if (role === leader) {
        placements[role] = point(
          clamp(5, 195, base.x + (puck.x - base.x) * 0.45),
          clamp(5, 80, base.y + (puck.y - base.y) * 0.45),
        );
        return placements;
      }

      const longitudinalShift =
        zone === 'offensive' && isDefense ? 0 : (puck.x - zoneCenter[zone]) * 0.12;
      placements[role] = point(
        clamp(5, 195, base.x + longitudinalShift),
        clamp(5, 80, base.y + (puck.y - 42.5) * 0.05),
      );
      return placements;
    },
    {} as Record<PlayerRole, NormalizedPoint>,
  );
}

function mirrorTemplate(upper: LocalPlacements): LocalPlacements {
  return {
    LW: mirrorPoint(upper.RW),
    C: mirrorPoint(upper.C),
    RW: mirrorPoint(upper.LW),
    LD: mirrorPoint(upper.RD),
    RD: mirrorPoint(upper.LD),
    G: mirrorPoint(upper.G),
  };
}

function interpolateTemplate(
  from: LocalPlacements,
  to: LocalPlacements,
  progress: number,
): LocalPlacements {
  return PLAYER_ROLES.reduce<Record<PlayerRole, NormalizedPoint>>(
    (placements, role) => {
      placements[role] = point(
        from[role].x + (to[role].x - from[role].x) * progress,
        from[role].y + (to[role].y - from[role].y) * progress,
      );
      return placements;
    },
    {} as Record<PlayerRole, NormalizedPoint>,
  );
}

function puckLeader(zone: RelativeZone, lane: RinkLane): PlayerRole {
  if (zone === 'defensive') return lane === 'lower' ? 'RD' : 'LD';
  if (lane === 'upper') return 'LW';
  if (lane === 'lower') return 'RW';
  return 'C';
}

function inverseLerp(minimum: number, maximum: number, value: number): number {
  return clamp(0, 1, (value - minimum) / (maximum - minimum));
}

function clamp(minimum: number, maximum: number, value: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function mirrorPoint(value: NormalizedPoint): NormalizedPoint {
  return point(value.x, RINK_HEIGHT - value.y);
}

function responsibilityFor(
  role: PlayerRole,
  zone: RelativeZone,
  phase: TeamPhase,
  lane: RinkLane,
): Responsibility {
  if (role === 'G') return goalieResponsibility(zone, phase);

  const strongForward = lane === 'upper' ? 'LW' : lane === 'lower' ? 'RW' : 'C';
  const weakForward = lane === 'upper' ? 'RW' : lane === 'lower' ? 'LW' : undefined;
  const strongDefense = lane === 'lower' ? 'RD' : 'LD';
  const isStrongForward = role === strongForward;
  const isWeakForward = role === weakForward;
  const isDefense = role === 'LD' || role === 'RD';
  const isStrongDefense = role === strongDefense;

  if (phase === 'loose') {
    if (isStrongForward || (zone === 'defensive' && isStrongDefense)) {
      return row(
        role,
        'Closest safe route to the puck',
        'Compete for the loose puck while staying under control.',
        'I go',
      );
    }
    if (role === 'C') {
      return row(
        role,
        'One short pass from the battle',
        'Support the first teammate and be ready for a quick change.',
        'I help',
      );
    }
    if (isDefense) {
      return row(
        role,
        'Inside the play, between puck and net',
        'Hold a safe gap and protect the middle.',
        'Inside first',
      );
    }
    return row(
      role,
      'Open ice above the puck',
      'Give support without sending everyone into the battle.',
      'Stay available',
    );
  }

  if (phase === 'inPossession') {
    if (zone === 'defensive') {
      if (isStrongDefense)
        return row(
          role,
          'At the puck with an escape route',
          'Retrieve, look up, and make the first simple pass.',
          'Shoulder check',
        );
      if (isDefense)
        return row(
          role,
          'Near the net as a partner outlet',
          'Protect the middle and give the puck-side defender help.',
          'Partner first',
        );
      if (role === 'C')
        return row(
          role,
          'Low through the middle',
          'Come back for a short pass and turn up ice with speed.',
          'Low and slow',
        );
      if (isStrongForward)
        return row(
          role,
          'Open on the puck-side boards',
          'Present a clear target and protect the puck on the wall.',
          'Boards outlet',
        );
      return row(
        role,
        'Across the ice and slightly higher',
        'Stretch the defense and become the next passing option.',
        'Find open ice',
      );
    }
    if (zone === 'neutral') {
      if (isStrongForward)
        return row(
          role,
          'Wide lane with the puck',
          'Skate hard with your head up and enter on-side.',
          'Drive wide',
        );
      if (role === 'C')
        return row(
          role,
          'Middle lane near the puck',
          'Support the carrier and be ready for a short pass.',
          'Middle support',
        );
      if (isWeakForward)
        return row(
          role,
          'Far lane, even with the rush',
          'Stay on-side and stretch into a passing lane.',
          'Width and speed',
        );
      return row(
        role,
        'Behind the rush with inside ice',
        'Support a turnover and offer a safe pass back.',
        'Stay under puck',
      );
    }
    if (isStrongForward)
      return row(
        role,
        'Puck-side attack lane',
        'Protect the puck, drive wide, or find a simple pass.',
        'Create a chance',
      );
    if (role === 'C')
      return row(
        role,
        'Between the dots or near the net',
        'Be a close option and hunt rebounds.',
        'Stick ready',
      );
    if (isWeakForward)
      return row(
        role,
        'Weak-side post and open ice',
        'Arrive where a pass or rebound can reach you.',
        'Back door',
      );
    if (isDefense)
      return row(
        role,
        'Inside the blue line with width',
        'Keep the puck in, move it quickly, and stay goal-side.',
        'Hold smart',
      );
  }

  if (zone === 'defensive') {
    if (isStrongDefense)
      return row(
        role,
        'Puck-side corner or wall',
        'Angle the puck carrier away from the middle.',
        'Stick on puck',
      );
    if (isDefense)
      return row(
        role,
        'Net front on the defensive side',
        'Protect the crease and watch the dangerous opponent.',
        'Net first',
      );
    if (role === 'C')
      return row(
        role,
        'Low slot between puck and net',
        'Help the defenders and protect the middle.',
        'House first',
      );
    if (isStrongForward)
      return row(
        role,
        'Puck-side wall and point lane',
        'Take away the board pass and be ready to help.',
        'Wall and point',
      );
    return row(
      role,
      'Weak-side high slot',
      'Protect the middle and watch the far-side threat.',
      'Head on a swivel',
    );
  }
  if (zone === 'neutral') {
    if (isStrongForward)
      return row(
        role,
        'Approaching the puck from inside-out',
        'Pressure and angle the carrier toward the boards.',
        'Take away middle',
      );
    if (role === 'C')
      return row(
        role,
        'Middle lane above the puck',
        'Track back and protect the center of the ice.',
        'Middle first',
      );
    if (isWeakForward)
      return row(
        role,
        'Far lane above the puck',
        'Stay available to cover or turn defense into offense.',
        'Stay above',
      );
    return row(
      role,
      'Inside the dots with a controlled gap',
      'Match the rush and keep attackers outside.',
      'Gap up',
    );
  }
  if (isStrongForward)
    return row(
      role,
      'First forechecker on the puck',
      'Angle the breakout toward the boards and finish under control.',
      'F1 pressures',
    );
  if (role === 'C')
    return row(
      role,
      'One pass behind the pressure',
      'Support the forecheck and take away the middle outlet.',
      'F2 helps',
    );
  if (isWeakForward)
    return row(
      role,
      'High and across the ice',
      'Stay above the puck and read the next pass.',
      'F3 stays high',
    );
  return row(
    role,
    'Near the blue line, inside the play',
    'Hold a safe gap and be ready for the breakout.',
    'No odd rushes',
  );
}

function goalieResponsibility(zone: RelativeZone, phase: TeamPhase): Responsibility {
  if (zone === 'defensive') {
    if (phase === 'outOfPossession')
      return row(
        'G',
        'Square to the puck in the crease',
        'Track through traffic and control the rebound.',
        'Find the puck',
      );
    return row(
      'G',
      'Set in the crease, ready to help',
      'Communicate on retrievals and be a safe outlet when coached.',
      'Talk early',
    );
  }
  return row(
    'G',
    'Ready near the top of the crease',
    'Follow the play and prepare for a quick counterattack.',
    'Stay ready',
  );
}

function row(role: PlayerRole, where: string, job: string, cue: string): Responsibility {
  return { role, where, job, cue };
}
