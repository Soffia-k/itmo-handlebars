const form = document.getElementById('render-form');
const output = document.getElementById('output');
const errorNode = document.getElementById('error');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  output.textContent = '';
  errorNode.textContent = '';

  const template = document.getElementById('template').value;
  const context = document.getElementById('context').value;

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

    output.textContent = payload.output;
  } catch (error) {
    errorNode.textContent = error.message;
  }
});
