import { NgModule } from '@angular/core';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';


const modules = [
  NgbPaginationModule,
  NgbDropdownModule
];

@NgModule({
  declarations: [],
  imports: [modules],
  exports: [modules],
})
export class NgBootstrapPpcModule { }
