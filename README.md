# itmo-handlebars

Учебный проект для рендеринга Handlebars-шаблонов из JSON-контекста.

Сейчас проект включает:
- CLI-инструмент;
- HTTP-сервер;
- веб-песочницу на React (JSX) для ручной проверки шаблонов.

## Установка

```bash
npm install
```

## Быстрый старт

Запуск примера CLI:

```bash
npm run render:example
```

Запуск веб-песочницы:

```bash
npm run sandbox
```

После запуска откройте:

`http://127.0.0.1:3000`

## Скрипты

- `npm test` — запуск тестов Vitest.
- `npm run render:example` — рендер примера из `templates/example.hbs` и `data/context.json`.
- `npm run sandbox` — запуск HTTP-сервера с веб-интерфейсом.

## CLI

Точка входа: `bin/hbs-runner.js`

Аргументы:

| Аргумент | Обязательный | Описание |
| --- | --- | --- |
| `--template <path>` | да | Путь к `.hbs` шаблону. |
| `--context <path>` | да | Путь к `.json` файлу с контекстом. |
| `--out <path>` | нет | Путь для записи результата (если не указан, вывод в stdout). |

Пример:

```bash
node bin/hbs-runner.js --template templates/example.hbs --context data/context.json --out dist/example.html
```

## Веб-песочница

Бэкенд:
- `GET /` — страница песочницы;
- `POST /api/render` — рендер шаблона.

Тело запроса `POST /api/render`:

```json
{
  "template": "Hello, {{name}}!",
  "context": "{\"name\":\"ITMO\"}"
}
```

Ответ:

```json
{
  "output": "Hello, ITMO!"
}
```

При ошибках возвращается JSON с полем `error` и кодом `400`/`500`.

## Структура проекта

- `src/renderer.js` — общая логика рендера и CLI-вспомогательные функции.
- `src/server.js` — HTTP-сервер и API.
- `public/index.html` — HTML-оболочка фронтенда.
- `public/app.jsx` — React-компонент песочницы.
- `public/styles.css` — стили интерфейса.
- `bin/hbs-runner.js` — CLI-обертка.
- `test/renderer.test.mjs` — тесты рендера.
