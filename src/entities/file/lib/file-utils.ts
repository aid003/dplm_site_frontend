import { FileTreeItem } from '../model/types';

/**
 * Получение расширения файла из имени
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Получение MIME типа по расширению файла
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);

  const mimeTypes: Record<string, string> = {
    // Текстовые файлы
    'txt': 'text/plain',
    'md': 'text/markdown',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'scss': 'text/scss',
    'sass': 'text/sass',
    'less': 'text/less',
    'js': 'application/javascript',
    'jsx': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'mjs': 'application/javascript',
    'cjs': 'application/javascript',

    // Языки программирования
    'py': 'text/x-python',
    'java': 'text/x-java-source',
    'c': 'text/x-c',
    'cpp': 'text/x-c++',
    'cc': 'text/x-c++',
    'cxx': 'text/x-c++',
    'h': 'text/x-c',
    'hpp': 'text/x-c++',
    'cs': 'text/x-csharp',
    'php': 'application/x-php',
    'rb': 'text/x-ruby',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'swift': 'text/x-swift',
    'kt': 'text/x-kotlin',
    'scala': 'text/x-scala',
    'clj': 'text/x-clojure',
    'cljs': 'text/x-clojure',
    'elm': 'text/x-elm',
    'ex': 'text/x-elixir',
    'exs': 'text/x-elixir',
    'dart': 'application/vnd.dart',
    'lua': 'text/x-lua',
    'pl': 'text/x-perl',
    'pm': 'text/x-perl',
    'r': 'text/x-r',
    'sh': 'application/x-shell',
    'bash': 'application/x-shell',
    'zsh': 'application/x-shell',
    'fish': 'application/x-shell',
    'ps1': 'application/x-powershell',
    'bat': 'application/x-batch',
    'cmd': 'application/x-batch',

    // Разметка и конфигурация
    'yaml': 'application/x-yaml',
    'yml': 'application/x-yaml',
    'toml': 'application/toml',
    'ini': 'text/plain',
    'cfg': 'text/plain',
    'conf': 'text/plain',

    // Документы
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Изображения
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',

    // Аудио
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4',

    // Видео
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',

    // Архивы
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'bz2': 'application/x-bzip2',
    'xz': 'application/x-xz',

    // Другие
    'rtf': 'application/rtf',
    'csv': 'text/csv',
    'tsv': 'text/tab-separated-values',
    'log': 'text/plain',
    'sqlite': 'application/x-sqlite3',
    'db': 'application/x-sqlite3',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Получение языка для синтаксической подсветки Monaco Editor
 */
export function getMonacoLanguage(filename: string): string {
  const ext = getFileExtension(filename);

  const languageMap: Record<string, string> = {
    // Web
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',

    // Системные языки
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'clj': 'clojure',
    'cljs': 'clojure',
    'elm': 'elm',
    'ex': 'elixir',
    'exs': 'elixir',
    'dart': 'dart',
    'lua': 'lua',
    'pl': 'perl',
    'pm': 'perl',
    'r': 'r',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',

    // Разметка и данные
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'md': 'markdown',
    'txt': 'plaintext',
    'log': 'log',

    // Другие
    'sql': 'sql',
    'graphql': 'graphql',
    'gql': 'graphql',
  };

  return languageMap[ext] || 'plaintext';
}

/**
 * Получение иконки для типа файла
 */
export function getFileIcon(type: 'FILE' | 'DIRECTORY', filename?: string): string {
  if (type === 'DIRECTORY') {
    return '📁';
  }

  const ext = filename ? getFileExtension(filename) : '';

  const iconMap: Record<string, string> = {
    // Изображения
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'webp': '🖼️',
    'bmp': '🖼️',
    'ico': '🖼️',

    // Документы
    'pdf': '📄',
    'doc': '📄',
    'docx': '📄',
    'txt': '📄',
    'md': '📄',

    // Код
    'js': '📜',
    'jsx': '📜',
    'ts': '📜',
    'tsx': '📜',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'less': '🎨',
    'json': '⚙️',
    'xml': '⚙️',
    'yaml': '⚙️',
    'yml': '⚙️',
    'py': '🐍',
    'java': '☕',
    'c': '⚙️',
    'cpp': '⚙️',
    'cs': '⚙️',
    'php': '🐘',
    'rb': '💎',
    'go': '🐹',
    'rs': '🦀',
    'swift': '🐦',
    'kt': '🤖',

    // Архивы
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'tar': '📦',
    'gz': '📦',

    // Аудио
    'mp3': '🎵',
    'wav': '🎵',
    'ogg': '🎵',
    'flac': '🎵',

    // Видео
    'mp4': '🎥',
    'avi': '🎥',
    'mov': '🎥',
    'webm': '🎥',
  };

  return iconMap[ext] || '📄';
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Получение родительского пути
 */
export function getParentPath(filePath: string): string {
  const parts = filePath.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
}

/**
 * Получение полного пути из частей
 */
export function joinPaths(...parts: string[]): string {
  return parts.filter(Boolean).join('/');
}

/**
 * Нормализация пути
 */
export function normalizePath(path: string): string {
  return path.replace(/\/+/g, '/').replace(/\/$/, '');
}

/**
 * Рекурсивное обновление дерева файлов
 */
export function updateFileTree(
  tree: FileTreeItem[],
  path: string,
  updater: (item: FileTreeItem) => FileTreeItem
): FileTreeItem[] {
  return tree.map(item => {
    if (item.path === path) {
      return updater(item);
    }

    if (item.children && item.type === 'DIRECTORY') {
      return {
        ...item,
        children: updateFileTree(item.children, path, updater),
      };
    }

    return item;
  });
}

/**
 * Поиск файла в дереве по пути
 */
export function findFileInTree(tree: FileTreeItem[], path: string): FileTreeItem | null {
  for (const item of tree) {
    if (item.path === path) {
      return item;
    }

    if (item.children && item.type === 'DIRECTORY') {
      const found = findFileInTree(item.children, path);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Получение всех путей файлов в дереве
 */
export function getAllFilePaths(tree: FileTreeItem[]): string[] {
  const paths: string[] = [];

  const traverse = (items: FileTreeItem[]) => {
    for (const item of items) {
      paths.push(item.path);

      if (item.children && item.type === 'DIRECTORY') {
        traverse(item.children);
      }
    }
  };

  traverse(tree);
  return paths;
}
