import { ApplicationConfig } from '@angular/core';

//enables Angular to send HTTP requests to our Express APIs.
import { provideHttpClient } from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};