import { NgModule } from "@angular/core";
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions, MatNativeDateModule } from "@angular/material/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDividerModule } from "@angular/material/divider";
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from "@angular/cdk/drag-drop";

const globalRippleConfig: RippleGlobalOptions = {
    disabled: true,
    animation: {
      enterDuration: 0,
      exitDuration: 0
    }
};

const modules = [
    MatProgressBarModule,
    MatDividerModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatRadioModule,
    DragDropModule,
];

@NgModule({
    imports: [ ...modules ],
    exports: [ ...modules ],
    providers: [
        {
            provide: MAT_RIPPLE_GLOBAL_OPTIONS,
            useValue: globalRippleConfig
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: { disableClose: true }
        },
        {
            provide: MAT_RADIO_DEFAULT_OPTIONS,
            useValue: { disableRipple: true },
        },                
    ]
})

export class MaterialPPCModule {}