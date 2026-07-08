import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-scrubber',
  imports: [],
  templateUrl: './scrubber.html',
  styleUrl: './scrubber.css',
})
export class Scrubber {
  readonly total = input(0);
  readonly current = input(0);
  readonly sources = input<string[]>([]);
  readonly scrubbed = output<string>();
}
