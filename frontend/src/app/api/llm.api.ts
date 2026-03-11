import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudApi } from '@api/crud.api';
import { LLMCommandRequest, LLMStreamEvent } from '@models/llm-command';

@Injectable({
  providedIn: 'root',
})
export class LLMApi {
  private readonly apiClient = inject(CrudApi);

  commandStream(request: LLMCommandRequest): Observable<LLMStreamEvent> {
    return new Observable((observer) => {
      const controller = new AbortController();

      fetch('/api/ai/command-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            observer.error(new Error(`HTTP ${response.status}`));
            return;
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const processBuffer = () => {
            const parts = buffer.split('\n\n');
            buffer = parts.pop() ?? '';

            for (const part of parts) {
              if (!part.trim()) continue;
              let eventType = '';
              let data = '';
              for (const line of part.split('\n')) {
                if (line.startsWith('event:')) eventType = line.slice(6).trim();
                else if (line.startsWith('data:')) data = line.slice(5).trim();
              }
              if (data) {
                try {
                  observer.next({ type: eventType as LLMStreamEvent['type'], ...JSON.parse(data) });
                } catch {
                  /* ignore malformed chunks */
                }
              }
            }
          };

          const read = () => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  observer.complete();
                  return;
                }
                buffer += decoder.decode(value, { stream: true });
                processBuffer();
                read();
              })
              .catch((err) => observer.error(err));
          };

          read();
        })
        .catch((err) => observer.error(err));

      return () => controller.abort();
    });
  }
}
