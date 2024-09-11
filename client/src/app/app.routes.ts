import { Routes } from '@angular/router';
import { HomeComponent, ErrorComponent } from './components';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  // TODO: login w/ oauth auth provider (github)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'error', component: ErrorComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
];
