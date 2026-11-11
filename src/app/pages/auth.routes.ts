import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'create-account',
        loadComponent: () => import('./create-account-seller/create-account-seller.component').then(m => m.CreateAccountSellerComponent),
        data: { breadcrumb: 'Connexion' }
    },

    {
        path: 'login-seller',
        loadComponent: () => import('./auth-seller/auth-seller.component').then(m => m.AuthSellerComponent),
        data: { breadcrumb: 'Connexion' }
    },

    {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        data: { breadcrumb: 'Connexion' }
    },

];

export default routes;
