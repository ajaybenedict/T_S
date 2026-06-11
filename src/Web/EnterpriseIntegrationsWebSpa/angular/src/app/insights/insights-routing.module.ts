import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsightsDashboardComponent } from './insights-dashboard/insights-dashboard.component';
import { PermissionsEnum } from '../core/config/permissions.config';
import { insightDashboardResolverFn } from './insight-resolver';
import { INSIGHT_DASHBOARD_ROUTE, ROUTE_DATA_KEYS } from '../core/constants/constants';
import { insightCanActivateGuard } from './insight-guard';

const routes: Routes = [
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'GlobalRevenue',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.InsightExecutive],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    }
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.EXCHANGE_RATE_URL}`,
    component: InsightsDashboardComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'exchange-rate',
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.BILLING_RECON_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'billing-recon',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.InsightBilling,
      ],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.MS_PAC_SUBS_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ms-pac-subs',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.InsightMicrosoftSubscription,
      ],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.MS_SECURITY_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ms-security',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.InsightMicrosoftSecurity,
      ],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ion-regional-overview',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.InsightSIONData,
      ],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL}`,
    component: InsightsDashboardComponent,
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
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'ion-order-data',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [
        PermissionsEnum.InsightSIONData,
      ],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    },
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL}`,
    component: InsightsDashboardComponent,
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
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.RESELLER_CHURN_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'reseller-churn',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.GlobalAdmin],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    }
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.USER_USAGE_REPORT_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'user-usage-insights',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.GlobalAdmin],
    },
    resolve: {
      [INSIGHT_DASHBOARD_ROUTE.RESOLVER]: insightDashboardResolverFn,
    }
  },
  {
    path: `${INSIGHT_DASHBOARD_ROUTE.KPI_REPORT_URL}`,
    component: InsightsDashboardComponent,
    canActivate: [insightCanActivateGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'c3-kpi-dashboard',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.GlobalAdmin],
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

