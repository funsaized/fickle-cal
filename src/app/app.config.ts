import {
  APP_INITIALIZER,
  ApplicationConfig,
  Injector,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { initDatabase } from './services/db.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () => initDatabase(injector),
      multi: true,
      deps: [Injector],
    },
  ],
};
