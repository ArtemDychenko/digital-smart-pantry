import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudApi } from '@api/crud.api';
import { LLMCommandRequest, LLMCommandResponse } from '@models/llm-command';

@Injectable({
  providedIn: 'root',
})
export class LLMApi {
  private readonly apiClient = inject(CrudApi);

  command(request: LLMCommandRequest): Observable<LLMCommandResponse> {
    return this.apiClient.post<LLMCommandResponse>('/api/ai/command', request);
  }
}
