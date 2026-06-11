import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PpcFilterSidepanelComponent } from './ppc-filter-sidepanel/ppc-filter-sidepanel.component';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { RouterModule, Routes } from '@angular/router';
import { MaterialPPCModule } from '../material/material-ppc.module';
import { PpcdashboardComponent } from './ppcdashboard/ppcdashboard.component';
import { DashboardFilterBarComponent } from './dashboard-filter-bar/dashboard-filter-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { PPCFilterSidepanelDirective } from './ppc-filter-sidepanel/ppc-filter-sidepanel.directive';
import { ResellerOverviewSidePanelComponent } from 'src/app/ppc/reseller-overview-side-panel/reseller-overview-side-panel.component';

const routes: Routes = [
  {
    path: '',
    component: PpcdashboardComponent,
  }
];

const modules = [
  SharedModule,
  SharedS1Module,
  MaterialPPCModule,
];

const components = [
  PpcFilterSidepanelComponent,
  PpcdashboardComponent,
  DashboardFilterBarComponent,
  DashboardComponent,
  PPCFilterSidepanelDirective,
  ResellerOverviewSidePanelComponent,
];

@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    ...modules,
    RouterModule.forChild(routes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PPCModule { }
