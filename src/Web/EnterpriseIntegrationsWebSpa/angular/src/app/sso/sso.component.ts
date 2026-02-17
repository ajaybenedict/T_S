import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  AZURE_AD_LOGIN_URL,
  HOSTNAME_INT,
  HOSTNAME_PROD,
  HOSTNAME_UAT,
  REDIRECT_URI_INT,
  REDIRECT_URI_LOCAL,
  REDIRECT_URI_STREAMONE,
  REDIRECT_URI_UAT
} from '../core/constants/constants';
import { SsoService } from '../core/services/sso.service';
import { DataState } from '../core/services/data-state';
import { PermissionsLoaderDialogService } from '../core/services/permissions-loader-dialog.service';
import { SsoLoginService } from '../core/services/sso.login.service';

@Component({
  selector: 'app-sso',
  templateUrl: './sso.component.html',
})
export class SsoComponent implements OnInit, OnDestroy {

  private readonly subscription = new Subscription();
  private readonly scope = "openid profile email User.Read";

  constructor(
    private readonly ssoService: SsoService,
    private readonly dataState: DataState,
    private readonly dialogSVC: PermissionsLoaderDialogService,
    private readonly ssoLoginService: SsoLoginService
  ) {}

  ngOnInit(): void {
    this.dialogSVC.showDialog('Loader');
    this.handleAuthorizationFlow();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private handleAuthorizationFlow(): void {
    const parsedUrl = new URL(globalThis.location.href);
    const code = parsedUrl.searchParams.get('code');
    const state = parsedUrl.searchParams.get('state');

    // Case 1: Coming back from Azure with auth code → call backend SSO
    if (code) {
      this.performAuth(code, state);
      return;
    }

    // Case 2: Route contains state param (/sso/:state)
    const routeState = this.extractRouteState(parsedUrl);

    // Redirect to Azure with or without state value
    this.redirectToAzure(routeState);
  }

  private extractRouteState(url: URL): string | null {
    const lastSegment = url.pathname.split('/').pop();
    return lastSegment && lastSegment !== "sso" ? lastSegment : null;
  }

  private redirectToAzure(state?: string | null): void {
    const settingSub = this.dataState.appsettingObservable().subscribe({
      next: (appSettings) => {
        const clientId = appSettings.azureAdClientId;
        const redirectUri = this.getRedirectUri(new URL(globalThis.location.href));
        let azureUrl = this.buildAzureUrl(clientId, redirectUri, state);

        this.dialogSVC.closeDialog();
        console.log("Redirecting to Azure login:", azureUrl);
        globalThis.location.href = azureUrl;
      },
      error: (err) => {
        console.error("Failed loading app settings", err);
        this.dialogSVC.closeDialog();
      }
    });

    this.subscription.add(settingSub);
  }

  private buildAzureUrl(clientId: string, redirectUri: string, state?: string | null): string {
    let url = AZURE_AD_LOGIN_URL
      .replace('<client_id>', clientId)
      .replace('<scope>', encodeURIComponent(this.scope))
      .replace('<redirect_uri>', encodeURIComponent(redirectUri));

    url = url.replace('<state_id>', encodeURIComponent(state ?? ''));
    return url;
  }

  private getRedirectUri(url: URL): string {
    switch (url.hostname) {
      case HOSTNAME_UAT:
        return REDIRECT_URI_UAT;
      case HOSTNAME_INT:
        return REDIRECT_URI_INT;
      case HOSTNAME_PROD:
        localStorage.setItem('streamoneHub', url.toString());
        return REDIRECT_URI_STREAMONE;
      default:
        return REDIRECT_URI_LOCAL;
    }
  }

  private performAuth(code: string, state?: string | null): void {
    const payload = {
      authCode: code,
      stateId: state
    };

    const authSub = this.ssoService.sso(payload).subscribe({
      next: (res) => {
        this.ssoLoginService.handleSsoSuccess(res);
        this.dialogSVC.closeDialog();
      },
      error: (error) => {
        this.dialogSVC.closeDialog();
        this.ssoLoginService.handleSsoError(error);
      }
    });

    this.subscription.add(authSub);
  }
}
