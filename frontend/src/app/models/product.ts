export type Product = ProductDto;

export interface ProductDto {
  id: number;
  name: string;
  quantity: number;
}

export function toModel(dto: ProductDto): Product {
  return { ...dto };
}

export function toDto(model: Partial<Product>): Partial<ProductDto> {
  return { ...model };
}
