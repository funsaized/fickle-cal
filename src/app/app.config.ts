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
// import {
//   KeycloakAngularModule,
//   KeycloakBearerInterceptor,
//   KeycloakService,
// } from 'keycloak-angular';

//   function initializeKeycloak(keycloak: KeycloakService) {
//     return () =>
//       keycloak.init({
//         config: {
//           url: 'http://localhost:8081/',
//           realm: 'feinedappdev',
//           clientId: 'feinedclientdev',
//         },
//         initOptions: {
//           // onLoad: 'login-required', // Action to take on load
//           pkceMethod: 'S256',
//           redirectUri: 'http://localhost:4200/home', // TODO: home
//           // silentCheckSsoRedirectUri:
//           //   window.location.origin + '/assets/silent-check-sso.html', // URI for silent SSO checks
//         },
//         enableBearerInterceptor: true,
//         bearerPrefix: 'Bearer',
//       });
//   }

// // Provider for Keycloak Bearer Interceptor
// const KeycloakBearerInterceptorProvider: Provider = {
//   provide: HTTP_INTERCEPTORS,
//   useClass: KeycloakBearerInterceptor,
//   multi: true,
// };

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
    // KeycloakAngularModule,
    // KeycloakBearerInterceptorProvider,
    // KeycloakService,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeKeycloak,
    //   multi: true,
    //   deps: [KeycloakService],
    // },
  ],
};
