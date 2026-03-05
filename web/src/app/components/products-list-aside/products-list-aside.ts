import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Product } from '@models/product';
import { ProductsApi } from '@api/products.api';

@Component({
  selector: 'app-products-list-aside',
  imports: [DrawerModule],
  templateUrl: './products-list-aside.html',
  styleUrl: './products-list-aside.scss',
})
export class ProductsListAside implements OnInit {
  readonly router = inject(Router);
  private readonly productsApi = inject(ProductsApi);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);

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
      error: () => this.loading.set(false),
    });
  }

  onClose() {
    this.router.navigate([{ outlets: { sidebar: null } }], { queryParamsHandling: 'preserve' });
  }
}
