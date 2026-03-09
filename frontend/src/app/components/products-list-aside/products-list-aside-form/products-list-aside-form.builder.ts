import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from '@models/product';

export type ProductForm = FormGroup<{
  name: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Injectable({
  providedIn: 'root',
})
export class ProductsListAsideFormBuilder {
  readonly #form = inject(FormBuilder).nonNullable;

  create(product?: Product): ProductForm {
    return this.#form.group({
      name: this.#form.control<string>(product?.name ?? '', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(32),
      ]),
      quantity: this.#form.control<number>(product?.quantity ?? 0, Validators.required),
    });
  }

  toValue(form: ProductForm): Omit<Product, 'id'> {
    return form.getRawValue();
  }
}
