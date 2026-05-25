const { useState } = React;

function SandboxApp() {
  const [template, setTemplate] = useState('{{greeting}}, {{user.name}}!');
  const [context, setContext] = useState('{\n  "greeting": "Привет",\n  "user": {\n    "name": "ИТМО"\n  }\n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setOutput('');
    setError('');

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template, context })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Request failed.');
      }

      setOutput(payload.output);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="layout">
      <h1>Handlebars Sandbox</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="template">Шаблон Handlebars</label>
        <textarea
          id="template"
          name="template"
          spellCheck="false"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
        />

        <label htmlFor="context">JSON контекст</label>
        <textarea
          id="context"
          name="context"
          spellCheck="false"
          value={context}
          onChange={(event) => setContext(event.target.value)}
        />

        <button type="submit">Отправить на бэк</button>
      </form>

      <section>
        <h2>Результат</h2>
        <pre>{output}</pre>
      </section>
      <p className="error">{error}</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SandboxApp />);
