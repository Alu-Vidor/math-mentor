export enum MessageRole {
  USER = 'user',
  TEACHER = 'teacher'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image'
}

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string; // Text content or Base64 image string
  isThinking?: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING_HINT = 'ANALYZING_HINT',
  HINT_GIVEN = 'HINT_GIVEN',
  ANALYZING_FULL = 'ANALYZING_FULL',
  FULL_REVIEW_GIVEN = 'FULL_REVIEW_GIVEN'
}