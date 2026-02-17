import { Injectable } from '@angular/core';
import { SsoService } from './sso.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private ssoService: SsoService) {}

  checkSession() {
    const isSesionExpired = true;
    if (isSesionExpired) {
      this.ssoService.redirectToSSOLogin();
      return false;
    }
    return true;
  }
}
