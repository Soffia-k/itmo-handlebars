const { useState, useEffect } = React;

function SandboxApp() {
  const [template, setTemplate] = useState('{{greeting}}, {{user.name}}!');
  const [context, setContext] = useState('{\n  "greeting": "Привет",\n  "user": {\n    "name": "ИТМО"\n  }\n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [engine, setEngine] = useState('handlebars');
  const [availableEngines, setAvailableEngines] = useState(['handlebars']);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renderTime, setRenderTime] = useState(null);

  // Загрузка списка доступных движков при старте
  useEffect(() => {
    fetch('/api/engines')
      .then(res => res.json())
      .then(data => {
        if (data.engines) {
          setAvailableEngines(data.engines);
        }
      })
      .catch(err => console.error('Failed to load engines:', err));
  }, []);

  // Смена шаблона при выборе другого движка
  useEffect(() => {
    const examples = {
      handlebars: '{{greeting}}, {{user.name}}!\n\n{{#each items}}\n  - {{this}}\n{{/each}}',
      pug: 'h1= greeting\np Hello, #{user.name}\n\nif items\n  ul\n    each item in items\n      li= item',
      nunjucks: '{{ greeting }}, {{ user.name }}!\n\n{% for item in items %}\n  - {{ item }}\n{% endfor %}',
      jinja2: '{{ greeting }}, {{ user.name }}!\n\n{% for item in items %}\n  - {{ item }}\n{% endfor %}'
    };
    
    if (examples[engine]) {
      setTemplate(examples[engine]);
    }
    
    // Сбрасываем время при смене движка
    setRenderTime(null);
    setOutput('');
  }, [engine]);

  async function handleSubmit(event) {
    event.preventDefault();
    setOutput('');
    setError('');
    setRenderTime(null);
    setIsLoading(true);
    
    // Замеряем время начала запроса
    const startTime = performance.now();

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template, context, engine })
      });

      const payload = await response.json();
      
      // Замеряем время окончания
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration.toFixed(2));

      if (!response.ok) {
        throw new Error(payload.error || 'Request failed.');
      }

      setOutput(payload.output);
    } catch (requestError) {
      setError(requestError.message);
      setRenderTime(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyToClipboard() {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback для старых браузеров
      const textarea = document.createElement('textarea');
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function getEngineSyntax(engineName) {
    const syntax = {
      handlebars: '{{variable}} | {{#each}} {{/each}}',
      pug: 'h1= variable | each item in items',
      nunjucks: '{{ variable }} | {% for item in items %}',
      jinja2: '{{ variable }} | {% for item in items %}'
    };
    return syntax[engineName] || '{{ variable }}';
  }

  // Функция для получения цвета времени выполнения
  function getRenderTimeColor(time) {
    if (!time) return '#2d2d2d';
    const numTime = parseFloat(time);
    if (numTime < 10) return '#51cf66';
    if (numTime < 50) return '#feca57';
    return '#ff6b6b';
  }

  return (
    <main className="layout">
      <h1>Template Sandbox</h1>
      
      <div className="engine-selector">
        <label htmlFor="engine">Шаблонизатор:</label>
        <select 
          id="engine" 
          value={engine} 
          onChange={(e) => setEngine(e.target.value)}
        >
          {availableEngines.map(eng => (
            <option key={eng} value={eng}>
              {eng.charAt(0).toUpperCase() + eng.slice(1)}
            </option>
          ))}
        </select>
        <span className="syntax-hint">{getEngineSyntax(engine)}</span>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="template">
          Шаблон ({engine})
          <button 
            type="button" 
            className="reset-btn"
            onClick={() => setTemplate('')}
          >
            Очистить
          </button>
        </label>
        <textarea
          id="template"
          name="template"
          spellCheck="false"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          placeholder={`Введите шаблон на ${engine}...`}
        />

        <label htmlFor="context">JSON контекст</label>
        <textarea
          id="context"
          name="context"
          spellCheck="false"
          value={context}
          onChange={(event) => setContext(event.target.value)}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Рендеринг...' : 'Отрендерить'}
        </button>
      </form>

      {output && (
        <section>
          <div className="result-header">
            <h2>Результат</h2>
            <div className="result-actions">
              {renderTime && (
                <div className="render-time" style={{ color: getRenderTimeColor(renderTime) }}>
                  ⚡ {renderTime} мс
                </div>
              )}
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyToClipboard}
              >
                {copied ? '✓ Скопировано!' : '📋 Скопировать'}
              </button>
            </div>
          </div>
          <pre>{output}</pre>
        </section>
      )}
      
      {error && <p className="error">{error}</p>}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SandboxApp />);