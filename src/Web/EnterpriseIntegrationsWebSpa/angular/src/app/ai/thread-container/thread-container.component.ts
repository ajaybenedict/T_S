import { Component, Input } from '@angular/core';
import { ThreadResponse } from 'src/app/models/ai/thread.interface';

@Component({
  selector: 'app-thread-container',
  templateUrl: './thread-container.component.html',
  styleUrls: ['./thread-container.component.css']
})
export class ThreadContainerComponent {

  @Input() containerTitle: string = 'Recent Chats';
  @Input() threadList!: ThreadResponse[];
  @Input() containerHeight: string = '500px';
  
}
