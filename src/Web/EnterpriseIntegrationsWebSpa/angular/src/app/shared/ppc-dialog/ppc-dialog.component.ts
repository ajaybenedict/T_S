import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PPCDialogData } from '../../models/ppc-dialog-data.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ppc-dialog',
  templateUrl: './ppc-dialog.component.html',
  styleUrls: ['./ppc-dialog.component.css']
})
export class PpcDialogComponent {
  selectedRERadio!:string;
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly _data: PPCDialogData,
    private readonly sanitizer: DomSanitizer,
  ) {}

  readonly dialogRef = inject(MatDialogRef<PpcDialogComponent>);
    
  emitTrue() {
    this.dialogRef.close(true);
  }

  emitFalse() {
    this.dialogRef.close(false);
  }

  emitAction(btnAction?:any) {
    if(btnAction) {
      this.dialogRef.close(btnAction);
    } else {
      console.log(`Dialog component - No action defined for button`);
    }
  }

  radioEmit() {
    if(this.selectedRERadio) this.dialogRef.close(this.selectedRERadio);
  }

  getSanitizedContent(value: string) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
