import { Component, Input } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';

@Component({
  selector: 'app-table-progress-bar',
  templateUrl: './table-progress-bar.component.html',
  styleUrls: ['./table-progress-bar.component.css']
})
export class TableProgressBarComponent {
  @Input() declare mode: ProgressBarMode;
  @Input() declare borderRadius: string;
  @Input() declare height: string;
}
