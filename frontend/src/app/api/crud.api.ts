import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CrudApi {
  private readonly httpClient = inject(HttpClient);

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.httpClient.get<T>(url, { params });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.httpClient.post<T>(url, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.httpClient.put<T>(url, body);
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.httpClient.patch<T>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.httpClient.delete<T>(url);
  }
}
