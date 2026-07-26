const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
let client = null;

function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

async function generateAiReply(businessContext, incomingText) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system:
      `Sos quien responde los mensajes de WhatsApp de este negocio. Esta es la información sobre el negocio:\n\n${businessContext}\n\n` +
      'Respondé el mensaje del cliente en español, de forma breve y natural (2-4 líneas), como lo haría una persona real. ' +
      'No inventes datos que no estén en la información de arriba (precios, stock, horarios, etc.) — si no sabés algo, decí que confirman a la brevedad.',
    messages: [{ role: 'user', content: incomingText }],
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text?.trim() || null;
}

module.exports = { generateAiReply };
