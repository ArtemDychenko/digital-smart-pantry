import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'assistant',
    pathMatch: 'full',
  },
  {
    path: 'assistant',
    loadComponent: () => import('@components/assistant/assistant').then((m) => m.Assistant),
  },
];
