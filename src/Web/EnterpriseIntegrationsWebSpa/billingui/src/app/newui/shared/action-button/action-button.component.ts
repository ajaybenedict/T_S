import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HOST_ENTRY_BASEURL } from 'src/app/constants/constants';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.css']
})
export class ActionButtonComponent implements OnInit {
  @Input() actions: any[] = [];
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<string>();
  @Output() clickedWithEvent = new EventEmitter<{ actionKey: string, event: MouseEvent }>(); // This is needed for getting the mouse position to display popup

  remoteBase: string = '';
  private readonly actionStates = new Map<string, 'normal' | 'hover' | 'pressed'>();

  ngOnInit(): void {
    this.remoteBase = HOST_ENTRY_BASEURL;

    // Initialize states locally per action key
    this.actions.forEach(action => {
      if (action?.key) {
        this.actionStates.set(action.key, 'normal');
      }
    });
  }

  updateActionState(action: any, state: 'normal' | 'hover' | 'pressed') {
    if (!(this.disabled || action.disabled)) {
      this.actionStates.set(action.key, state);
    }
  }

  getCurrentIcon(action: any): string {
    const base = `${this.remoteBase}assets/${action.icon}`;

    if (action.showHoverIcon === false) {
      return `${base}.svg`;
    }

    const isDisabled = this.disabled || action.disabled;
    const state = isDisabled ? 'disabled' : (this.actionStates.get(action.key) || 'normal');
    const suffix = state === 'normal' ? '' : `_${state}`;
    return `${base}${suffix}.svg`;
  }

  onHover(action: any) {
    this.updateActionState(action, 'hover');
  }

  onLeave(action: any) {
    this.updateActionState(action, 'normal');
  }

  onPress(action: any) {
    this.updateActionState(action, 'pressed');
  }

  onRelease(action: any) {
    this.updateActionState(action, 'hover');
  }

  onImageError(event: Event, action: any) {
    const target = event.target as HTMLImageElement;
    target.src = `${this.remoteBase}assets/${action.icon}.svg`;
  }

  onClick(event: MouseEvent, action: any): void {
    event.stopPropagation();

    if (!action.disabled && !this.disabled) {
      this.clicked.emit(action.key);
      this.clickedWithEvent.emit({ actionKey: action.key, event });
    }
  }
}


