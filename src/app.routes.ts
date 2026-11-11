import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';
import { AppLayoutAdmin } from '@/admin/layout/components/app.layout';
import { CreateProductComponent } from '@/admin/product/create-product/create-product.component';
import { AuthGuard } from '@/core/services/auth.guard';
export const appRoutes: Routes = [

    { path: '', redirectTo: '/home', pathMatch: 'full' },

    {
        path: 'login-admin',
        loadComponent: () => import('@/admin/auth-admin/auth-admin.component').then(m => m.AuthAdminComponent),
        data: { breadcrumb: 'Connexion Admin' }
    },

    {
        path: 'seller',
        component: AppLayout,
     //   canActivate: [AuthGuard],
        data: { roles: ['ROLE_SELLER'] },
        children: [

            {
                path: 'dashboard',
                data: { breadcrumb: 'E-Commerce Dashboard' },
                loadComponent: () => import('@/pages/dashboard-seller/dashboard-seller.component').then((c) => c.DashboardSellerComponent)

            },
            {
                path: 'sourcing',
                data: { breadcrumb: 'Sourcing' },
                loadComponent: () => import('@/pages/sourcingModule/compenant/sourcing/sourcing.component').then((c) => c.SourcingComponent)
            },
            {
                path: 'createSourcing',
                data: { breadcrumb: 'createSourcing' },
                loadComponent: () => import('@/pages/sourcingModule/compenant/create-sourcing/create-sourcing.component').then((c) => c.CreateSourcingComponent)
            },
            {
                path: 'mywallet',
                data: { breadcrumb: 'My wallet' },
                loadComponent: () => import('@/pages/my-wallet/my-wallet.component').then((c) => c.MyWalletComponent)

            },

            {
                path: 'mytickets',
                data: { breadcrumb: 'My tickets' },
                loadComponent: () => import('@/pages/my-tickets/my-tickets.component').then((c) => c.MyTicketsComponent)

            },

            {
                path: 'products',
                data: { breadcrumb: 'Products' },
                loadComponent: () => import('@/pages/product-seller/list-product-seller/list-product-seller.component').then((m) => m.ListProductSellerComponent)
            },
            {
                path: 'orders',
                data: { breadcrumb: 'Orders' },
                loadComponent: () => import('@/pages/order-seller/list-order-seller/list-order-seller.component').then((m) => m.ListOrderComponent)
            },
            {
                path: 'create-order',
                data: { breadcrumb: 'Create Order' },
                loadComponent: () => import('@/pages/order-seller/create-order-seller/create-order-seller.component').then((m) => m.CreateOrderComponent)

            },
            {
                path: 'notifications',
                data: { breadcrumb: 'Notifications' },
                loadComponent: () => import('@/pages/notification/seller-notifications/seller-notifications.component').then((c) => c.SellerNotificationsComponent)
            },
            {
                path: 'profile',
                data: { breadcrumb: 'Profile Seller' },
                loadComponent: () => import('@/pages/profile-seller/profile-seller.component').then((c) => c.ProfileSellerComponent)
            },

             {
                path: 'apps',
                data: { breadcrumb: 'Apps' },
                loadComponent: () => import('@/pages/apps/apps.component').then((c) => c.AppsComponent)
            },

              {
                path: 'fees',
                data: { breadcrumb: 'Fees' },
                loadComponent: () => import('@/pages/seller-fees/seller-fees.component').then((c) => c.SellerFeesComponent)
            },

        ]
    },

    {
        path: 'admin',
        component: AppLayoutAdmin,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        children: [
            {
                path: 'dashboard',
                data: { breadcrumb: 'dashboard' },

                loadComponent: () => import('@/admin/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
            },
            {
                path: 'list-sellers',
                data: { breadcrumb: 'list sellers' },

                loadComponent: () => import('@/admin/list-seller/list-seller.component').then(m => m.ListSellerComponent),
            },
            {
                path: 'deleted-sellers',
                data: { breadcrumb: 'Vendeurs supprimés' },

                loadComponent: () => import('@/admin/deleted-sellers/deleted-sellers.component').then(m => m.DeletedSellersComponent),
            },
            {
                path: 'details-seller/:id',
                data: { breadcrumb: 'Details seller' },

                loadComponent: () => import('@/admin/details-seller/details-seller.component').then(m => m.DetailsSellerComponent),
            },

            {
                path: 'details-seller',
                data: { breadcrumb: 'Details seller' },

                loadComponent: () => import('@/admin/details-seller/details-seller.component').then(m => m.DetailsSellerComponent),
            },
            {
                path: 'products/create/:requestId',
                component: CreateProductComponent,
                data: { breadcrumb: 'Create Product' },
            },
            {
                path: 'products',
                data: { breadcrumb: 'Products' },
                loadComponent: () => import('@/admin/product/list-product-admin/list-product-admin.component').then(m => m.ListProductAdminComponent),
            },
            {
                path: 'list-request',
                data: { breadcrumb: "List Request" },
                loadComponent: () => import('@/admin/sourcing/sourcing-request/sourcing-request.component').then(m => m.AdminSourcingComponent),
            },
            {
                path: 'orders',
                data: { breadcrumb: "Orders" },
                loadComponent: () => import('@/admin/orders/admin-orders-component/admin-orders-component').then(m => m.AdminOrdersComponent)
            },
            {
                path: 'notifications',
                data: { breadcrumb: "Notifications" },
                loadComponent: () => import('@/admin/notification/notification-list/notification-list.component').then(m => m.NotificationListComponent)
            },
            {
                path: 'notifications/edit/:id',
                data: { breadcrumb: "Edit Notification" },
                loadComponent: () => import('@/admin/notification/notification-form/notification-form.component').then(m => m.NotificationFormComponent)
            },
            {
                path: 'notifications/create',
                data: { breadcrumb: "Create Notification" },
                loadComponent: () => import('@/admin/notification/notification-form/notification-form.component').then(m => m.NotificationFormComponent)
            },

            {
                path: 'deposits',
                data: { breadcrumb: "Deposit" },
                loadComponent: () => import('@/admin/deposit/deposit.component').then(m => m.DepositComponent)
            },

            
            {
                path: 'fees',
                data: { breadcrumb: "Fees" },
                loadComponent: () => import('@/admin/fee-list/fee-list.component').then(m => m.FeeListComponent)
            },

            {
                path: 'wallet-transactions',
                data: { breadcrumb: "Transactions" },
                loadComponent: () => import('@/admin/admin-wallet-transactions/admin-wallet-transactions.component').then(m => m.AdminWalletTransactionsComponent)
            },

            {
                path: 'withdrawals',
                data: { breadcrumb: "Withdrawals" },
                loadComponent: () => import('@/admin/withdrawal-list/withdrawal-list.component').then(m => m.WithdrawalListComponent)
            },

            {
                path: 'tickets',
                data: { breadcrumb: "Ticket" },
                loadComponent: () => import('@/admin/list-ticket/list-ticket.component').then(m => m.ListTicketComponent)
            },

            {
                path: 'users',
                data: { breadcrumb: "Utilisateurs" },
                loadComponent: () => import('@/admin/list-users/list-users.component').then(m => m.ListUsersComponent)
            },

            {
                path: 'add-user',
                data: { breadcrumb: "Utilisateurs" },
                loadComponent: () => import('@/admin/add-user/add-user.component').then(m => m.AddUserComponent)
            }




        ]
    },

    {
        path: '',
        children: [
            {
                path: 'home',
                // data: { breadcrumb: 'list sellers' },
                loadComponent: () => import('@/frontoffice/home/home.component').then(m => m.HomeComponent),
            },

            {
                path: 'about-us',
                // data: { breadcrumb: 'list sellers' },
                loadComponent: () => import('@/frontoffice/about-us/about-us.component').then(m => m.AboutUsComponent),
            },

            {
                path: 'contact-us',
               // data: { breadcrumb: 'list sellers' },
                loadComponent: () => import('@/frontoffice/contact-us/contact-us.component').then(m => m.ContactUsComponent),
            },

            {
                path: 'services',
               // data: { breadcrumb: 'list sellers' },
                loadComponent: () => import('@/frontoffice/service/service.component').then(m => m.ServiceComponent),
            },

            {
                path: 'privacy-and-policy',
               // data: { breadcrumb: 'list sellers' },
                loadComponent: () => import('@/frontoffice/policy-page/policy-page.component').then(m => m.PolicyPageComponent),
            },

            {
                path: 'terms-and-condition',
               // data: { breadcrumb: 'list sellers' },
                loadComponent: () => import('@/frontoffice/term-condition/term-condition.component').then(m => m.TermConditionComponent),
            },


           {
             path: 'auth/verification-pending',
              loadComponent: () => import('@/pages/verification-pending/verification-pending.component').then(m => m.VerificationPendingComponent),
           },

        ]
    },
    { path: 'auth', loadChildren: () => import('@/pages/auth.routes') },
    {
        path: 'notfound',
        loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
