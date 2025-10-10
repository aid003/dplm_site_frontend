import { httpRequest, HttpRequestOptions } from '@/shared/api/http-client';
import type {
  FileTreeResponse,
  FileContent,
  FileHistoryResponse,
  DraftsResponse,
  FileVersion,
  FileTreeParams,
  FileContentParams,
  FileHistoryParams,
  CreateFileParams,
  CreateDirectoryParams,
  MoveFileParams,
  CopyFileParams,
  SaveFileParams,
  SaveDraftParams,
  RestoreVersionParams,
  RestoreDraftParams,
  CompareVersionsParams,
} from '../model/types';

export class FileAPI {
  // Используем путь к файловым операциям (HTTP клиент добавит /api)
  private static readonly BASE_URL = '/projects';

  /**
   * Получение дерева файлов проекта
   */
  static async getFileTree(projectId: string, params?: FileTreeParams): Promise<FileTreeResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          // Сервер ожидает булево значение как строку "true"/"false"
          const serialized = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
          searchParams.append(key, serialized);
        }
      });
    }

    return await httpRequest<FileTreeResponse>(
      `${this.BASE_URL}/${projectId}/files/tree?${searchParams.toString()}`
    );
  }

  /**
   * Загрузка дочерних элементов папки
   */
  static async getChildren(projectId: string, folderPath: string): Promise<FileTreeResponse> {
    return await httpRequest<FileTreeResponse>(
      `${this.BASE_URL}/${projectId}/files/tree/children?path=${encodeURIComponent(folderPath)}`
    );
  }

  /**
   * Получение содержимого файла
   */
  static async getFileContent(projectId: string, params: FileContentParams): Promise<FileContent> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return await httpRequest<FileContent>(
      `${this.BASE_URL}/${projectId}/files/content?${searchParams.toString()}`
    );
  }

  /**
   * Сохранение содержимого файла
   */
  static async saveFile(projectId: string, params: SaveFileParams): Promise<FileContent> {
    return await httpRequest<FileContent>(
      `${this.BASE_URL}/${projectId}/files/content`,
      { 
        method: 'PUT',
        body: JSON.stringify(params) 
      } as HttpRequestOptions
    );
  }

  /**
   * Создание файла
   */
  static async createFile(projectId: string, params: CreateFileParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/create-file`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }

  /**
   * Создание папки
   */
  static async createDirectory(projectId: string, params: CreateDirectoryParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/create-directory`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }

  /**
   * Удаление файла/папки
   */
  static async deleteFile(projectId: string, filePath: string): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files?filePath=${encodeURIComponent(filePath)}`, { 
      method: 'DELETE' 
    } as HttpRequestOptions);
  }

  /**
   * Перемещение файла/папки
   */
  static async moveFile(projectId: string, params: MoveFileParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/move`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }

  /**
   * Копирование файла/папки
   */
  static async copyFile(projectId: string, params: CopyFileParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/copy`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }

  /**
   * Получение истории изменений файла
   */
  static async getFileHistory(projectId: string, params: FileHistoryParams): Promise<FileHistoryResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return await httpRequest<FileHistoryResponse>(
      `${this.BASE_URL}/${projectId}/files/history?${searchParams.toString()}`
    );
  }

  /**
   * Восстановление версии файла
   */
  static async restoreVersion(projectId: string, params: RestoreVersionParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/restore-version`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }

  /**
   * Сравнение версий
   */
  static async compareVersions(projectId: string, params: CompareVersionsParams): Promise<{
    version1: FileVersion;
    version2: FileVersion;
    diff: string;
    changes: {
      added: number;
      removed: number;
      modified: number;
    };
  }> {
    return await httpRequest(
      `${this.BASE_URL}/${projectId}/files/compare-versions`,
      { 
        method: 'POST',
        body: JSON.stringify(params) 
      } as HttpRequestOptions
    );
  }

  /**
   * Сохранение черновика
   */
  static async saveDraft(projectId: string, params: SaveDraftParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/draft`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }

  /**
   * Получение списка черновиков
   */
  static async getDrafts(projectId: string): Promise<DraftsResponse> {
    return await httpRequest<DraftsResponse>(`${this.BASE_URL}/${projectId}/files/drafts`);
  }

  /**
   * Восстановление черновика
   */
  static async restoreDraft(projectId: string, params: RestoreDraftParams): Promise<void> {
    await httpRequest(`${this.BASE_URL}/${projectId}/files/restore-draft`, { 
      method: 'POST',
      body: JSON.stringify(params) 
    } as HttpRequestOptions);
  }
}
