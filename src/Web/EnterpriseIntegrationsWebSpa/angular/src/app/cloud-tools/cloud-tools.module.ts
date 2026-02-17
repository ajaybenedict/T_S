import { NgModule } from '@angular/core';
import { MaterialPPCModule } from '../material/material-ppc.module';
import { SharedModule } from '../shared/shared.module';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { DetailsSidePanelComponent } from './details-side-panel/details-side-panel.component';
import { CloudToolsDashboardComponent } from './cloud-tools-dashboard/cloud-tools-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { SidePanelFormsTabComponent } from './side-panel-forms-tab/side-panel-forms-tab.component';
import { ROUTE_DATA_KEYS } from '../core/constants/constants';
import { UploadPanelComponent } from './upload-panel/upload-panel.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CloudToolsCardDetailsComponent } from './cloud-tools-card-details/cloud-tools-card-details.component';

const modules = [
  MaterialPPCModule,
  SharedModule,
  SharedS1Module,
];

const components = [
  DetailsSidePanelComponent,
  CloudToolsDashboardComponent,
  SidePanelFormsTabComponent,  
  UploadPanelComponent,
  FileUploadComponent,
  ConfirmationDialogComponent,
  CloudToolsCardDetailsComponent,
];

const routes: Routes = [
  {
    path: '',
    component: CloudToolsDashboardComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'CloudToolsDashboard',
    },
  },
];

@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    ...modules,
    RouterModule.forChild(routes),
  ]
})
export class CloudToolsModule { }
