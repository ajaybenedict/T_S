
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CbcdashboardComponent } from './cbcdashboard/cbcdashboard.component';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { NavigationbarComponent } from './navigationbar/navigationbar.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardcontentComponent } from './dashboardcontent/dashboardcontent.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ScrollingModule } from '@angular/cdk/scrolling';

import { DownloadPanelComponent } from './download-panel/download-panel.component';
import { MatRadioModule } from '@angular/material/radio';
import { TableCellTemplateComponent } from './table-cell-template/table-cell-template.component';


@NgModule({
  declarations: [CbcdashboardComponent,  HeaderComponent,
    SearchbarComponent,
    NavigationbarComponent,
    FooterComponent,
    DashboardcontentComponent,
    
    DownloadPanelComponent,
    TableCellTemplateComponent],
  imports: [
    
    CommonModule,
    SharedModule,
    HttpClientModule,
    MatSidenavModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    MatRadioModule,
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
