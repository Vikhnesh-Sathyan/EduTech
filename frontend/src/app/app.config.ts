import { ApplicationConfig } from '@angular/core';

//enables Angular to send HTTP requests to our Express APIs.
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { authInterceptor } from './interceptors/auth.interceptor';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
  provideRouter(routes), //Routing
  provideHttpClient( //HTTP requests
    //“Use my authInterceptor for HTTP requests.”
    withInterceptors([authInterceptor])
  )
]
};