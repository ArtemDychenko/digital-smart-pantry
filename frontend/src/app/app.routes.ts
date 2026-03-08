import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'assistant-chat',
    pathMatch: 'full',
  },
  {
    path: 'assistant-chat',
    loadComponent: () =>
      import('@components/assistant-chat/assistant-chat').then((m) => m.AssistantChat),
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
