import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthTokenService } from '../core/services/auth-token.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(
    private authSVC: AuthTokenService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authSVC.getToken();
    const excludeHost = 'https://smp.shadow.apptium.com'; //configuration to add later

    // Check if the request URL starts with the excluded host
    if (request.url.startsWith(excludeHost)) {
      console.log('Skipping Authorization header for:', request.url);
      // Pass the request without adding Authorization header
      return next.handle(request);
    }

    // Add Authorization header for other requests if token is available
    if (token) {
      const cloneReq = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      return next.handle(cloneReq);
    } else {
      console.log('AuthTokenInterceptor - Auth token not available');
      return next.handle(request);
    }
  }

}
