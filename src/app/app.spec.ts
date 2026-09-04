import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { RinkCanvas } from './rink-canvas/rink-canvas';

describe('App', () => {
  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('starts with a loose puck and six Blue responsibility rows', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Where should I go?');
    expect(element.querySelector('.loose-button')?.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(element.querySelector('.current-read strong')?.textContent).toContain('Loose puck');
  });

  it('changes possession and provides matching attack guidance', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.home-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('.home-button')?.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelector('.lesson-banner span')?.textContent).toContain('Attack together');
  });

  it('commits a rink move and keeps a previous formation for trails', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const rink = fixture.debugElement.query(By.directive(RinkCanvas))
      .componentInstance as RinkCanvas;

    rink.puckCommit.emit({ x: 160, y: 15 });
    fixture.detectChanges();

    expect(rink.puck.zone).toBe('east');
    expect(rink.puck.lane).toBe('upper');
    expect(rink.previousPlayers).toHaveLength(12);
  });

  it('switches the responsibility table to Orange', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const tabs = element.querySelectorAll<HTMLButtonElement>('.team-tabs button');

    tabs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(element.querySelector('.lesson-banner strong')?.textContent).toContain('Orange');
  });

  it('composes rapid keyboard moves from the pending teaching area', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const rink = fixture.debugElement.query(By.directive(RinkCanvas))
      .componentInstance as RinkCanvas;
    const keyboardEvent = (key: string) =>
      ({ key, preventDefault: vi.fn() }) as unknown as KeyboardEvent;

    rink.onKeyDown(keyboardEvent('ArrowRight'));
    rink.onKeyDown(keyboardEvent('ArrowUp'));
    fixture.detectChanges();

    expect(rink.puck.zone).toBe('east');
    expect(rink.puck.lane).toBe('upper');
  });

  it('previews micro-movements live and records a same-area move for trails', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const rink = fixture.debugElement.query(By.directive(RinkCanvas))
      .componentInstance as RinkCanvas;
    const initialCenter = rink.currentPlayers.find((player) => player.id === 'home-C')!.point;

    rink.puckPreview.emit({ x: 115, y: 48 });
    fixture.detectChanges();
    const previewCenter = rink.currentPlayers.find((player) => player.id === 'home-C')!.point;

    expect(previewCenter).not.toEqual(initialCenter);
    expect(rink.previousPlayers).toBeNull();

    rink.puckCommit.emit({ x: 115, y: 48 });
    fixture.detectChanges();

    expect(rink.puck.zone).toBe('neutral');
    expect(rink.puck.lane).toBe('middle');
    expect(rink.previousPlayers).toHaveLength(12);
  });

  it('toggles markup mode and enables clearing after a stroke', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const rink = fixture.debugElement.query(By.directive(RinkCanvas))
      .componentInstance as RinkCanvas;
    const toggle = element.querySelector<HTMLButtonElement>('.markup-toggle')!;
    const clear = element.querySelectorAll<HTMLButtonElement>('.tool-buttons button')[1];

    expect(clear.disabled).toBe(true);
    toggle.click();
    fixture.detectChanges();
    expect(rink.markupMode).toBe(true);

    rink.onPointerDown({ clientX: 1, clientY: 1, pointerId: 1 } as PointerEvent);
    rink.onPointerMove({ clientX: 2, clientY: 2, pointerId: 1 } as PointerEvent);
    rink.onPointerUp({ clientX: 3, clientY: 3, pointerId: 1 } as PointerEvent);
    fixture.detectChanges();
    expect(clear.disabled).toBe(false);

    clear.click();
    fixture.detectChanges();
    expect(clear.disabled).toBe(true);
  });
});
