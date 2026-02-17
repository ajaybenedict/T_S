import { Component, Input } from '@angular/core';
import { S1TextDisplay } from 'src/app/models/s1/s1-text-display.interface';

@Component({
  selector: 'app-s1-text-display',
  templateUrl: './s1-text-display.component.html',
  styleUrls: ['./s1-text-display.component.css'],
  standalone: false,
})
export class S1TextDisplayComponent {
  @Input() declare inputData: S1TextDisplay; 
  color = '#000000';   
}
