import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { S1CustomHeaderButtons } from 'src/app/models/s1/s1-date-range-picker.interface';

@Injectable({ providedIn: 'root' })
export class S1HeaderConfigService {
  private _buttonsList = new BehaviorSubject<S1CustomHeaderButtons[]>([]);
  readonly buttonsList$ = this._buttonsList.asObservable();

  setButtons(buttons: S1CustomHeaderButtons[]) {
    this._buttonsList.next(buttons);
  }
}
