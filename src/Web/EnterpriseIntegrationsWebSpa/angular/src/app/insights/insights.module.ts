import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { InsightsDashboardComponent } from './insights-dashboard/insights-dashboard.component';
import { InsightsRoutingModule } from './insights-routing.module';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { FraudAlertPopupComponent } from './fraud-alert-popup/fraud-alert-popup.component';
import { BulkupdateFraudeventPopupComponent } from './bulkupdate-fraudevent-popup/bulkupdate-fraudevent-popup.component';


@NgModule({
  declarations: [
    InsightsDashboardComponent,
    FraudAlertPopupComponent,
    BulkupdateFraudeventPopupComponent
  ],
  imports: [
    SharedModule,
    SharedS1Module,
    InsightsRoutingModule
  ],
})
export class InsightsModule { }
