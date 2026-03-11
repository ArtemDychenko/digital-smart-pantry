import { Component, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Product } from '@models/product';

@Component({
  selector: 'app-product-edit-dialog',
  imports: [DialogModule, ReactiveFormsModule, InputTextModule, InputNumberModule, Button],
  templateUrl: './product-edit-dialog.html',
  styleUrl: './product-edit-dialog.scss',
})
export class ProductEditDialog {
  visible = input.required<boolean>();
  productName = input('');
  productQuantity = input(0);

  accepted = output<Product>();
  close = output<void>();

  private readonly fb = inject(FormBuilder).nonNullable;

  form = this.fb.group({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(32),
    ]),
    quantity: this.fb.control(0, [Validators.required, Validators.min(0)]),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.form.reset({ name: this.productName(), quantity: this.productQuantity() });
      }
    });
  }

  onAccept(): void {
    if (this.form.invalid) return;
    this.accepted.emit(this.form.getRawValue() as Product);
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }
}
