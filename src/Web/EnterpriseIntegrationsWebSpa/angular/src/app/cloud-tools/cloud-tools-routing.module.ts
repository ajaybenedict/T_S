import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { PermissionsEnum } from '../core/config/permissions.config';
import { CLOUD_TOOLS_ROUTE, ROUTE_DATA_KEYS } from '../core/constants/constants';
import { CloudToolsDashboardComponent } from './cloud-tools-dashboard/cloud-tools-dashboard.component';
import { cloudToolsCanActivateGuard } from './cloud-tools.guard';
import { cloudToolsTransactionsResolver } from './resolvers/cloud-tools-transactions.resolver';

const createCloudToolsRoute = (path: string, permission: PermissionsEnum, animationKey: string): Route => ({
  path,
  component: CloudToolsDashboardComponent,
  canActivate: [cloudToolsCanActivateGuard],
  resolve: {
    [CLOUD_TOOLS_ROUTE.RESOLVER]: cloudToolsTransactionsResolver,
  },
  data: {
    [ROUTE_DATA_KEYS.ANIMATION]: animationKey,
    [ROUTE_DATA_KEYS.PERMISSIONS]: [permission],
  },
});

const routes: Routes = [
  createCloudToolsRoute(CLOUD_TOOLS_ROUTE.EST_MANAGER, PermissionsEnum.ESTManager, 'CloudToolsEstManagerDashboard'),
  createCloudToolsRoute(CLOUD_TOOLS_ROUTE.PCR_CLEANUP, PermissionsEnum.PCRCleanUp, 'CloudToolsPcrCleanupDashboard'),
  createCloudToolsRoute(CLOUD_TOOLS_ROUTE.SANDBOX_CLEANUP, PermissionsEnum.SandBoxCleanUp, 'CloudToolsSandboxCleanupDashboard'),
  createCloudToolsRoute(CLOUD_TOOLS_ROUTE.UPDATE_MPNID, PermissionsEnum.UpdateMPNID, 'CloudToolsUpdateMpnidDashboard'),
  createCloudToolsRoute(CLOUD_TOOLS_ROUTE.SUBS_TRANSFER, PermissionsEnum.SubscriptionTransfer, 'CloudToolsSubscriptionTransferDashboard'),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloudToolsRoutingModule {}
