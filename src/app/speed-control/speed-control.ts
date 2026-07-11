import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-speed-control',
  imports: [],
  templateUrl: './speed-control.html',
  styleUrl: './speed-control.css',
})
export class SpeedControl {
  readonly holdSeconds = input(0.5);
  readonly changed = output<string>();
}
