import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SkuUploadDataService } from '../core/services/sku-upload-data.service';
import { APP_ROUTE_CONFIG_URL } from '../core/constants/constants';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private skuDataSVC: SkuUploadDataService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => { 
        if(request.url?.includes('/api-product/api/v1/product')) {
          if(error.status == 403){ 
            //  User not authorized to use SKU bulk upload tool
            console.log('You are not authorized to use SKU bulk upload tool');
            this.skuDataSVC.setIsSKUAuthError(true);
          } else if (error.status == 401) {     
            //  Token expired or no token. Redirect to login page. Bug 594696
            console.log('Auth token expired/ no auth token.');
            this.skuDataSVC.setIsSKUAuthError(false);
            this.router.navigateByUrl(APP_ROUTE_CONFIG_URL.SSO);
          } else {
            this.skuDataSVC.setIsSKUAuthError(false);
          }
            return throwError(() => error);
        } else {
          return throwError(() => error);
        }       
      })
    )
  }
}
