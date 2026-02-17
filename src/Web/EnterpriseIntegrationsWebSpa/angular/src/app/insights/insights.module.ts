import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { InsightsDashboardComponent } from './insights-dashboard/insights-dashboard.component';
import { InsightsDialogComponent } from './insights-dialog/insights-dialog.component';
import { InsightsRoutingModule } from './insights-routing.module';
import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { BillingReconComponent } from './billing-recon/billing-recon.component';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { MsPacSubsComponent } from './ms-pac-subs/ms-pac-subs.component';
import { MsSecurityComponent } from './ms-security/ms-security.component';
import { FraudAlertPopupComponent } from './fraud-alert-popup/fraud-alert-popup.component';
import { IonRegionalOverviewComponent } from './ion-regional-overview/ion-regional-overview.component';
import { RevenueDashboardComponent } from './revenue-dashboard/revenue-dashboard.component';
import { IonOrderDataComponent } from './ion-order-data/ion-order-data.component';
import { EndCustomerChurnComponent } from './end-customer-churn/end-customer-churn.component';

@NgModule({
  declarations: [
    InsightsDashboardComponent,
    InsightsDialogComponent,
    ExchangeRateComponent,
    BillingReconComponent,
    MsPacSubsComponent,
    MsSecurityComponent,
    FraudAlertPopupComponent,
    IonRegionalOverviewComponent,
    RevenueDashboardComponent,
    IonOrderDataComponent,
    EndCustomerChurnComponent
  ],
  imports: [
    SharedModule,
    SharedS1Module,
    InsightsRoutingModule
  ],
})
export class InsightsModule { }
