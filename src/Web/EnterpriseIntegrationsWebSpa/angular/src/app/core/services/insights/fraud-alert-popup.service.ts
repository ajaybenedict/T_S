import { inject, Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FraudAlertPopupComponent } from "src/app/insights/fraud-alert-popup/fraud-alert-popup.component";
import { FruadAlertPopupInput } from "src/app/models/vendor/vendor-api.models";

@Injectable({providedIn: 'root'})

export class FraudAlertPopupService {

    readonly dialog = inject(MatDialog);
    private dialogRef: MatDialogRef<FraudAlertPopupComponent> | null = null;

    showDialog(data: FruadAlertPopupInput) {
        this.openDialog(data);
    }

    closeDialog() {
        if (this.dialogRef) {
            this.dialogRef.close();
            this.dialogRef = null;
        }
    }

    private openDialog(data: FruadAlertPopupInput) {
        this.closeDialog();
        this.dialogRef = this.dialog.open(FraudAlertPopupComponent, { data, disableClose: true });
    }
}