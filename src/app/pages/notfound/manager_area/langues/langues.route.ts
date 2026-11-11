import { Routes } from '@angular/router';

export default [
    {
        path: '',
        data: { breadcrumb: 'Manage Languages' },
        children: [
            {
                path: '',
                loadComponent: () => import('./list-langues/list-langues.component').then(m => m.ListLanguesComponent),
                data: { breadcrumb: 'Gestion des Profile Besoin' }
            },
            {
                path: ':idFPB/edit',
                loadComponent: () => import('./form-langues/form-langues.component').then(m => m.FormLanguesComponent)
            },
            {
                path: 'new',
                loadComponent: () => import('./form-langues/form-langues.component').then(m => m.FormLanguesComponent)
            }





        ]
    }
] as Routes;
