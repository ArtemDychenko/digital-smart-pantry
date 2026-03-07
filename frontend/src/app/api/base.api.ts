import { inject } from '@angular/core';
import { CrudApi } from '@api/crud.api';
import { map, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SearchResult, searchResultToModel } from '@models/search-result';

export class BaseApi<T, TDto> {
  protected readonly apiClient = inject(CrudApi);

  constructor(
    readonly baseUrl: string,
    readonly toModel: (dto: TDto) => T,
    readonly toDto: (model: Partial<T>) => Partial<TDto>,
  ) {}

  search(params?: HttpParams): Observable<SearchResult<T>> {
    return this.apiClient
      .get<SearchResult<TDto>>(this.baseUrl, params)
      .pipe(map((sr) => searchResultToModel(sr, this.toModel)));
  }

  find(id: string): Observable<T> {
    return this.apiClient.get<TDto>(`${this.baseUrl}/${id}`).pipe(map(this.toModel));
  }

  create(model: Partial<T>): Observable<T> {
    return this.apiClient.post<TDto>(this.baseUrl, this.toDto(model)).pipe(map(this.toModel));
  }

  update(id: string, model: Partial<T>): Observable<T> {
    return this.apiClient
      .patch<TDto>(`${this.baseUrl}/${id}`, this.toDto(model))
      .pipe(map(this.toModel));
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
