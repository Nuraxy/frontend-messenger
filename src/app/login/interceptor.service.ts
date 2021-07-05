import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LoginService} from './login.service';

@Injectable({providedIn: 'root'})
export class InterceptorService implements HttpInterceptor {
  constructor(private loginService: LoginService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentToken = this.loginService.currentTokenValue;
    if (currentToken && currentToken.tokenValue) {
      const userRole = this.loginService.currentTokenValue.user.userRole;
      request = request.clone(
        {setHeaders: {
            Authentication: `${currentToken.tokenValue}`,
            UserRole: `${userRole.roleName}`
          }
        });
    } else {
      const param = new URLSearchParams(document.location.search.substring(1));
      const key = param.get('key');
      request = request.clone(
        {setHeaders: {
            Authentication: `${key}`
          }}
      );
    }
    return next.handle(request);
  }
}
