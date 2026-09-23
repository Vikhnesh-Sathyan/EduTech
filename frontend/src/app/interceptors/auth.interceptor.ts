import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  //Gets the token from the browser.
  const token = localStorage.getItem('token');

  //If a token exists, we want to attach it to the request.
  if (token) {
    const authReq = req.clone({  //re.clone - creates a modified copy of the request.
      setHeaders: {
        Authorization: `Bearer ${token}` //backend receives the JWT.
      }
    });
    return next(authReq);
  }
//If there is no token, the original request is sent without an Authorization header.
  return next(req);
};