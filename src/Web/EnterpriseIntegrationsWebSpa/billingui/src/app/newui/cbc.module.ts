
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CbcdashboardComponent } from './cbcdashboard/cbcdashboard.component';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material.module';
import { HeaderComponent } from './header/header.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { NavigationbarComponent } from './navigationbar/navigationbar.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardcontentComponent } from './dashboardcontent/dashboardcontent.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableViewComponent } from './table-view/table-view.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableModule } from 'primeng/table';
import { DownloadPanelComponent } from './download-panel/download-panel.component';

@NgModule({
  declarations: [CbcdashboardComponent,  HeaderComponent,
    SearchbarComponent,
    NavigationbarComponent,
    FooterComponent,
    DashboardcontentComponent,
    TableViewComponent,
    DownloadPanelComponent],
  imports: [
    TableModule,
    CommonModule,
    SharedModule,
    HttpClientModule,
    MaterialModule,
    MatSidenavModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: CbcdashboardComponent,
      }
    ])
  ],
  providers: []
})
export class CBCModule { 

}
