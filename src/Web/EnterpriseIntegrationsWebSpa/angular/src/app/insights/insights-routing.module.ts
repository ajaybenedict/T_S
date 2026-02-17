import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsightsDashboardComponent } from './insights-dashboard/insights-dashboard.component';
import { PermissionsEnum } from '../core/config/permissions.config';
import { insightDashboardResolverFn } from './insight-resolver';
import { INSIGHT_DASHBOARD_ROUTE, ROUTE_DATA_KEYS } from '../core/constants/constants';
import { insightCanActivateGuard } from './insight-guard';
import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { MsPacSubsComponent } from './ms-pac-subs/ms-pac-subs.component';
import { MsSecurityComponent } from './ms-security/ms-security.component';
import { BillingReconComponent } from './billing-recon/billing-recon.component';
import { IonRegionalOverviewComponent } from './ion-regional-overview/ion-regional-overview.component';
import { RevenueDashboardComponent } from './revenue-dashboard/revenue-dashboard.component';
import { IonOrderDataComponent } from './ion-order-data/ion-order-data.component';
import { EndCustomerChurnComponent } from './end-customer-churn/end-customer-churn.component';

const routes: Routes = [
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'GlobalRevenue',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.IONRevenue],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    }
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL}`,
    component: ExchangeRateComponent,    
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'exchange-rate',
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },  
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL}`,
    component: BillingReconComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'billing-recon',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.MSReconciliationFiles, 
        PermissionsEnum.IONBillingReconciliation,
      ],
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL}`,
    component: MsPacSubsComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ms-pac-subs',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.MSSubscriptionDetail, 
        PermissionsEnum.MSAzureReserverInstance, 
        PermissionsEnum.MSCustomers,
        PermissionsEnum.MSOrders,
        PermissionsEnum.MSCustomerTransfer,
      ],
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL}`,
    component: MsSecurityComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ms-security',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.MSGdap,
        PermissionsEnum.MSFraudEvents,
        PermissionsEnum.MSMfa,
      ],
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW}`,
    component: IonRegionalOverviewComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ion-regional-overview',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.PlatformSummaryV3
      ],
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL}`,
    component: RevenueDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'GlobalRevenuePhase2',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.GlobalAdmin],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    }
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL}`,
    component: IonOrderDataComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ion-order-data',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.IONOrderData
      ],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL}`,
    component: EndCustomerChurnComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'end-customer-churn',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.GlobalAdmin],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsightsRoutingModule {}
