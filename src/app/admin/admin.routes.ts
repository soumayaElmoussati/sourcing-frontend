import { Routes } from '@angular/router';

const routes: Routes = [

    {
        path: 'login-admin',
        loadComponent: () => import('./auth-admin/auth-admin.component').then(m => m.AuthAdminComponent),
        data: { breadcrumb: 'Connexion' }
    },
];

export default routes;
