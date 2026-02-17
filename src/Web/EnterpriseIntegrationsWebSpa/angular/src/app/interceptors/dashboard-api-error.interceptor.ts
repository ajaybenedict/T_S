import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { DataState } from '../core/services/data-state';
import { PPCDashboardDataService } from '../core/services/ppc-dashboard-data.service';

@Injectable()
export class DashboardApiErrorInterceptor implements HttpInterceptor {

  constructor(
    private readonly dataState: DataState,
    private readonly dashboardDataSVC: PPCDashboardDataService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if(request.url?.includes('/api/v1/order/Orders')) {
          switch(error.status) {
            case 400:
            case 404:
            case 500:
              this.dataState.setHasDashboardAPIError(true);
              this.dashboardDataSVC.setOrderAPIFailed(true);
          }
          return throwError(() => error);
        }
        return throwError(() => error);
      })
    );
  }
}
