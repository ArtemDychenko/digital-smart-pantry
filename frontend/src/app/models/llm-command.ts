export interface LLMCommandRequest {
  userPrompt: string;
}

export interface LLMStreamEvent {
  type: 'working' | 'complete' | 'error';
  status?: string;
  message?: string;
  a2uiMessages?: any[];
}
