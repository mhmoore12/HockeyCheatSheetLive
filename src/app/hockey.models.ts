export const RINK_WIDTH = 200;
export const RINK_HEIGHT = 85;

export const PLAYER_ROLES = ['LW', 'C', 'RW', 'LD', 'RD', 'G'] as const;

export type TeamId = 'home' | 'away';
export type PlayerRole = (typeof PLAYER_ROLES)[number];
export type Possession = TeamId | 'loose';
export type RinkZone = 'west' | 'neutral' | 'east';
export type RelativeZone = 'defensive' | 'neutral' | 'offensive';
export type RinkLane = 'upper' | 'middle' | 'lower';
export type TeamPhase = 'inPossession' | 'outOfPossession' | 'loose';

export interface NormalizedPoint {
  readonly x: number;
  readonly y: number;
}

export interface PuckState {
  readonly point: NormalizedPoint;
  readonly zone: RinkZone;
  readonly lane: RinkLane;
  readonly possession: Possession;
}

export interface PlayerPlacement {
  readonly id: string;
  readonly team: TeamId;
  readonly role: PlayerRole;
  readonly point: NormalizedPoint;
}

export interface Responsibility {
  readonly role: PlayerRole;
  readonly where: string;
  readonly job: string;
  readonly cue: string;
}

export interface TeamScenario {
  readonly team: TeamId;
  readonly phase: TeamPhase;
  readonly relativeZone: RelativeZone;
  readonly lane: RinkLane;
  readonly players: readonly PlayerPlacement[];
  readonly responsibilities: readonly Responsibility[];
}
