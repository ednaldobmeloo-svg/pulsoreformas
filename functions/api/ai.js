export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt não enviado" }), {
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
            content: "Você é um assistente objetivo, claro e direto."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const resposta =
      data?.choices?.[0]?.message?.content || "Sem resposta";

    return new Response(
      JSON.stringify({ resposta }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Erro ao processar IA",
        detalhe: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
