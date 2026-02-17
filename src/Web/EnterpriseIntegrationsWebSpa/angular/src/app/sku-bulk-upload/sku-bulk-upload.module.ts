import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileUploadDetailsComponent } from './file-upload-details/file-upload-details.component';
import { LastUploadedComponent } from './last-uploaded/last-uploaded.component';
import { SkuBulkUploadComponent } from './sku-bulk-upload.component';
import { SharedModule } from '../shared/shared.module';
import { LastUploadTitleComponent } from './last-upload-title/last-upload-title.component';
import { LastUploadDetailsComponent } from './last-upload-details/last-upload-details.component';

const routes: Routes = [
  {
    path: '',
    component: SkuBulkUploadComponent,
  }
];

@NgModule({
  declarations: [
    FileUploadDetailsComponent,
    LastUploadedComponent,
    SkuBulkUploadComponent,
    LastUploadTitleComponent,
    LastUploadDetailsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SkuBulkUploadModule { }
