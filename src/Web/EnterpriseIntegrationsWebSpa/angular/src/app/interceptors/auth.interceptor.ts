import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Host to exclude withCredentials
    const excludeHost = 'https://smp.shadow.apptium.com';

    // Check if the request URL starts with the excluded host
    if (request.url.startsWith(excludeHost)) {
      // Clone the request without withCredentials
      request = request.clone({
        withCredentials: false
      });
    } else {
      // Clone the request with withCredentials
      request = request.clone({
        withCredentials: true
      });
    }

    // for running the App in localhost----------
    /* if (sessionStorage.getItem('jwtToken') === null) {
      return next.handle(request); // If no JWT token, continue without modification
    }

    const jwtToken = sessionStorage.getItem('jwtToken');
    if (jwtToken) {
      // Add JWT token to headers
      let headers: { [key: string]: string } = {
        'JwtToken': jwtToken
      };

      request = request.clone({
        setHeaders: headers
      }); */
      // ---------localhost code --------------
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle plain text responses as successful
          if (error.headers.get('Content-Type')?.startsWith('text/plain')) {
            return of(new HttpResponse({ status: error.status, statusText: error.statusText }));
          } else {
            // Re-throw the error to propagate it to the calling code
            return throwError(error);
          }
        })
      );
    }
    // for running the App in localhost----
    /* else {
      return next.handle(request);
    }
  } */
  // ------localhost code--------
}
