
import { ApplicationConfig } from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { provideMarkdown } from 'ngx-markdown';

import { authInterceptor } from './core/interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [

    // Application routing
    provideRouter(routes),

    // HTTP requests with authentication interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // Markdown rendering support
    provideMarkdown()

  ]
};
