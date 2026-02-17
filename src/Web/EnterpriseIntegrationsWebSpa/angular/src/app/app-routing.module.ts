import { inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanActivateFn, Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SsoauthGuard } from './core/auth/ssoauth.guard';
import { SsoComponent } from './sso/sso.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { LogoutComponent } from './logout/logout/logout.component';
import { ChatComponent } from './AIAssistant/chat.component';
import { PermissionsEnum } from './core/config/permissions.config';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { APP_ROUTE_CONFIG_URL, ROUTE_DATA_KEYS, REMOTE_ENTRY_URL } from './core/constants/constants';
import { AutomationLoginComponent } from './automation-login/automation-login.component';
import { DataState } from './core/services/data-state';

const ruleEngineAuxRouteGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const router = inject(Router);
  const dataState = inject(DataState);

  const hasRuleEngineAccess = dataState.hasPermission([PermissionsEnum.RuleEditor, PermissionsEnum.RuleViewer]);

  const urlTree = router.parseUrl(state.url);
  const primarySegments = urlTree.root.children['primary']?.segments ?? [];
  const primaryFirstSegment = primarySegments[0]?.path ?? '';
  const isOnC3Dashboard = primaryFirstSegment === APP_ROUTE_CONFIG_URL.C3_DASHBOARD;

  if (hasRuleEngineAccess && isOnC3Dashboard) {
    return true;
  }

  if (urlTree.root.children['ruleEngineOutlet']) {
    delete urlTree.root.children['ruleEngineOutlet'];
  }
  return urlTree;
};

const routes: Routes = [
  {
    path: `${APP_ROUTE_CONFIG_URL.SSO}`,
    component: SsoComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'SSOPage',   // just add some desc like this on every route to enable animation on page navigation
    },
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.SSO}/:state`,
    component: SsoComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'SSOPage',
    }
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.QA_LOGIN}`,
    component: AutomationLoginComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'automationLogin',
    },
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.CBC_DASHBOARD}`,
    canActivate: [SsoauthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: REMOTE_ENTRY_URL,
        exposedModule: './cbc-legacyui'
      }).then(m => m.BillingConsoleModule),
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'CBCDashboard',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.BillingConnector],
    },
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.COLLECTION_SKU_MAPPING}`,
    canActivate: [SsoauthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: REMOTE_ENTRY_URL,
        exposedModule: './ProductCollection'
      }).then(m => m.ProductCollectionModule),
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'CBCCollectionSKU',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.BillingConnector],
    },
  },
  {
    path: 'errorpage',
    component: ErrorPageComponent,
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.LANDING_PAGE}`,
    canActivate: [SsoauthGuard], // Apply the AuthGuard to the root route (AppComponent route)
    component: LandingPageComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'LandingPage',
    },
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.LOGOUT}`,
    component: LogoutComponent,
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'LogoutPage',
    },
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.INSIGHTS}`,
    loadChildren: () => import('./insights/insights.module').then(m => m.InsightsModule),
    canMatch: [SsoauthGuard],
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'InsightsDashboard',
    }
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.C3_DASHBOARD}`,
    canActivate: [SsoauthGuard], // Apply the AuthGuard to the root route (AppComponent route)
    loadChildren: () => import('./ppc/ppc.module').then(m => m.PPCModule),
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'C3Dashboard',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.PreProvisioningOrderApproval, PermissionsEnum.PreProvisioningCredit],
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    }
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.ASSISTANT_PARAM_ID}`, // Added ':id' as a route parameter
    canActivate: [SsoauthGuard],
    component: ChatComponent,
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.ASSISTANT}`,
    canActivate: [SsoauthGuard],
    component: ChatComponent,
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.RULE_ENGINE}`,
    outlet: 'ruleEngineOutlet', //Auxillary route
    canActivate: [SsoauthGuard, ruleEngineAuxRouteGuard],
    loadChildren: () => import('./rule-engine/rule-engine.module').then(m => m.RuleEngineModule),
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'RuleEngine',
      [ROUTE_DATA_KEYS.COUNTRY_REGION_CHECK]: true,
    },
  },
  {
    path: `${APP_ROUTE_CONFIG_URL.CLOUD_TOOLS}`,
    canActivate: [SsoauthGuard],
    loadChildren: () => import('./cloud-tools/cloud-tools.module').then(m => m.CloudToolsModule),
    data: {
      [ROUTE_DATA_KEYS.ANIMATION]: 'CloudTools',
      [ROUTE_DATA_KEYS.PERMISSIONS]: [PermissionsEnum.ESTManager, PermissionsEnum.SandBoxCleanUp, PermissionsEnum.PCRCleanUp],
    }
  },
  { path: `${APP_ROUTE_CONFIG_URL.PPC_DASHBOARD}`, redirectTo: `/${APP_ROUTE_CONFIG_URL.C3_DASHBOARD}`, pathMatch: 'full' },
  { path: '', redirectTo: '/landingpage', pathMatch: 'full' },
  { path: '**', redirectTo: '/landingpage', pathMatch: 'full' }, // wildcart route. Should be the last one!
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
