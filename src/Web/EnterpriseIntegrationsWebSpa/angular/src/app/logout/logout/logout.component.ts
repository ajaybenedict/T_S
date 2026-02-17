import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { AZURE_AD_LOGOUT_URL, HOSTNAME_INT, HOSTNAME_PROD, HOSTNAME_UAT, REDIRECT_URI_INT, REDIRECT_URI_LOCAL, REDIRECT_URI_STREAMONE, REDIRECT_URI_UAT } from 'src/app/core/constants/constants';
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

  declare isLoggedOut: boolean;
  declare redirectUri: string;
  declare firstName: string;

  constructor(
        private ssoSVC: SsoService,
        private readonly dataState: DataState,        
  ){}

  ngOnInit() {
    this.dataState.firstName$
      .pipe(take(1))
      .subscribe({
        next: name => {
          if (name) this.firstName = name;
        }
      });
    this.isLoggedOut = false;
    const hostName = new URL(window.location.href).hostname;
    if (hostName === HOSTNAME_UAT) {
      this.redirectUri = REDIRECT_URI_UAT;
    }
    else if (hostName === HOSTNAME_INT) {
      this.redirectUri = REDIRECT_URI_INT;
    }
    else if (hostName === HOSTNAME_PROD) {
      this.redirectUri = REDIRECT_URI_STREAMONE;
    }
    else {
      this.redirectUri = REDIRECT_URI_LOCAL;
    }
    this.logoutLink = this.logoutLink.replace('<redirect_uri>', encodeURIComponent(this.redirectUri));
    this.logout();
  }

  logout() {
    this.ssoSVC.logout().subscribe({
      next: () => {        
        this.isLoggedOut = true;
        sessionStorage.clear();
        localStorage.clear();
        this.dataState.clearFirstName();
        this.dataState.clearUserPermissions();
      },
      error: (err) => console.log('Error while calling logout API - ', err)
    });
  }
}
