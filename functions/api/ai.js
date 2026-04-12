export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const ANTHROPIC_API_KEY = context.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY não configurada" }, 500);
    }

    // ── Modo 1: { prompt } — orçamentos, TR, lançamento por texto ──
    if (body.prompt && !body.messages) {
      const prompt = String(body.prompt).trim();
      if (!prompt) return json({ error: "Prompt não enviado" }, 400);

      const model  = body.model  || 'claude-sonnet-4-20250514';
      const maxTok = body.max_tokens || 3000;
      const system = body.system || 'Você é um assistente especializado em obras e reformas no Brasil.';

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTok,
          system,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await res.json();
      if (!res.ok) return json({ error: 'Erro Anthropic', detalhes: data }, res.status);

      const text = data?.content?.[0]?.text ?? '';
      return json({ resposta: text, content: data.content });
    }

    // ── Modo 2: { messages } — imagens, multi-turn, lançamento por foto ──
    if (body.messages) {
      const model  = body.model  || 'claude-haiku-4-5-20251001';
      const maxTok = body.max_tokens || 1024;

      const reqBody = { model, max_tokens: maxTok, messages: body.messages };
      if (body.system) reqBody.system = body.system;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(reqBody)
      });

      const data = await res.json();
      if (!res.ok) return json({ error: 'Erro Anthropic', detalhes: data }, res.status);

      const text = data?.content?.[0]?.text ?? '';
      return json({ resposta: text, content: data.content });
    }

    return json({ error: "Formato inválido. Envie { prompt } ou { messages }" }, 400);

  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro interno", detalhe: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
