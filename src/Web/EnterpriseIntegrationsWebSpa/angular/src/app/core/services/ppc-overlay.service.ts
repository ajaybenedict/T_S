import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PpcOverlayService {

  private overlay = new BehaviorSubject<boolean>(false);
  ppcOverlay$ = this.overlay.asObservable();

  show() {
    this.overlay.next(true);
  }

  hide() {
    this.overlay.next(false);
  }
  
}
