import { Component, computed, signal } from '@angular/core';
import { buildTeamScenario, createPuckState } from './formation-engine';
import {
  NormalizedPoint,
  PlayerPlacement,
  Possession,
  PuckState,
  Responsibility,
  TeamId,
} from './hockey.models';
import { RinkCanvas } from './rink-canvas/rink-canvas';

@Component({
  selector: 'app-root',
  imports: [RinkCanvas],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly puck = signal(createPuckState({ x: 100, y: 42.5 }, 'loose'));
  protected readonly selectedTeam = signal<TeamId>('home');
  protected readonly selectedPlayerId = signal<string | null>(null);
  protected readonly previousPlayers = signal<readonly PlayerPlacement[] | null>(null);
  protected readonly previewPoint = signal<NormalizedPoint | null>(null);
  protected readonly markupMode = signal(false);
  protected readonly hasMarkup = signal(false);
  protected readonly clearMarkupVersion = signal(0);
  protected readonly effectivePuck = computed(() => {
    const preview = this.previewPoint();
    const committed = this.puck();
    return preview ? createPuckState(preview, committed.possession) : committed;
  });

  protected readonly homeScenario = computed(() => buildTeamScenario('home', this.effectivePuck()));
  protected readonly awayScenario = computed(() => buildTeamScenario('away', this.effectivePuck()));
  protected readonly currentPlayers = computed<readonly PlayerPlacement[]>(() => [
    ...this.homeScenario().players,
    ...this.awayScenario().players,
  ]);
  protected readonly activeScenario = computed(() =>
    this.selectedTeam() === 'home' ? this.homeScenario() : this.awayScenario(),
  );
  protected readonly responsibilities = computed<readonly Responsibility[]>(
    () => this.activeScenario().responsibilities,
  );
  protected readonly areaLabel = computed(() => {
    const scenario = this.activeScenario();
    return `${this.teamName(this.selectedTeam())}: ${this.titleCase(scenario.relativeZone)} zone · ${this.titleCase(scenario.lane)} lane`;
  });
  protected readonly statusLabel = computed(
    () => `${this.possessionLabel(this.puck().possession)}. ${this.areaLabel()}`,
  );

  protected commitPuck(point: NormalizedPoint): void {
    const before = this.puck();
    const next = createPuckState(point, before.possession);
    if (Math.hypot(before.point.x - next.point.x, before.point.y - next.point.y) > 0.05) {
      this.previousPlayers.set(this.copyPlayers(this.playersFor(before)));
    }
    this.previewPoint.set(null);
    this.puck.set(next);
  }

  protected previewPuck(point: NormalizedPoint): void {
    this.previewPoint.set(point);
  }

  protected cancelPuckPreview(): void {
    this.previewPoint.set(null);
  }

  protected toggleMarkupMode(): void {
    this.previewPoint.set(null);
    this.markupMode.update((enabled) => !enabled);
  }

  protected clearMarkup(): void {
    if (!this.hasMarkup()) return;
    this.clearMarkupVersion.update((version) => version + 1);
    this.hasMarkup.set(false);
  }

  protected setPossession(possession: Possession): void {
    const before = this.puck();
    if (before.possession === possession) return;
    this.previousPlayers.set(this.copyPlayers(this.playersFor(before)));
    this.previewPoint.set(null);
    this.puck.set(createPuckState(before.point, possession));
  }

  protected selectTeam(team: TeamId): void {
    this.selectedTeam.set(team);
    const selected = this.selectedPlayerId();
    if (selected && !selected.startsWith(team)) this.selectedPlayerId.set(null);
  }

  protected selectPlayer(playerId: string): void {
    this.selectedPlayerId.set(playerId);
    this.selectedTeam.set(playerId.startsWith('home') ? 'home' : 'away');
  }

  protected selectRole(team: TeamId, role: string): void {
    this.selectedPlayerId.set(`${team}-${role}`);
  }

  protected isSelectedRole(team: TeamId, role: string): boolean {
    return this.selectedPlayerId() === `${team}-${role}`;
  }

  protected possessionLabel(possession: Possession): string {
    if (possession === 'loose') return 'Loose puck';
    return `${this.teamName(possession)} has the puck`;
  }

  protected teamName(team: TeamId): string {
    return team === 'home' ? 'Blue' : 'Orange';
  }

  private copyPlayers(players: readonly PlayerPlacement[]): readonly PlayerPlacement[] {
    return players.map((player) => ({ ...player, point: { ...player.point } }));
  }

  private playersFor(puck: PuckState): readonly PlayerPlacement[] {
    return [...buildTeamScenario('home', puck).players, ...buildTeamScenario('away', puck).players];
  }

  private titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
