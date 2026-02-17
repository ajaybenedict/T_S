import { APP_INITIALIZER, Provider } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpInterceptor } from '@angular/common/http';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from '../constants/constants';
import { Observable } from 'rxjs';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';

let remoteInterceptorInstance: HttpInterceptor;

function loadInterceptorFactory(): () => Promise<void> {
  return () =>
    loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './AuthInterceptor'
    }).then(m => {
      const InterceptorClass = m.AuthInterceptor ?? m.default;
      if (!InterceptorClass) {
        throw new Error('AuthInterceptor not found in remote module');
      }

      remoteInterceptorInstance = new InterceptorClass();
    });
}

@Injectable()
class RemoteInterceptorWrapper implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     console.log('asdasd');
    if (remoteInterceptorInstance) {
      return remoteInterceptorInstance.intercept(req, next);
      
    }

    console.warn('Remote AuthInterceptor not yet loaded, passing through');
    return next.handle(req);
  }
}

export const remoteAuthProviders: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: loadInterceptorFactory,
    multi: true,
    deps: []
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: RemoteInterceptorWrapper,
    multi: true
  }
];
