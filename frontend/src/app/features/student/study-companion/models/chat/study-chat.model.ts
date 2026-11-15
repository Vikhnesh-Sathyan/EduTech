
export interface StudyChatMessage {
  messageId: number;
  messageType: 'user' | 'assistant';
  messageContent: string;
}

export interface StudyChatHistoryResponse {
  message: string;
  messages: StudyChatMessage[];
}

export interface StudyChatQuestionRequest {
  question: string;
}

export interface StudyChatQuestionResponse {
  message: string;
  answer: string;
  sources: unknown[];
}
