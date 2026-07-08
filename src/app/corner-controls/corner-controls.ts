import { Component, HostListener, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-corner-controls',
  imports: [],
  templateUrl: './corner-controls.html',
  styleUrl: './corner-controls.css',
})
export class CornerControls {
  readonly playing = input(false);
  readonly playToggled = output<void>();

  readonly isFullscreen = signal(false);

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(document.fullscreenElement !== null);
  }
}
