import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CLOUD_TOOLS_CONFIRMATION_DIALOG,  } from 'src/app/core/constants/constants';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {
  @Output() cancelAction = new EventEmitter<void>();
  @Output() confirmAction = new EventEmitter<void>();
  @Input() headerText: string = CLOUD_TOOLS_CONFIRMATION_DIALOG.DEFAAULT_HEADER;
  @Input() contentText: string = CLOUD_TOOLS_CONFIRMATION_DIALOG.DEFAULT_CONTENT;


  onCancel() {
    this.cancelAction.emit();
  }

  onConfirm() {
    this.confirmAction.emit();
  }
}
