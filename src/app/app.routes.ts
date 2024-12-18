import { Routes } from '@angular/router';
import { ErrorComponent } from './components';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './containers';

export const routes: Routes = [
  // TODO: login w/ oauth auth provider (github)
  { path: '', redirectTo: 'init', pathMatch: 'full' },
  { path: 'user', component: ErrorComponent },
  { path: 'error', component: ErrorComponent },
  {
    path: 'init',
    component: HomeComponent,
    canActivate: [],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
];
