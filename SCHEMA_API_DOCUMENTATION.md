# Схема данных и API для веб-редактора кода

## Схема данных для файлов и папок проекта

### 1. Основная структура файла/папки (FileTreeItem)

```typescript
interface FileTreeItem {
  id: string;                    // Уникальный идентификатор
  path: string;                  // Полный путь к файлу/папке
  name: string;                  // Имя файла/папки
  type: 'FILE' | 'DIRECTORY';   // Тип элемента
  size: number;                  // Размер в байтах
  mimeType?: string;             // MIME-тип файла
  permissions: 'READ_ONLY' | 'READ_WRITE'; // Права доступа
  createdAt: string;             // Дата создания (ISO string)
  updatedAt: string;             // Дата последнего изменения (ISO string)
  childrenCount?: number;        // Количество дочерних элементов для папок
  children?: FileTreeItem[];     // Дочерние элементы (для ленивой загрузки)
  hasChildren?: boolean;         // Есть ли дочерние элементы
  expanded?: boolean;            // Развернута ли папка
}
```

### 2. Содержимое файла (FileContent)

```typescript
interface FileContent {
  id: string;                    // Уникальный идентификатор
  path: string;                  // Путь к файлу
  name: string;                  // Имя файла
  content: string;               // Содержимое файла
  size: number;                  // Размер в байтах
  mimeType?: string;             // MIME-тип
  encoding: string;              // Кодировка (utf8, utf16, ascii, latin1)
  permissions: string;           // Права доступа
  createdAt: string;             // Дата создания
  updatedAt: string;             // Дата последнего изменения
  etag: string;                  // ETag для кэширования
  
  // Пагинация для больших файлов
  pagination?: {
    startLine: number;           // Начальная строка
    endLine: number;             // Конечная строка
    totalLines: number;           // Общее количество строк
    hasMore: boolean;             // Есть ли еще данные
    currentPageSize: number;      // Размер текущей страницы
  };
  
  // Предупреждения для больших файлов
  warnings?: {
    largeFile: boolean;           // Большой файл
    performanceWarning?: string; // Предупреждение о производительности
    recommendedPageSize?: number; // Рекомендуемый размер страницы
  };
}
```

### 3. Версии файлов (FileVersion)

```typescript
interface FileVersion {
  id: string;                    // ID версии
  fileId: string;                // ID файла
  content: string;               // Содержимое версии
  size: number;                  // Размер версии
  authorId?: string;             // ID автора изменений
  authorName?: string;           // Имя автора
  createdAt: string;             // Дата создания версии
  message?: string;              // Сообщение коммита
}
```

### 4. Черновики (Draft)

```typescript
interface Draft {
  id: string;                    // ID черновика
  fileId: string;                // ID файла
  filePath: string;              // Путь к файлу
  content: string;               // Содержимое черновика
  encoding: string;              // Кодировка
  createdAt: string;             // Дата создания
  updatedAt: string;             // Дата последнего обновления
}
```

### 5. Структура проекта

```typescript
interface Project {
  id: string;                    // Уникальный ID проекта
  name: string;                  // Название проекта
  description?: string;          // Описание проекта
  projectFile?: string;          // URL загруженного файла или имя файла
  createdAt: string;             // Дата создания
  updatedAt: string;             // Дата последнего обновления
  status: 'active' | 'archived' | 'deleted'; // Статус проекта
}
```

## API эндпоинты для работы с файлами

### 1. Получение дерева файлов

```
GET /projects/{projectId}/files/tree?path={folderPath}&includeSystemFiles={boolean}&search={query}&lazy={boolean}&loadChildren={boolean}

Ответ:
{
  "items": FileTreeItem[],
  "total": number
}
```

### 2. Получение содержимого файла

```
GET /projects/{projectId}/files/content?filePath={path}&encoding={utf8}&startLine={number}&endLine={number}&maxLines={number}

Ответ: FileContent
```

### 3. Сохранение файла

```
PUT /projects/{projectId}/files/content

Тело запроса:
{
  "filePath": string,
  "content": string,
  "encoding": string,
  "lastModified": string,
  "message": string
}

Ответ: FileContent
```

### 4. Создание файла

```
POST /projects/{projectId}/files/create-file

Тело запроса:
{
  "filePath": string,
  "name": string,
  "content": string
}
```

### 5. Создание папки

```
POST /projects/{projectId}/files/create-directory

Тело запроса:
{
  "filePath": string,
  "name": string
}
```

### 6. Удаление файла/папки

```
DELETE /projects/{projectId}/files?filePath={path}
```

### 7. Перемещение файла/папки

```
POST /projects/{projectId}/files/move

Тело запроса:
{
  "sourcePath": string,
  "targetPath": string
}
```

### 8. Копирование файла/папки

```
POST /projects/{projectId}/files/copy

Тело запроса:
{
  "sourcePath": string,
  "targetPath": string
}
```

### 9. Получение истории изменений

```
GET /projects/{projectId}/files/history?filePath={path}&limit={number}&offset={number}

Ответ:
{
  "versions": FileVersion[],
  "total": number,
  "hasMore": boolean
}
```

### 10. Сохранение черновика

```
POST /projects/{projectId}/files/draft

Тело запроса:
{
  "filePath": string,
  "content": string,
  "encoding": string
}
```

### 11. Получение черновиков

```
GET /projects/{projectId}/files/drafts

Ответ:
{
  "drafts": Draft[],
  "total": number
}
```

### 12. Восстановление версии файла

```
POST /projects/{projectId}/files/restore-version

Тело запроса:
{
  "filePath": string,
  "versionId": string
}
```

### 13. Сравнение версий

```
POST /projects/{projectId}/files/compare-versions

Тело запроса:
{
  "filePath": string,
  "versionId1": string,
  "versionId2": string
}

Ответ:
{
  "version1": FileVersion,
  "version2": FileVersion,
  "diff": string,
  "changes": {
    "added": number,
    "removed": number,
    "modified": number
  }
}
```

### 14. Восстановление черновика

```
POST /projects/{projectId}/files/restore-draft

Тело запроса:
{
  "filePath": string,
  "draftId": string
}
```

### 15. Загрузка дочерних элементов папки

```
GET /projects/{projectId}/files/tree/children?path={folderPath}

Ответ:
{
  "items": FileTreeItem[],
  "total": number
}
```

## API эндпоинты для работы с проектами

### 1. Получение списка проектов

```
GET /projects?search={query}&status={status}&limit={limit}&offset={offset}

Ответ:
{
  "projects": Project[],
  "total": number,
  "hasMore": boolean
}
```

### 2. Получение проекта по ID

```
GET /projects/{id}

Ответ:
{
  "project": Project
}
```

### 3. Создание проекта

```
POST /projects
Content-Type: multipart/form-data

Поля формы:
- name: string (обязательно)
- description: string (необязательно)
- projectFile: File (обязательно, .zip/.rar, макс. 100MB)

Ответ:
{
  "project": Project
}
```

### 4. Обновление проекта

```
PATCH /projects/{id}
Content-Type: multipart/form-data

Поля формы:
- name: string (необязательно)
- description: string (необязательно)
- projectFile: File (необязательно, .zip/.rar, макс. 100MB)

Ответ:
{
  "project": Project
}
```

### 5. Удаление проекта

```
DELETE /projects/{id}

Ответ: 204 No Content
```

### 6. Архивирование проекта

```
POST /projects/{id}/archive

Ответ:
{
  "project": Project
}
```

### 7. Восстановление проекта

```
POST /projects/{id}/restore

Ответ:
{
  "project": Project
}
```

## WebSocket сообщения для real-time обновлений

### Исходящие сообщения (от клиента)

```typescript
// Открытие файла
{
  "type": "file_opened",
  "filePath": string
}

// Закрытие файла
{
  "type": "file_closed", 
  "filePath": string
}

// Изменение содержимого
{
  "type": "content_changed",
  "filePath": string,
  "content": string
}

// Перемещение курсора
{
  "type": "cursor_moved",
  "filePath": string,
  "cursor": {
    "line": number,
    "column": number,
    "selectionStart": number,
    "selectionEnd": number
  }
}
```

### Входящие сообщения (от сервера)

```typescript
// Файл изменен другим пользователем
{
  "type": "file_modified",
  "filePath": string,
  "userId": number,
  "timestamp": string
}

// Пользователь присоединился
{
  "type": "user_joined",
  "userId": string,
  "userName": string,
  "userEmail": string,
  "timestamp": string
}

// Пользователь покинул проект
{
  "type": "user_left",
  "userId": string,
  "timestamp": string
}

// Список активных пользователей
{
  "type": "active_users",
  "users": Array<{
    "userId": string,
    "userName": string,
    "userEmail": string,
    "filePath": string,
    "cursor": {
      "line": number,
      "column": number,
      "selectionStart": number,
      "selectionEnd": number
    },
    "lastSeen": string
  }>
}
```

## Параметры запросов

### FileTreeParams

```typescript
interface FileTreeParams {
  path?: string;                 // Путь к папке для получения структуры
  includeSystemFiles?: boolean;  // Включать системные файлы (.git, node_modules)
  search?: string;               // Поиск по именам файлов и папок
  lazy?: boolean;                // Ленивая загрузка
  loadChildren?: boolean;        // Загружать дочерние элементы
}
```

### FileContentParams

```typescript
interface FileContentParams {
  filePath: string;              // Путь к файлу
  encoding?: 'utf8' | 'utf16' | 'ascii' | 'latin1'; // Кодировка
  startLine?: number;            // Начальная строка для пагинации
  endLine?: number;              // Конечная строка для пагинации
  maxLines?: number;             // Максимальное количество строк
}
```

### FileHistoryParams

```typescript
interface FileHistoryParams {
  filePath: string;              // Путь к файлу
  limit?: number;                 // Количество версий
  offset?: number;                // Смещение для пагинации
}
```

### CreateFileParams

```typescript
interface CreateFileParams {
  filePath: string;              // Путь к родительской папке
  name: string;                  // Имя файла
  content?: string;               // Начальное содержимое
}
```

### CreateDirectoryParams

```typescript
interface CreateDirectoryParams {
  filePath: string;              // Путь к родительской папке
  name: string;                  // Имя папки
}
```

### MoveFileParams

```typescript
interface MoveFileParams {
  sourcePath: string;            // Исходный путь
  targetPath: string;            // Целевой путь
}
```

### CopyFileParams

```typescript
interface CopyFileParams {
  sourcePath: string;            // Исходный путь
  targetPath: string;            // Целевой путь
}
```

### SaveFileParams

```typescript
interface SaveFileParams {
  filePath: string;              // Путь к файлу
  content: string;               // Содержимое файла
  encoding?: string;             // Кодировка
  lastModified?: string;         // Временная метка последнего изменения
  message?: string;              // Сообщение коммита
}
```

### SaveDraftParams

```typescript
interface SaveDraftParams {
  filePath: string;              // Путь к файлу
  content: string;               // Содержимое черновика
  encoding?: string;             // Кодировка
}
```

### RestoreVersionParams

```typescript
interface RestoreVersionParams {
  filePath: string;              // Путь к файлу
  versionId: string;             // ID версии для восстановления
}
```

### RestoreDraftParams

```typescript
interface RestoreDraftParams {
  filePath: string;              // Путь к файлу
  draftId: string;               // ID черновика для восстановления
}
```

### CompareVersionsParams

```typescript
interface CompareVersionsParams {
  filePath: string;              // Путь к файлу
  versionId1: string;            // ID первой версии
  versionId2: string;            // ID второй версии
}
```

## Особенности реализации

### 1. Ленивая загрузка
- Папки загружаются по требованию при раскрытии
- Параметр `lazy: true` включает ленивую загрузку
- `hasChildren` показывает, есть ли дочерние элементы
- `childrenCount` показывает количество дочерних элементов

### 2. Пагинация больших файлов
- Поддержка `startLine`, `endLine`, `maxLines` для больших файлов
- Предупреждения о производительности для файлов > 1MB
- Рекомендации по размеру страницы для оптимальной производительности

### 3. Система версионирования
- История изменений каждого файла
- Возможность отката к предыдущей версии
- Сравнение версий (diff)
- Информация об авторе изменений

### 4. Автосохранение и черновики
- Автосохранение каждые 2 секунды в черновики
- Ручное сохранение создает новую версию в истории
- Восстановление черновиков при повторном открытии файла
- Индикатор несохраненных изменений

### 5. Совместное редактирование
- WebSocket для real-time обновлений
- Показ курсоров других пользователей
- Уведомления об активности пользователей
- Синхронизация изменений между пользователями

### 6. Безопасность
- Проверка прав доступа к файлам
- Валидация путей (предотвращение directory traversal атак)
- Ограничение типов редактируемых файлов
- Санитизация пользовательского ввода

### 7. Производительность
- Кэширование содержимого файлов
- Поддержка ETag для условных запросов
- Инвалидация кэша при изменениях
- Оптимизация для больших проектов

### 8. MIME-типы и языки
- Автоматическое определение MIME-типа по расширению
- Поддержка различных языков программирования
- Определение языка для синтаксической подсветки Monaco Editor
- Иконки для различных типов файлов

## Коды ответов HTTP

- `200` - Успешный запрос
- `201` - Ресурс создан
- `204` - Успешный запрос без содержимого
- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `409` - Конфликт (файл изменен другим пользователем)
- `413` - Файл слишком большой
- `415` - Неподдерживаемый тип файла
- `500` - Внутренняя ошибка сервера

## Формат ошибок

```json
{
  "message": "Описание ошибки",
  "errors": {
    "field": ["Сообщение об ошибке"]
  }
}
```

## WebSocket подключение

### URL подключения
```
ws://backend-domain/projects?projectId={projectId}
```

### События Socket.IO
- `connect` - успешное подключение
- `disconnect` - отключение
- `connect_error` - ошибка подключения
- `reconnect` - переподключение
- `active_users` - список активных пользователей
- `user_joined` - пользователь присоединился
- `user_left` - пользователь покинул проект
- `file_opened` - файл открыт
- `file_closed` - файл закрыт
- `cursor_moved` - перемещение курсора
- `content_changed` - изменение содержимого
- `file_modified` - файл изменен

## Переменные окружения

```env
NEXT_PUBLIC_API_URL=http://your-backend-domain.com/api
NEXT_PUBLIC_WS_URL=ws://your-backend-domain.com
```

## Аутентификация

### Сессионные куки
- Имя куки: `dplm_session`
- Проверка в middleware для защищенных маршрутов
- Редирект на `/auth/login` при отсутствии сессии

### Заголовки запросов
- `Authorization: Bearer {token}` (если используется JWT)
- `Cookie: dplm_session={session_id}` (для сессионной аутентификации)

## CORS настройки

```javascript
{
  "origin": "http://frontend-domain.com",
  "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
  "headers": ["Content-Type", "Authorization"],
  "credentials": true
}
```

## Логирование и мониторинг

### Рекомендуемые метрики
- Время загрузки файлов
- Количество активных пользователей
- Частота сохранений
- Ошибки WebSocket подключений
- Производительность операций с файлами

### Логирование
- Все операции с файлами
- WebSocket события
- Ошибки аутентификации
- Производительность API

Эта документация содержит полную схему данных и API для реализации веб-редактора кода с поддержкой совместного редактирования, версионирования и автосохранения.
