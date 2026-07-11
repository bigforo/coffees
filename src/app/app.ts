import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { Scrubber } from './scrubber/scrubber';
import { SpeedControl } from './speed-control/speed-control';
import { CornerControls } from './corner-controls/corner-controls';
import { ImageDetails } from './image-details/image-details';

interface ImgDims {
  w: number;
  h: number;
}

@Component({
  selector: 'app-root',
  imports: [Scrubber, SpeedControl, CornerControls, ImageDetails],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  // --- state ---
  readonly sources = signal<string[]>([]);
  readonly current = signal(0);
  readonly playing = signal(false);
  readonly holdSeconds = signal(0.5);
  readonly dims = signal<Record<number, ImgDims>>({});

  private readonly cornerControls = viewChild(CornerControls);
  private readonly imageDetails = viewChild(ImageDetails);

  private timer: number | undefined;
  private clickTimer: number | undefined;
  private static readonly DOUBLE_CLICK_MS = 250;

  // --- derived ---
  readonly total = computed(() => this.sources().length);

  readonly counterText = computed(() => {
    const t = this.total();
    return t === 0 ? 'NO IMAGES' : `${this.pad(this.current() + 1)} / ${t}`;
  });

  readonly currentPermalink = computed(() => {
    const src = this.sources()[this.current()];
    const file = this.fileName(src);
    return file ? this.urlForFile(file).toString() : '';
  });

  // --- lifecycle ---
  async ngOnInit(): Promise<void> {
    const files = await this.loadManifest();
    this.sources.set(files);
    this.selectImageFromUrl();
    if (files.length > 0) {
      this.syncUrlToCurrent();
      this.restartTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Read every image listed in images/manifest.json, sorted by filename.
  // Regenerate the manifest after adding/removing photos with: npm run manifest
  private async loadManifest(): Promise<string[]> {
    const res = await fetch('images/manifest.json', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Could not load images/manifest.json (HTTP ${res.status})`);
    }
    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('images/manifest.json must be a JSON array of filenames');
    }
    return (data as string[])
      .slice()
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => `images/jpg/${name}`);
  }

  // --- navigation ---
  goTo(index: number): void {
    const t = this.total();
    if (t === 0) return;
    this.current.set(((index % t) + t) % t);
    this.syncUrlToCurrent();
  }

  next(): void {
    this.goTo(this.current() + 1);
  }

  prev(): void {
    this.goTo(this.current() - 1);
  }

  private restartTimer(): void {
    this.stopTimer();
    if (!this.playing()) return;
    this.timer = window.setInterval(() => this.next(), this.holdSeconds() * 1000);
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  // --- controls ---
  setPlaying(state: boolean): void {
    this.playing.set(state);
    this.restartTimer();
  }

  togglePlaying(): void {
    this.setPlaying(!this.playing());
  }

  onScrub(value: string): void {
    this.goTo(parseInt(value, 10) - 1);
    this.restartTimer();
  }

  onSpeed(value: string): void {
    this.holdSeconds.set(parseFloat(value));
    this.restartTimer();
  }

  onImgLoad(event: Event, i: number): void {
    const img = event.target as HTMLImageElement;
    this.dims.update((d) => ({ ...d, [i]: { w: img.naturalWidth, h: img.naturalHeight } }));
  }

  // --- global listeners ---
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') {
      this.next();
      this.restartTimer();
    } else if (e.key === 'ArrowLeft') {
      this.prev();
      this.restartTimer();
    } else if (e.key === ' ') {
      e.preventDefault();
      this.togglePlaying();
    } else if (e.key === 'f' || e.key === 'F') {
      this.cornerControls()?.toggleFullscreen();
    } else if (e.key === 'Escape') {
      this.imageDetails()?.close();
    }
  }

  @HostListener('window:popstate')
  onPopState(): void {
    if (this.selectImageFromUrl()) {
      this.restartTimer();
    }
  }

  // Click anywhere (outside the controls) toggles play/pause; double click
  // toggles fullscreen. The single-click action is deferred briefly so a
  // double click doesn't also fire it.
  @HostListener('document:click', ['$event'])
  onClick(e: MouseEvent): void {
    if (this.isControl(e.target)) return;
    if (this.clickTimer !== undefined) {
      window.clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
      return;
    }
    this.clickTimer = window.setTimeout(() => {
      this.clickTimer = undefined;
      this.togglePlaying();
    }, App.DOUBLE_CLICK_MS);
  }

  @HostListener('document:dblclick', ['$event'])
  onDblClick(e: MouseEvent): void {
    if (this.isControl(e.target)) return;
    if (this.clickTimer !== undefined) {
      window.clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
    }
    this.cornerControls()?.toggleFullscreen();
  }

  private isControl(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      target.closest('.scrubber, .speed, .corner-controls, .info-btn, .info-panel') !== null
    );
  }

  private selectImageFromUrl(): boolean {
    const linkedFile = this.fileNameFromPath();
    if (!linkedFile) return false;

    const normalizedLinkedFile = linkedFile.toLowerCase();
    const index = this.sources().findIndex((src) => this.fileName(src).toLowerCase() === normalizedLinkedFile);
    if (index < 0) return false;

    this.current.set(index);
    return true;
  }

  private syncUrlToCurrent(): void {
    const src = this.sources()[this.current()];
    const file = this.fileName(src);
    if (!file) return;

    const url = this.urlForFile(file);
    window.history.replaceState({ image: file }, '', `${url.pathname}${url.hash}`);
  }

  private urlForFile(file: string): URL {
    const url = new URL(window.location.href);
    url.pathname = `/${encodeURIComponent(this.fileSlug(file))}`;
    url.search = '';
    return url;
  }

  private fileNameFromPath(): string {
    const url = new URL(window.location.href);
    const lastSegment = url.pathname.split('/').filter(Boolean).at(-1);
    if (!lastSegment) return '';

    const decoded = decodeURIComponent(lastSegment);
    return decoded.toLowerCase().endsWith('.jpg') ? decoded : `${decoded}.jpg`;
  }

  private fileSlug(file: string): string {
    return file.replace(/\.jpg$/i, '');
  }

  private fileName(src: string | undefined): string {
    if (!src) return '';
    return src.slice(src.lastIndexOf('/') + 1);
  }

  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
