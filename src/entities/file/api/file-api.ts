import { httpClient, HttpRequestOptions } from '@/shared/api/http-client';
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
  // ВАЖНО: базовый URL не должен включать '/api', так как
  // 'http-client' уже добавляет '/api' через локальный прокси/rewrites.
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

    return await httpClient.get<FileTreeResponse>(
      `${this.BASE_URL}/${projectId}/files/tree?${searchParams.toString()}`
    );
  }

  /**
   * Загрузка дочерних элементов папки
   */
  static async getChildren(projectId: string, folderPath: string): Promise<FileTreeResponse> {
    return await httpClient.get<FileTreeResponse>(
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

    return await httpClient.get<FileContent>(
      `${this.BASE_URL}/${projectId}/files/content?${searchParams.toString()}`
    );
  }

  /**
   * Сохранение содержимого файла
   */
  static async saveFile(projectId: string, params: SaveFileParams): Promise<FileContent> {
    return await httpClient.put<FileContent>(
      `${this.BASE_URL}/${projectId}/files/content`,
      { body: JSON.stringify(params) } as HttpRequestOptions
    );
  }

  /**
   * Создание файла
   */
  static async createFile(projectId: string, params: CreateFileParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/create-file`, { body: JSON.stringify(params) } as HttpRequestOptions);
  }

  /**
   * Создание папки
   */
  static async createDirectory(projectId: string, params: CreateDirectoryParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/create-directory`, { body: JSON.stringify(params) } as HttpRequestOptions);
  }

  /**
   * Удаление файла/папки
   */
  static async deleteFile(projectId: string, filePath: string): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${projectId}/files?filePath=${encodeURIComponent(filePath)}`);
  }

  /**
   * Перемещение файла/папки
   */
  static async moveFile(projectId: string, params: MoveFileParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/move`, { body: JSON.stringify(params) } as HttpRequestOptions);
  }

  /**
   * Копирование файла/папки
   */
  static async copyFile(projectId: string, params: CopyFileParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/copy`, { body: JSON.stringify(params) } as HttpRequestOptions);
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

    return await httpClient.get<FileHistoryResponse>(
      `${this.BASE_URL}/${projectId}/files/history?${searchParams.toString()}`
    );
  }

  /**
   * Восстановление версии файла
   */
  static async restoreVersion(projectId: string, params: RestoreVersionParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/restore-version`, { body: JSON.stringify(params) } as HttpRequestOptions);
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
    return await httpClient.post(
      `${this.BASE_URL}/${projectId}/files/compare-versions`,
      { body: JSON.stringify(params) } as HttpRequestOptions
    );
  }

  /**
   * Сохранение черновика
   */
  static async saveDraft(projectId: string, params: SaveDraftParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/draft`, { body: JSON.stringify(params) } as HttpRequestOptions);
  }

  /**
   * Получение списка черновиков
   */
  static async getDrafts(projectId: string): Promise<DraftsResponse> {
    return await httpClient.get<DraftsResponse>(`${this.BASE_URL}/${projectId}/files/drafts`);
  }

  /**
   * Восстановление черновика
   */
  static async restoreDraft(projectId: string, params: RestoreDraftParams): Promise<void> {
    await httpClient.post(`${this.BASE_URL}/${projectId}/files/restore-draft`, { body: JSON.stringify(params) } as HttpRequestOptions);
  }
}
