export interface LLMCommandRequest {
  userPrompt: string;
}

export interface LLMCommandResponse {
  message: string;
  item?: LLMCommandItem;
}

export interface LLMCommandItem {
  id: number;
  name: string;
  quantity: number;
}
