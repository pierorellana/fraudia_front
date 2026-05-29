import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { loadingGuard } from './core/guards/loading.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: 'uploads',
        loadComponent: () =>
          import('./features/uploads/pages/upload-dataset-page/upload-dataset-page.component').then(
            (m) => m.UploadDatasetPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./features/claims/pages/claims-list-page/claims-list-page.component').then(
            (m) => m.ClaimsListPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: 'claims/:id',
        loadComponent: () =>
          import('./features/claims/pages/claim-detail-page/claim-detail-page.component').then(
            (m) => m.ClaimDetailPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: 'rules',
        loadComponent: () =>
          import('./features/rules/pages/rules-page/rules-page.component').then(
            (m) => m.RulesPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: 'agent',
        loadComponent: () =>
          import('./features/agent/pages/agent-chat-page/agent-chat-page.component').then(
            (m) => m.AgentChatPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/pages/reports-page/reports-page.component').then(
            (m) => m.ReportsPageComponent,
          ),
        canDeactivate: [loadingGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
