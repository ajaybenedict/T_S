import { NgModule } from '@angular/core';
import { MaterialPPCModule } from '../material/material-ppc.module';
import { SharedModule } from '../shared/shared.module';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { DetailsSidePanelComponent } from './details-side-panel/details-side-panel.component';
import { CloudToolsDashboardComponent } from './cloud-tools-dashboard/cloud-tools-dashboard.component';
import { SidePanelFormsTabComponent } from './side-panel-forms-tab/side-panel-forms-tab.component';
import { UploadPanelComponent } from './upload-panel/upload-panel.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CloudToolsCardDetailsComponent } from './cloud-tools-card-details/cloud-tools-card-details.component';
import { SubsTransferUploadPanelComponent } from './subs-transfer-upload-panel/subs-transfer-upload-panel.component';
import { SubsTransferCustomerPreviewComponent } from './subs-transfer-customer-preview/subs-transfer-customer-preview.component';
import { CloudToolsRoutingModule } from './cloud-tools-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

const modules = [
  MaterialPPCModule,
  SharedModule,
  SharedS1Module,
  ReactiveFormsModule,
  CloudToolsRoutingModule,
];

const components = [
  DetailsSidePanelComponent,
  CloudToolsDashboardComponent,
  SidePanelFormsTabComponent,  
  UploadPanelComponent,
  FileUploadComponent,
  ConfirmationDialogComponent,
  CloudToolsCardDetailsComponent,
  SubsTransferUploadPanelComponent,
  SubsTransferCustomerPreviewComponent,
];

@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    ...modules,
  ]
})
export class CloudToolsModule { }
