import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class PreviewInterceptor implements HttpInterceptor {

  private readonly isPreview = globalThis.location.hostname.includes('-preview.tdsynnex.org');

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isPreview) {
      request = request.clone({
        setHeaders: { env: 'preview' }
      });
    }
    return next.handle(request);
  }
}
