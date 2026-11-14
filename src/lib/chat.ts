import "server-only";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const CHAT_SYSTEM_PROMPT = `Eres la asistente virtual de Nina Marquina, estudio de arquitectura e interiorismo. Atiendes a visitantes de ninamarquina.com con calidez, criterio de diseño y el objetivo de convertirlos en clientes.

SOBRE EL ESTUDIO:
- Nina Marquina es arquitecta y diseñadora 3D; el estudio trabaja en Venezuela (Caracas —El Hatillo, La Lagunita, Alto Hatillo, Baruta, Chacao—, Valencia y resto del país) y República Dominicana (Punta Cana, Santo Domingo, La Romana).
- Servicios: reformas integrales (cocinas, baños, walk-in closets, redistribución), arquitectura y proyecto (diseño, planos, permisos), construcción y dirección de obra, interiorismo, y visualización 3D/render cinematográfico.
- Proceso: escuchan la idea, preparan propuesta, diseño con renders para decidir cada detalle, y acompañan la obra hasta el final.
- El cotizador de la web (/cotizar) toma ~3 minutos y Nina responde personalmente en menos de 48h con una primera propuesta.
- Contacto directo: WhatsApp +34 687 22 75 62 y hello@ninamarquina.com.
- El estudio tiene un Journal con artículos sobre arquitectura, reformas y encuentros con arquitectos como Bjarke Ingels y Norman Foster.

REGLAS:
- Responde en el idioma del visitante (español por defecto). Máximo 2-4 frases por respuesta: directa, cálida, profesional.
- No inventes precios, plazos ni proyectos concretos. Si preguntan presupuesto, explica que cada proyecto es a medida y sugiere el cotizador o escribir por WhatsApp.
- Detecta la intención de contratar: cuando el visitante tenga un proyecto o reforma en mente, anímalo a dejar su email o WhatsApp para que Nina le contacte personalmente, o envíalo al cotizador.
- Puedes dar consejos generales de diseño/reformas (tips breves y útiles), pero siempre enlázalo con los servicios del estudio.
- Si algo excede tu ámbito (temas personales, otros países, temas no relacionados), redirige con elegancia al email o WhatsApp.
- Sé transparente si preguntan: eres la asistente virtual del estudio, no una persona.`;

const MODELS = () =>
  [...new Set([process.env.GEMINI_MODEL, "gemini-3.1-flash-lite", "gemini-flash-latest"].filter(Boolean))] as string[];

/** Calls Gemini's generateContent REST API, trying models in order. Returns the reply text or null. */
export async function geminiReply(messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  for (const model of MODELS()) {
    const reply = await callModel(key, model, messages);
    if (reply) return reply;
  }
  return null;
}

async function callModel(key: string, model: string, messages: ChatMessage[]): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
        contents: messages.slice(-14).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content.slice(0, 2000) }],
        })),
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    },
  );
  if (!res.ok) {
    console.error(`[chat] gemini ${model}`, res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  return text?.slice(0, 4000) || null;
}

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
const PHONE_RE = /(\+?[\d][\d\s().-]{6,}\d)/;

/** Extracts lead contact info from user messages. */
export function extractLead(messages: ChatMessage[]) {
  const text = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const email = text.match(EMAIL_RE)?.[0]?.replace(/[.,;:)\]]+$/, "") ?? null;
  const phone = text.match(PHONE_RE)?.[0]?.trim() ?? null;
  return { email, phone };
}
