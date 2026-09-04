import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { areaCenter } from '../formation-engine';
import {
  NormalizedPoint,
  PlayerPlacement,
  PuckState,
  RINK_HEIGHT,
  RINK_WIDTH,
  RinkLane,
  RinkZone,
} from '../hockey.models';

interface MarkupStroke {
  readonly points: NormalizedPoint[];
}

@Component({
  selector: 'app-rink-canvas',
  templateUrl: './rink-canvas.html',
  styleUrl: './rink-canvas.scss',
})
export class RinkCanvas implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) currentPlayers: readonly PlayerPlacement[] = [];
  @Input() previousPlayers: readonly PlayerPlacement[] | null = null;
  @Input({ required: true }) puck!: PuckState;
  @Input() selectedPlayerId: string | null = null;
  @Input() statusLabel = 'Interactive hockey rink';
  @Input() markupMode = false;
  @Input() clearMarkupVersion = 0;

  @Output() readonly puckCommit = new EventEmitter<NormalizedPoint>();
  @Output() readonly puckPreview = new EventEmitter<NormalizedPoint>();
  @Output() readonly puckPreviewCancel = new EventEmitter<void>();
  @Output() readonly playerSelect = new EventEmitter<string>();
  @Output() readonly markupAvailabilityChange = new EventEmitter<boolean>();

  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D | null = null;
  private resizeObserver?: ResizeObserver;
  private animationFrame?: number;
  private animationStart = 0;
  private animationFrom: readonly PlayerPlacement[] = [];
  private previewPoint: NormalizedPoint | null = null;
  private draggingPuck = false;
  private viewReady = false;
  private keyboardZone?: RinkZone;
  private keyboardLane?: RinkLane;
  private markupStrokes: MarkupStroke[] = [];
  private activeMarkupStroke: MarkupStroke | null = null;

  ngAfterViewInit(): void {
    try {
      this.context = this.canvasRef.nativeElement.getContext('2d');
    } catch {
      this.context = null;
    }
    this.viewReady = true;
    this.observeSize();
    this.resizeAndDraw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['puck'] && this.puck) {
      this.keyboardZone = this.puck.zone;
      this.keyboardLane = this.puck.lane;
    }
    if (changes['clearMarkupVersion'] && !changes['clearMarkupVersion'].firstChange) {
      this.markupStrokes = [];
      this.activeMarkupStroke = null;
      this.markupAvailabilityChange.emit(false);
    }
    if (!this.viewReady) return;

    const playerChange = changes['currentPlayers'];
    if (playerChange && !playerChange.firstChange) {
      if (this.draggingPuck) {
        this.animationFrom = [];
        this.draw(performance.now());
        return;
      }
      this.animationFrom = playerChange.previousValue as readonly PlayerPlacement[];
      this.animationStart = performance.now();
      this.scheduleDraw();
      return;
    }
    this.draw(performance.now());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.markupMode) {
      const stroke: MarkupStroke = { points: [this.eventPoint(event)] };
      this.markupStrokes.push(stroke);
      this.activeMarkupStroke = stroke;
      this.canvasRef.nativeElement.setPointerCapture?.(event.pointerId);
      this.markupAvailabilityChange.emit(true);
      this.draw(performance.now());
      return;
    }

    const selected = this.playerAt(this.eventPoint(event));
    if (selected) {
      this.playerSelect.emit(selected.id);
      return;
    }

    this.draggingPuck = true;
    this.canvasRef.nativeElement.setPointerCapture?.(event.pointerId);
    this.previewPoint = this.eventPoint(event);
    this.draw(performance.now());
  }

  onPointerMove(event: PointerEvent): void {
    if (this.markupMode && this.activeMarkupStroke) {
      this.addMarkupPoint(this.eventPoint(event));
      this.draw(performance.now());
      return;
    }
    if (!this.draggingPuck) return;
    this.previewPoint = this.eventPoint(event);
    this.puckPreview.emit(this.previewPoint);
    this.draw(performance.now());
  }

  onPointerUp(event: PointerEvent): void {
    if (this.activeMarkupStroke) {
      this.addMarkupPoint(this.eventPoint(event));
      this.activeMarkupStroke = null;
      this.draw(performance.now());
      return;
    }
    if (!this.draggingPuck) return;
    this.draggingPuck = false;
    const committed = this.eventPoint(event);
    this.previewPoint = null;
    this.puckCommit.emit(committed);
  }

  onPointerCancel(): void {
    this.activeMarkupStroke = null;
    this.draggingPuck = false;
    this.previewPoint = null;
    this.puckPreviewCancel.emit();
    this.draw(performance.now());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.markupMode) return;
    const zoneOrder: readonly RinkZone[] = ['west', 'neutral', 'east'];
    const laneOrder: readonly RinkLane[] = ['upper', 'middle', 'lower'];
    let zoneIndex = zoneOrder.indexOf(this.keyboardZone ?? this.puck.zone);
    let laneIndex = laneOrder.indexOf(this.keyboardLane ?? this.puck.lane);

    if (event.key === 'ArrowLeft') zoneIndex--;
    else if (event.key === 'ArrowRight') zoneIndex++;
    else if (event.key === 'ArrowUp') laneIndex--;
    else if (event.key === 'ArrowDown') laneIndex++;
    else return;

    event.preventDefault();
    zoneIndex = Math.max(0, Math.min(zoneOrder.length - 1, zoneIndex));
    laneIndex = Math.max(0, Math.min(laneOrder.length - 1, laneIndex));
    this.keyboardZone = zoneOrder[zoneIndex];
    this.keyboardLane = laneOrder[laneIndex];
    this.puckCommit.emit(areaCenter(this.keyboardZone, this.keyboardLane));
  }

  private observeSize(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resizeAndDraw());
      this.resizeObserver.observe(this.canvasRef.nativeElement);
    } else {
      window.addEventListener('resize', this.resizeAndDraw);
    }
  }

  private readonly resizeAndDraw = (): void => {
    if (!this.context) return;
    const canvas = this.canvasRef.nativeElement;
    const bounds = canvas.getBoundingClientRect();
    const cssWidth = Math.max(320, bounds.width || 900);
    const cssHeight = cssWidth * (RINK_HEIGHT / RINK_WIDTH);
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const pixelWidth = Math.round(cssWidth * ratio);
    const pixelHeight = Math.round(cssHeight * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    this.draw(performance.now());
  };

  private scheduleDraw(): void {
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame((timestamp) => this.draw(timestamp));
  }

  private draw(timestamp: number): void {
    const context = this.context;
    if (!context || !this.puck) return;

    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(width / RINK_WIDTH, height / RINK_HEIGHT);

    this.drawIce(context);
    this.drawAreaHighlight(context);
    this.drawTrails(context);
    this.drawGhosts(context);
    this.drawMarkup(context);

    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elapsed = timestamp - this.animationStart;
    const progress =
      reduceMotion || this.animationFrom.length === 0 ? 1 : Math.min(1, elapsed / 450);
    const eased = 1 - Math.pow(1 - progress, 3);
    const rendered = this.interpolatePlayers(this.animationFrom, this.currentPlayers, eased);
    this.drawPlayers(context, rendered);
    this.drawPuck(context, this.previewPoint ?? this.puck.point);
    context.restore();

    if (progress < 1) this.scheduleDraw();
  }

  private drawIce(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.roundRect(1, 1, 198, 83, 20);
    context.fillStyle = '#f9fdff';
    context.fill();
    context.clip();

    context.fillStyle = 'rgba(84, 166, 213, 0.045)';
    context.fillRect(2, 2, 73, 81);
    context.fillRect(125, 2, 73, 81);

    this.line(context, 75, 1, 75, 84, '#2374ab', 1.4);
    this.line(context, 125, 1, 125, 84, '#2374ab', 1.4);
    this.line(context, 100, 1, 100, 84, '#d6495b', 1);
    this.line(context, 18, 7, 18, 78, '#d6495b', 0.65);
    this.line(context, 182, 7, 182, 78, '#d6495b', 0.65);

    this.circle(context, 100, 42.5, 8, '#d6495b', 0.65);
    this.circle(context, 100, 42.5, 0.8, '#2374ab', 0.5, '#2374ab');
    for (const x of [40, 160]) {
      for (const y of [22, 63]) {
        this.circle(context, x, y, 8, '#d6495b', 0.55);
        this.circle(context, x, y, 0.65, '#d6495b', 0.4, '#d6495b');
      }
    }
    for (const x of [40, 160]) {
      this.circle(context, x, 42.5, 0.55, '#d6495b', 0.4, '#d6495b');
    }

    context.fillStyle = 'rgba(96, 180, 225, 0.22)';
    context.beginPath();
    context.ellipse(18, 42.5, 7, 5.5, 0, -Math.PI / 2, Math.PI / 2);
    context.fill();
    context.beginPath();
    context.ellipse(182, 42.5, 7, 5.5, 0, Math.PI / 2, Math.PI * 1.5);
    context.fill();

    context.strokeStyle = '#d6495b';
    context.lineWidth = 0.9;
    context.strokeRect(12, 37.5, 4, 10);
    context.strokeRect(184, 37.5, 4, 10);
    context.restore();

    context.beginPath();
    context.roundRect(1, 1, 198, 83, 20);
    context.strokeStyle = '#17324d';
    context.lineWidth = 1.25;
    context.stroke();
  }

  private drawAreaHighlight(context: CanvasRenderingContext2D): void {
    const xBounds: Record<RinkZone, readonly [number, number]> = {
      west: [1, 75],
      neutral: [75, 125],
      east: [125, 199],
    };
    const yBounds: Record<RinkLane, readonly [number, number]> = {
      upper: [1, RINK_HEIGHT / 3],
      middle: [RINK_HEIGHT / 3, (RINK_HEIGHT * 2) / 3],
      lower: [(RINK_HEIGHT * 2) / 3, 84],
    };
    const [x1, x2] = xBounds[this.puck.zone];
    const [y1, y2] = yBounds[this.puck.lane];
    context.save();
    context.beginPath();
    context.roundRect(1, 1, 198, 83, 20);
    context.clip();
    context.fillStyle = 'rgba(250, 190, 45, 0.10)';
    context.fillRect(x1, y1, x2 - x1, y2 - y1);
    context.strokeStyle = 'rgba(164, 111, 0, 0.28)';
    context.lineWidth = 0.55;
    context.setLineDash([2, 2]);
    context.strokeRect(x1, y1, x2 - x1, y2 - y1);
    context.restore();
  }

  private drawTrails(context: CanvasRenderingContext2D): void {
    if (!this.previousPlayers) return;
    context.save();
    context.setLineDash([2.3, 1.7]);
    context.lineWidth = 0.65;
    for (const current of this.currentPlayers) {
      const previous = this.previousPlayers.find((player) => player.id === current.id);
      if (!previous) continue;
      context.strokeStyle =
        current.team === 'home' ? 'rgba(16, 93, 163, 0.58)' : 'rgba(196, 81, 0, 0.58)';
      context.beginPath();
      context.moveTo(previous.point.x, previous.point.y);
      context.lineTo(current.point.x, current.point.y);
      context.stroke();
    }
    context.restore();
  }

  private drawGhosts(context: CanvasRenderingContext2D): void {
    if (!this.previousPlayers) return;
    context.save();
    context.globalAlpha = 0.22;
    this.drawPlayers(context, this.previousPlayers, false);
    context.restore();
  }

  private drawMarkup(context: CanvasRenderingContext2D): void {
    context.save();
    context.strokeStyle = 'rgba(37, 55, 67, 0.58)';
    context.fillStyle = 'rgba(37, 55, 67, 0.58)';
    context.lineWidth = 1.65;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    for (const stroke of this.markupStrokes) {
      const points = stroke.points;
      if (points.length === 1) {
        context.beginPath();
        context.arc(points[0].x, points[0].y, 0.825, 0, Math.PI * 2);
        context.fill();
        continue;
      }

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length - 1; index++) {
        const current = points[index];
        const next = points[index + 1];
        const midpoint = pointBetween(current, next);
        context.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y);
      }
      const last = points[points.length - 1];
      context.lineTo(last.x, last.y);
      context.stroke();
    }
    context.restore();
  }

  private drawPlayers(
    context: CanvasRenderingContext2D,
    players: readonly PlayerPlacement[],
    allowSelection = true,
  ): void {
    for (const player of players) {
      const selected = allowSelection && player.id === this.selectedPlayerId;
      const indicatorRadius = player.role === 'G' ? 3.45 : 4.3;
      const selectionRadius = player.role === 'G' ? 4.8 : 5.8;
      if (selected) {
        this.circle(
          context,
          player.point.x,
          player.point.y,
          selectionRadius,
          '#f2b705',
          1.2,
          'rgba(255, 219, 77, 0.28)',
        );
      }
      const fill = player.team === 'home' ? '#1261a0' : '#c45100';
      this.circle(context, player.point.x, player.point.y, indicatorRadius, '#ffffff', 0.8, fill);
      context.fillStyle = '#ffffff';
      context.font = `700 ${player.role === 'G' ? 2.25 : 2.7}px system-ui, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(player.role, player.point.x, player.point.y + 0.1);
    }
  }

  private drawPuck(context: CanvasRenderingContext2D, puckPoint: NormalizedPoint): void {
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.35)';
    context.shadowBlur = 1.3;
    this.circle(context, puckPoint.x, puckPoint.y, 2.1, '#ffffff', 0.55, '#15191d');
    context.restore();
  }

  private interpolatePlayers(
    from: readonly PlayerPlacement[],
    to: readonly PlayerPlacement[],
    progress: number,
  ): readonly PlayerPlacement[] {
    if (from.length === 0 || progress >= 1) return to;
    return to.map((target) => {
      const source = from.find((player) => player.id === target.id) ?? target;
      return {
        ...target,
        point: {
          x: source.point.x + (target.point.x - source.point.x) * progress,
          y: source.point.y + (target.point.y - source.point.y) * progress,
        },
      };
    });
  }

  private eventPoint(event: PointerEvent): NormalizedPoint {
    const bounds = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * RINK_WIDTH,
      y: ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * RINK_HEIGHT,
    };
  }

  private playerAt(value: NormalizedPoint): PlayerPlacement | undefined {
    return this.currentPlayers.find(
      (player) => Math.hypot(player.point.x - value.x, player.point.y - value.y) <= 5.5,
    );
  }

  private addMarkupPoint(next: NormalizedPoint): void {
    const points = this.activeMarkupStroke?.points;
    if (!points) return;
    const last = points[points.length - 1];
    if (Math.hypot(next.x - last.x, next.y - last.y) >= 0.35) points.push(next);
  }

  private line(
    context: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number,
  ): void {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  }

  private circle(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    stroke: string,
    width: number,
    fill?: string,
  ): void {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    context.strokeStyle = stroke;
    context.lineWidth = width;
    context.stroke();
  }
}

function pointBetween(first: NormalizedPoint, second: NormalizedPoint): NormalizedPoint {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}
