import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Product } from '@models/product';
import { ProductsApi } from '@api/products.api';
import { Button } from 'primeng/button';
import { ProductsListAsideForm } from '@components/products-list-aside/products-list-aside-form/products-list-aside-form';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-products-list-aside',
  imports: [DrawerModule, Button, ProductsListAsideForm],
  templateUrl: './products-list-aside.html',
  styleUrl: './products-list-aside.scss',
})
export class ProductsListAside implements OnInit {
  readonly router = inject(Router);
  private readonly productsApi = inject(ProductsApi);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  private messageService = inject(MessageService);

  readonly addingNewItem = signal(false);
  readonly editingItemId = signal<number | null>(null);

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading.set(true);
    this.productsApi.search().subscribe({
      next: (result) => {
        this.products.set(result.result);
        this.loading.set(false);
      },
      error: (err) => console.error('Error:', err),
    });
  }

  onRemoveItem(productId: number): void {
    this.productsApi.delete(String(productId)).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== productId));
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: err?.message,
        });
      },
    });
  }

  onChangeItem(productId: number): void {
    this.editingItemId.set(productId);
  }

  onProductSave(product: Product): void {
    if (product.id != null && this.products().some((p) => p.id === product.id)) {
      this.products.update((list) => list.map((p) => (p.id === product.id ? product : p)));
      this.editingItemId.set(null);
      return;
    }

    this.products.update((list) => [...list, product]);
    this.addingNewItem.set(false);
  }

  onClose() {
    this.router.navigate([{ outlets: { sidebar: null } }], { queryParamsHandling: 'preserve' });
  }
}
