import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-insights-dialog',
  templateUrl: './insights-dialog.component.html',
  styleUrls: ['./insights-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class InsightsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InsightsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  onNoClick(): void {
    console.log(this.data);
    this.dialogRef.close(false);
  }
}
