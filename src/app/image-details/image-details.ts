import { Component, computed, input, signal } from '@angular/core';

interface ImgDims {
  w: number;
  h: number;
}

interface ImageInfo {
  index: string;
  file: string;
  dims: string;
  mp: string;
  aspect: string;
}

@Component({
  selector: 'app-image-details',
  imports: [],
  templateUrl: './image-details.html',
  styleUrl: './image-details.css',
})
export class ImageDetails {
  readonly sources = input<string[]>([]);
  readonly current = input(0);
  readonly dims = input<Record<number, ImgDims>>({});

  readonly open = signal(false);

  readonly info = computed<ImageInfo>(() => {
    const i = this.current();
    const sources = this.sources();
    const total = sources.length;
    const src = sources[i];
    const file = src ? src.slice(src.lastIndexOf('/') + 1) : '–';
    const index = `${i + 1} / ${total}`;
    const d = this.dims()[i];
    if (!d) {
      return { index, file, dims: '…', mp: '…', aspect: '…' };
    }
    const g = this.gcd(d.w, d.h);
    return {
      index,
      file,
      dims: `${d.w} × ${d.h}`,
      mp: `${((d.w * d.h) / 1e6).toFixed(1)} MP`,
      aspect: `${d.w / g}:${d.h / g}`,
    };
  });

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
