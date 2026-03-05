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
  {
    path: 'products-list',
    loadComponent: () =>
      import('@components/products-list-aside/products-list-aside').then(
        (m) => m.ProductsListAside,
      ),
    outlet: 'sidebar',
  },
];
