import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import {
  ProductForm,
  ProductsListAsideFormBuilder,
} from '@components/products-list-aside/products-list-aside-form/products-list-aside-form.builder';
import { ProductsApi } from '@api/products.api';
import { Product } from '@models/product';

@Component({
  selector: 'app-products-list-aside-form',
  imports: [Button, ReactiveFormsModule, InputTextModule, ToastModule, InputNumberModule],
  templateUrl: './products-list-aside-form.html',
  styleUrl: './products-list-aside-form.scss',
})
export class ProductsListAsideForm {
  readonly #productsListAsideFormBuilder = inject(ProductsListAsideFormBuilder);
  readonly #productsApi = inject(ProductsApi);
  private messageService = inject(MessageService);

  readonly save = output<Product>();
  readonly cancel = output<void>();

  productForm: ProductForm = this.#productsListAsideFormBuilder.create();

  product = input<Product>();

  constructor() {
    effect(() => {
      const currentProduct = this.product();
      if (currentProduct) {
        this.productForm = this.#productsListAsideFormBuilder.create(currentProduct);
      }
    });
  }

  onSaveItem(): void {
    if (this.productForm.invalid) return;
    const value = this.#productsListAsideFormBuilder.toValue(this.productForm);

    if (this.product() && this.product()?.id != null) {
      this.#productsApi.update(String(this.product()!.id), value).subscribe({
        next: (updated) => {
          this.productForm.reset({ name: '', quantity: 0 });
          this.save.emit(updated);
        },
        error: (err) =>
          this.messageService.add({
            severity: 'error',
            summary: 'Save failed',
            detail: err?.message,
          }),
      });
      return;
    }

    this.#productsApi.create(value).subscribe({
      next: (createdProduct) => {
        this.productForm.reset({ name: '', quantity: 0 });
        this.save.emit(createdProduct);
      },
      error: (err) =>
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: err?.message,
        }),
    });
  }

  onCancel(): void {
    this.productForm.reset({ name: '', quantity: 0 });
    this.cancel.emit();
  }
}
