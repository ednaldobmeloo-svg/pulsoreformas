export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt não enviado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const promptLimpo = String(prompt).trim();

    if (promptLimpo.length > 2000) {
      return new Response(JSON.stringify({
        error: "Prompt muito grande. Limite de 2000 caracteres."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${context.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um assistente objetivo, claro e direto. Gere respostas enxutas, práticas e bem estruturadas."
          },
          {
            role: "user",
            content: promptLimpo
          }
        ],
        temperature: 0.7,
        max_tokens: 700
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: "Erro da OpenAI",
        status: response.status,
        detalhes: data
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      resposta: data?.choices?.[0]?.message?.content ?? ""
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Erro interno",
      detalhe: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
    );
  }
}
