import { describe, expect, it } from 'vitest';
import {
  areaCenter,
  buildTeamScenario,
  clampToRink,
  classifyLane,
  classifyZone,
  createPuckState,
} from './formation-engine';
import {
  PLAYER_ROLES,
  Possession,
  RINK_HEIGHT,
  RINK_WIDTH,
  RinkLane,
  RinkZone,
  TeamId,
} from './hockey.models';

describe('formation engine', () => {
  const zones: readonly RinkZone[] = ['west', 'neutral', 'east'];
  const lanes: readonly RinkLane[] = ['upper', 'middle', 'lower'];
  const possessions: readonly Possession[] = ['home', 'loose', 'away'];
  const teams: readonly TeamId[] = ['home', 'away'];

  it('classifies all zone and lane boundaries consistently', () => {
    expect(classifyZone(74.99)).toBe('west');
    expect(classifyZone(75)).toBe('neutral');
    expect(classifyZone(125)).toBe('neutral');
    expect(classifyZone(125.01)).toBe('east');
    expect(classifyLane(RINK_HEIGHT / 3 - 0.01)).toBe('upper');
    expect(classifyLane(RINK_HEIGHT / 3)).toBe('middle');
    expect(classifyLane((RINK_HEIGHT * 2) / 3 + 0.01)).toBe('lower');
  });

  it('covers every area, possession, and team with complete safe scenarios', () => {
    for (const zone of zones) {
      for (const lane of lanes) {
        for (const possession of possessions) {
          const puck = createPuckState(areaCenter(zone, lane), possession);
          for (const team of teams) {
            const scenario = buildTeamScenario(team, puck);
            expect(scenario.players).toHaveLength(6);
            expect(scenario.responsibilities).toHaveLength(6);
            expect(scenario.players.map((player) => player.role)).toEqual(PLAYER_ROLES);
            expect(
              scenario.responsibilities.every((item) => item.where && item.job && item.cue),
            ).toBe(true);
            for (const player of scenario.players) {
              expect(player.point.x).toBeGreaterThanOrEqual(0);
              expect(player.point.x).toBeLessThanOrEqual(RINK_WIDTH);
              expect(player.point.y).toBeGreaterThanOrEqual(0);
              expect(player.point.y).toBeLessThanOrEqual(RINK_HEIGHT);
            }
            const goalie = scenario.players.find((player) => player.role === 'G');
            expect(goalie).toBeDefined();
            const localGoalieDepth =
              team === 'home' ? goalie!.point.x : RINK_WIDTH - goalie!.point.x;
            expect(localGoalieDepth).toBeGreaterThan(18);
            expect(localGoalieDepth).toBeLessThan(26);
          }
        }
      }
    }
  });

  it('mirrors equivalent Blue and Orange scenarios', () => {
    const blue = buildTeamScenario('home', createPuckState({ x: 158, y: 16 }, 'home'));
    const orange = buildTeamScenario('away', createPuckState({ x: 42, y: 69 }, 'away'));

    for (const bluePlayer of blue.players) {
      const orangePlayer = orange.players.find((player) => player.role === bluePlayer.role)!;
      expect(orangePlayer.point.x).toBeCloseTo(RINK_WIDTH - bluePlayer.point.x);
      expect(orangePlayer.point.y).toBeCloseTo(RINK_HEIGHT - bluePlayer.point.y);
    }
    expect(orange.responsibilities).toEqual(blue.responsibilities);
  });

  it('starts both teams on their own side for a center-ice faceoff', () => {
    const puck = createPuckState({ x: RINK_WIDTH / 2, y: RINK_HEIGHT / 2 }, 'loose');
    const blue = buildTeamScenario('home', puck);
    const orange = buildTeamScenario('away', puck);
    const blueLeftWing = blue.players.find((player) => player.role === 'LW')!;
    const blueRightWing = blue.players.find((player) => player.role === 'RW')!;
    const orangeLeftWing = orange.players.find((player) => player.role === 'LW')!;
    const orangeRightWing = orange.players.find((player) => player.role === 'RW')!;

    expect(blueLeftWing.point.x).toBeLessThan(RINK_WIDTH / 2);
    expect(blueRightWing.point.x).toBeLessThan(RINK_WIDTH / 2);
    expect(orangeLeftWing.point.x).toBeGreaterThan(RINK_WIDTH / 2);
    expect(orangeRightWing.point.x).toBeGreaterThan(RINK_WIDTH / 2);
    expect(blueLeftWing.point.y).toBeLessThan(blueRightWing.point.y);
    expect(orangeLeftWing.point.y).toBeGreaterThan(orangeRightWing.point.y);
  });

  it('clamps pucks to the rounded rink boundary', () => {
    expect(clampToRink({ x: -30, y: 42.5 })).toEqual({ x: 2, y: 42.5 });
    const corner = clampToRink({ x: -20, y: -20 });
    expect(corner.x).toBeGreaterThan(2);
    expect(corner.y).toBeGreaterThan(2);
    expect(Math.hypot(corner.x - 22, corner.y - 22)).toBeCloseTo(20);
  });

  it('moves the puck-side offensive defense laterally while holding blue-line depth', () => {
    const atBoards = buildTeamScenario('home', createPuckState({ x: 155, y: 8 }, 'home'));
    const towardSlot = buildTeamScenario('home', createPuckState({ x: 155, y: 26 }, 'home'));
    const boardsDefense = atBoards.players.find((player) => player.role === 'LD')!;
    const slotDefense = towardSlot.players.find((player) => player.role === 'LD')!;

    expect(slotDefense.point.y).toBeGreaterThan(boardsDefense.point.y);
    expect(slotDefense.point.x).toBeCloseTo(boardsDefense.point.x);
  });

  it('moves carriers with the puck and slides support players proportionally', () => {
    const first = buildTeamScenario('home', createPuckState({ x: 136, y: 9 }, 'home'));
    const second = buildTeamScenario('home', createPuckState({ x: 174, y: 25 }, 'home'));
    const firstCarrier = first.players.find((player) => player.role === 'LW')!;
    const secondCarrier = second.players.find((player) => player.role === 'LW')!;
    const firstCenter = first.players.find((player) => player.role === 'C')!;
    const secondCenter = second.players.find((player) => player.role === 'C')!;

    expect(secondCarrier.point.x).toBeGreaterThan(firstCarrier.point.x);
    expect(secondCarrier.point.y).toBeGreaterThan(firstCarrier.point.y);
    expect(secondCenter.point.y).toBeGreaterThan(firstCenter.point.y);
  });
});
