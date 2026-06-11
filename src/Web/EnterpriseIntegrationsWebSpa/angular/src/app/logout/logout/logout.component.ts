import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { AZURE_AD_LOGOUT_URL, LANDING_PAGE } from 'src/app/core/constants/constants';
import { DataState } from 'src/app/core/services/data-state';
import { SsoService } from 'src/app/core/services/sso.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent implements OnInit {

  landingPageLink: string = '/landingpage';
  logoutLink: string = AZURE_AD_LOGOUT_URL;

  logoutContent = LANDING_PAGE.LOGOUT_CONTENT;
  microsoftLogoutTxt = LANDING_PAGE.MICROSOFT_LOGOUT_TXT;
  loginAgainTxt = LANDING_PAGE.LOGIN_AGAIN_TXT;

  declare isLoggedOut: boolean;
  declare redirectUri: string;
  declare firstName: string;

  constructor(
        private ssoSVC: SsoService,
        private readonly dataState: DataState,
  ){}

  ngOnInit() {
    this.dataState.user$
      .pipe(take(1))
      .subscribe({
        next: user => {
          if (user?.firstName) this.firstName = user.firstName;
        }
      });
    this.isLoggedOut = false;
    this.redirectUri = this.getRedirectUri(new URL(globalThis.location.href));
    this.logoutLink = this.logoutLink.replace('<redirect_uri>', encodeURIComponent(this.redirectUri));
    this.logout();
  }

  private getRedirectUri(url: URL): string {
    return `${url.origin}/sso`;
  }

  logout() {
    this.ssoSVC.logout().subscribe({
      next: () => {
        this.isLoggedOut = true;
        sessionStorage.clear();
        localStorage.clear();
        this.dataState.clearUser();
        this.dataState.clearUserPermissions();
      },
      error: (err) => console.log('Error while calling logout API - ', err)
    });
  }
}
