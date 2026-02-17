import { Component, Input } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';

@Component({
  selector: 'app-ppc-progress-bar',
  templateUrl: './ppc-progress-bar.component.html',
  styleUrls: ['./ppc-progress-bar.component.css']
})
export class PpcProgressBarComponent {
  @Input() declare mode: ProgressBarMode;
  @Input() declare borderRadius: string;
  @Input() declare height: string;
}
