import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
 // {
 //   path: 'profile',
 //   loadComponent: () => import('./pages/auth/profile/profile.component').then(m => m.ProfileComponent),
    // canActivate: [AuthGuard]
  //},
  {
    path: '**',
    redirectTo: 'auth/login-seller'
  }
];
