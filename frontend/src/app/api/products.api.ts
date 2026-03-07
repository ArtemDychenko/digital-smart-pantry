import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Product, ProductDto, toDto, toModel } from '@models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductsApi extends BaseApi<Product, ProductDto> {
  constructor() {
    super(`/api/products`, toModel, toDto);
  }
}
