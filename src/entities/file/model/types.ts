// Типы для файлового редактора согласно API документации

export interface FileTreeItem {
  id: string;
  path: string;
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  mimeType?: string;
  permissions: 'READ_ONLY' | 'READ_WRITE';
  createdAt: string;
  updatedAt: string;
  childrenCount?: number;
  children?: FileTreeItem[];
  hasChildren?: boolean;
  expanded?: boolean;
}

export interface FileTreeResponse {
  items: FileTreeItem[];
  total: number;
}

export interface FileContent {
  id: string;
  path: string;
  name: string;
  content: string;
  size: number;
  mimeType?: string;
  encoding: string;
  permissions: string;
  createdAt: string;
  updatedAt: string;
  etag: string;
  pagination?: {
    startLine: number;
    endLine: number;
    totalLines: number;
    hasMore: boolean;
    currentPageSize: number;
  };
  warnings?: {
    largeFile: boolean;
    performanceWarning?: string;
    recommendedPageSize?: number;
  };
}

export interface FileVersion {
  id: string;
  fileId: string;
  content: string;
  size: number;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  message?: string;
}

export interface FileHistoryResponse {
  versions: FileVersion[];
  total: number;
  hasMore: boolean;
}

export interface Draft {
  id: string;
  fileId: string;
  filePath: string;
  content: string;
  encoding: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftsResponse {
  drafts: Draft[];
  total: number;
}

// Параметры запросов
export interface FileTreeParams {
  path?: string;
  includeSystemFiles?: boolean;
  search?: string;
  lazy?: boolean;
  loadChildren?: boolean;
}

export interface FileContentParams {
  filePath: string;
  encoding?: 'utf8' | 'utf16' | 'ascii' | 'latin1';
  startLine?: number;
  endLine?: number;
  maxLines?: number;
}

export interface FileHistoryParams {
  filePath: string;
  limit?: number;
  offset?: number;
}

export interface CreateFileParams {
  filePath: string;
  name: string;
  content?: string;
}

export interface CreateDirectoryParams {
  filePath: string;
  name: string;
}

export interface MoveFileParams {
  sourcePath: string;
  targetPath: string;
}

export interface CopyFileParams {
  sourcePath: string;
  targetPath: string;
}

export interface SaveFileParams {
  filePath: string;
  content: string;
  encoding?: string;
  lastModified?: string;
  message?: string;
}

export interface SaveDraftParams {
  filePath: string;
  content: string;
  encoding?: string;
}

export interface RestoreVersionParams {
  filePath: string;
  versionId: string;
}

export interface RestoreDraftParams {
  filePath: string;
  draftId: string;
}

export interface CompareVersionsParams {
  filePath: string;
  versionId1: string;
  versionId2: string;
}

// WebSocket сообщения
export interface WebSocketMessage {
  type: string;
  filePath?: string;
  userId?: string | number;
  timestamp?: string;
  cursor?: {
    line: number;
    column: number;
    selectionStart?: number;
    selectionEnd?: number;
  };
  [key: string]: string | number | boolean | object | undefined;
}

export interface FileOpenedMessage extends WebSocketMessage {
  type: 'file_opened';
  filePath: string;
}

export interface FileClosedMessage extends WebSocketMessage {
  type: 'file_closed';
  filePath: string;
}

export interface ContentChangedMessage extends WebSocketMessage {
  type: 'content_changed';
  filePath: string;
  content: string;
}

export interface CursorMovedMessage extends WebSocketMessage {
  type: 'cursor_moved';
  filePath: string;
  cursor: {
    line: number;
    column: number;
    selectionStart?: number;
    selectionEnd?: number;
  };
}

export interface FileModifiedMessage extends WebSocketMessage {
  type: 'file_modified';
  filePath: string;
  userId: number;
  timestamp: string;
}

export interface UserJoinedMessage extends WebSocketMessage {
  type: 'user_joined';
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
}

export interface UserLeftMessage extends WebSocketMessage {
  type: 'user_left';
  userId: string;
  timestamp: string;
}

export interface ActiveUsersMessage extends WebSocketMessage {
  type: 'active_users';
  users: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    filePath: string;
    cursor?: {
      line: number;
      column: number;
      selectionStart?: number;
      selectionEnd?: number;
    };
    lastSeen: string;
  }>;
}

export type WebSocketOutgoingMessage =
  | FileOpenedMessage
  | FileClosedMessage
  | ContentChangedMessage
  | CursorMovedMessage;

export type WebSocketIncomingMessage =
  | FileModifiedMessage
  | UserJoinedMessage
  | UserLeftMessage
  | ActiveUsersMessage;

// Состояние редактора
export interface EditorState {
  currentFile: FileContent | null;
  fileTree: FileTreeItem[];
  openedFiles: string[];
  activeUsers: ActiveUsersMessage['users'];
  drafts: Draft[];
  isLoading: boolean;
  error: string | null;
}
