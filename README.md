# itmo-handlebars

Учебный Node.js CLI-инструмент для генерации HTML или текста из Handlebars-шаблона и JSON-контекста.

Проект подготовлен для магистерского задания по направлению "Веб-Технологии": анализ генерации инструмента для прогона данных через шаблоны Handlebars с помощью Codex.

## Установка

```bash
npm install
```

## Запуск примера

Вывести результат в stdout:

```bash
npm run render:example
```

Записать результат в файл:

```bash
node bin/hbs-runner.js --template templates/example.hbs --context data/context.json --out dist/example.html
```

## Запуск тестов

```bash
npm test
```

## CLI-аргументы

| Аргумент | Обязательный | Описание |
| --- | --- | --- |
| `--template <path>` | да | Путь к Handlebars-шаблону `.hbs`. |
| `--context <path>` | да | Путь к JSON-файлу с данными. |
| `--out <path>` | нет | Путь для записи результата. Если не указан, результат выводится в stdout. |

## Обработка ошибок

CLI сообщает об ошибке и завершает работу с ненулевым кодом, если:

- не переданы обязательные аргументы;
- файл шаблона не найден;
- файл JSON-контекста не найден;
- JSON невалидный;
- Handlebars не смог скомпилировать или отрендерить шаблон.

Демонстрация ошибки JSON:

```bash
node bin/hbs-runner.js --template templates/example.hbs --context data/broken-context.json
```

## Пример входных данных

Шаблон `templates/example.hbs` использует вложенные поля и `each`-блок:

```hbs
<h1>{{page.title}}</h1>
<p>Автор: {{author.name}}, {{author.group}}</p>
<ul>
  {{#each topics}}
    <li>{{this}}</li>
  {{/each}}
</ul>
```

Контекст `data/context.json`:

```json
{
  "page": {
    "title": "Демонстрация Handlebars CLI"
  },
  "author": {
    "name": "Студент магистратуры",
    "group": "Веб-Технологии"
  },
  "topics": [
    "шаблон Handlebars",
    "JSON-контекст",
    "генерация HTML"
  ]
}
```

Фрагмент результата:

```html
<h1>Демонстрация Handlebars CLI</h1>
<p>Автор: Студент магистратуры, Веб-Технологии</p>
```
