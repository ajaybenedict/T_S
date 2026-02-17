// app.component.ts
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html'
  
})
export class ChartComponent {
  @Input() chartData: any; // Input for the entire chart data object
  colorScheme = 'vivid';
}
