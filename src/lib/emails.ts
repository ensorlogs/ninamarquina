import "server-only";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { site } from "./site";

export type QuoteRow = {
  locale: string;
  service: string;
  property_type: string;
  property_status: string | null;
  area_m2: number | null;
  location: string;
  zone: string | null;
  needs: string[];
  description: string | null;
  budget: string;
  timeline: string;
  links: string[];
  files: string[];
  name: string;
  email: string;
  phone: string;
  contact_pref: string;
};

const C = {
  ivory: "#F7F4EE",
  sand: "#EFE9DF",
  stone: "#E4DCCF",
  charcoal: "#1A1A1A",
  muted: "#5E5851",
  clay: "#8C5A3F",
  espresso: "#1F1914",
};
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif";
const FONTS =
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function serviceImage(service: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/email-assets/services/${service}.jpg` : "";
}

function labels(locale: string) {
  const q = (locale === "en" ? en : es).quote;
  const o = q.options as Record<string, Record<string, string>>;
  const pick = (group: string, key: string | null | undefined) => (key ? (o[group]?.[key] ?? key) : "");
  return { q, pick };
}

const label = (text: string) =>
  `<div style="font-family:${SANS};font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:${C.muted};margin:0 0 6px">${text}</div>`;

function logo(color: string) {
  return `<div style="font-family:${SERIF};font-size:22px;letter-spacing:5px;color:${color};line-height:1">NINA MARQUINA</div>
  <div style="font-family:${SANS};font-size:8.5px;letter-spacing:3px;color:${color};opacity:.7;margin-top:6px">ARCHITECTURE &amp; INTERIORS</div>`;
}

function button(href: string, text: string, bg = C.charcoal) {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${C.ivory};font-family:${SANS};font-size:11px;letter-spacing:2.4px;text-transform:uppercase;text-decoration:none;padding:16px 28px">${text} &rarr;</a>`;
}

function layout({ preheader, hero, body, footerNote }: { preheader: string; hero: string; body: string; footerNote: string }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${FONTS}</head>
<body style="margin:0;padding:0;background:${C.sand}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand}"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.ivory}">
<tr><td style="padding:34px 40px 28px;border-bottom:1px solid ${C.stone}">${logo(C.charcoal)}</td></tr>
${hero}
<tr><td style="padding:36px 40px 44px;font-family:${SANS};font-size:14px;line-height:1.7;color:${C.charcoal}">${body}</td></tr>
<tr><td style="background:${C.espresso};padding:34px 40px">
  ${logo(C.ivory)}
  <div style="font-family:${SANS};font-size:12px;line-height:1.8;color:#cfc6ba;margin-top:22px">
    <a href="mailto:${site.email}" style="color:#cfc6ba;text-decoration:none">${site.email}</a> &nbsp;·&nbsp;
    <a href="${site.social.instagram}" style="color:#cfc6ba;text-decoration:none">Instagram</a> &nbsp;·&nbsp;
    <a href="${site.url}" style="color:#cfc6ba;text-decoration:none">${site.url.replace(/^https?:\/\//, "")}</a>
  </div>
  <div style="font-family:${SANS};font-size:9.5px;letter-spacing:2.4px;color:#8f857a;margin-top:10px">${site.locations.join(" · ").toUpperCase()}</div>
  <div style="font-family:${SANS};font-size:11px;color:#8f857a;margin-top:18px">${footerNote}</div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function heroImage(service: string, kicker: string, title: string) {
  const img = serviceImage(service);
  return `<tr><td style="padding:0">${
    img ? `<img src="${img}" width="600" alt="" style="display:block;width:100%;height:auto;max-height:300px;object-fit:cover;border:0">` : ""
  }</td></tr>
<tr><td style="padding:36px 40px 0">
  <div style="font-family:${SANS};font-size:10px;letter-spacing:2.6px;text-transform:uppercase;color:${C.clay}">${kicker}</div>
  <div style="font-family:${SERIF};font-size:36px;line-height:1.1;color:${C.charcoal};margin-top:12px">${title}</div>
</td></tr>`;
}

function section(title: string, rows: [string, string][]) {
  const r = rows.filter(([, v]) => v);
  if (!r.length) return "";
  return `<div style="font-family:${SERIF};font-size:21px;color:${C.charcoal};margin:30px 0 12px;padding-bottom:8px;border-bottom:1px solid ${C.stone}">${title}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${r
    .map(
      ([k, v]) =>
        `<tr><td valign="top" style="padding:7px 16px 7px 0;width:42%;font-family:${SANS};font-size:12px;color:${C.muted}">${k}</td><td valign="top" style="padding:7px 0;font-family:${SANS};font-size:14px;color:${C.charcoal}">${v}</td></tr>`,
    )
    .join("")}</table>`;
}

export function internalQuoteEmail(row: QuoteRow, id: string, fileUrls: { name: string; url: string }[]) {
  const { q, pick } = labels("es");
  const service = pick("service", row.service);
  const adminUrl = `${site.url}/admin/solicitudes/${id}`;
  const phoneDigits = row.phone.replace(/\D/g, "");
  const chips = row.needs
    .map(
      (n) =>
        `<span style="display:inline-block;border:1px solid ${C.stone};background:${C.sand};padding:5px 11px;margin:0 6px 6px 0;font-size:12px">${esc(pick("needs", n))}</span>`,
    )
    .join("");

  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand}"><tr><td style="padding:22px 24px">
  ${label("Cliente")}
  <div style="font-family:${SERIF};font-size:26px;line-height:1.15">${esc(row.name)}</div>
  <div style="margin-top:8px;font-size:13.5px">
    <a href="mailto:${esc(row.email)}" style="color:${C.clay};text-decoration:none">${esc(row.email)}</a> &nbsp;·&nbsp;
    <a href="tel:${esc(row.phone)}" style="color:${C.clay};text-decoration:none">${esc(row.phone)}</a>
  </div>
  <div style="margin-top:6px;font-size:12px;color:${C.muted}">Prefiere: <b>${esc(pick("contactPref", row.contact_pref))}</b> · Idioma: ${row.locale.toUpperCase()}</div>
  <div style="margin-top:16px">
    ${phoneDigits ? `<a href="https://wa.me/${phoneDigits}" style="display:inline-block;background:${C.charcoal};color:${C.ivory};font-size:10.5px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:10px 16px;margin-right:6px">WhatsApp</a>` : ""}
    <a href="mailto:${esc(row.email)}?subject=${encodeURIComponent(`Tu proyecto con Nina Marquina — ${service}`)}" style="display:inline-block;border:1px solid ${C.charcoal};color:${C.charcoal};font-size:10.5px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:9px 16px">Responder</a>
  </div>
</td></tr></table>
${section("El proyecto", [
  ["Servicio", esc(service)],
  [q.fields.propertyType, esc(pick("propertyType", row.property_type))],
  [q.fields.propertyStatus, esc(pick("propertyStatus", row.property_status))],
  ["Superficie", row.area_m2 ? `${row.area_m2} m²` : ""],
  [q.fields.location, esc([pick("location", row.location), row.zone].filter(Boolean).join(" · "))],
])}
${section("Presupuesto y plazo", [
  ["Presupuesto (USD)", esc(pick("budget", row.budget))],
  ["Inicio", esc(pick("timeline", row.timeline))],
])}
${chips ? `<div style="font-family:${SERIF};font-size:21px;margin:30px 0 12px;padding-bottom:8px;border-bottom:1px solid ${C.stone}">Qué quiere hacer</div><div>${chips}</div>` : ""}
${
  row.description
    ? `<div style="margin-top:18px;border-left:2px solid ${C.clay};padding:4px 0 4px 18px;font-family:${SERIF};font-size:19px;font-style:italic;line-height:1.5;color:${C.charcoal}">“${esc(row.description).replace(/\n/g, "<br>")}”</div>`
    : ""
}
${
  fileUrls.length || row.links.length
    ? `<div style="font-family:${SERIF};font-size:21px;margin:30px 0 12px;padding-bottom:8px;border-bottom:1px solid ${C.stone}">Fotos, planos e ideas</div>
${fileUrls.map((f) => `<div style="padding:4px 0"><a href="${f.url}" style="color:${C.clay}">↓ ${esc(f.name)}</a></div>`).join("")}
${row.links.map((l) => `<div style="padding:4px 0"><a href="${esc(l)}" style="color:${C.clay};word-break:break-all">↗ ${esc(l)}</a></div>`).join("")}
${fileUrls.length ? `<div style="font-size:11px;color:${C.muted};margin-top:6px">Los enlaces a los archivos caducan en 7 días; siempre estarán disponibles en el panel.</div>` : ""}`
    : ""
}
<div style="margin-top:36px">${button(adminUrl, "Gestionar en el panel", C.clay)}</div>
<div style="font-size:11px;color:${C.muted};margin-top:12px">Ref. ${id}</div>`;

  return {
    subject: `Nueva solicitud · ${service} · ${row.name}`,
    html: layout({
      preheader: `${row.name} — ${service}, ${pick("location", row.location)}. ${pick("budget", row.budget)}`,
      hero: heroImage(row.service, "Nueva solicitud de cotización", `${esc(service)}<br><i style="color:${C.muted}">${esc(row.name)}</i>`),
      body,
      footerNote: "Aviso interno generado por el cotizador de la web.",
    }),
  };
}

export function clientQuoteEmail(row: QuoteRow) {
  const isEn = row.locale === "en";
  const { q, pick } = labels(row.locale);
  const first = esc(row.name.split(" ")[0]);
  const service = pick("service", row.service);
  const t = isEn
    ? {
        subject: "We've received your request — Nina Marquina",
        kicker: "Request received",
        title: `Thank you, <i>${first}</i>.`,
        p1: "Thank you for telling us about your project. Nina will personally review your request and get back to you within 48 hours.",
        summary: "Your request",
        next: "What happens next",
        steps: ["We review your project and references.", "We contact you to talk it through.", "We prepare a tailored proposal."],
        cta: "See our projects",
        note: "You're receiving this email because you submitted a quote request on our website.",
      }
    : {
        subject: "Hemos recibido tu solicitud — Nina Marquina",
        kicker: "Solicitud recibida",
        title: `Gracias, <i>${first}</i>.`,
        p1: "Gracias por contarnos tu proyecto. Nina revisará personalmente tu solicitud y te contactará en menos de 48 horas.",
        summary: "Tu solicitud",
        next: "Próximos pasos",
        steps: ["Revisamos tu proyecto y tus referencias.", "Te contactamos para conversarlo.", "Preparamos una propuesta a tu medida."],
        cta: "Ver nuestros proyectos",
        note: "Recibes este email porque enviaste una solicitud de cotización en nuestra web.",
      };

  const body = `
<p style="margin:0;font-size:15px;line-height:1.75;color:${C.muted}">${t.p1}</p>
${section(t.summary, [
  [q.steps.service.title.replace(/[¿?]/g, ""), esc(service)],
  [q.fields.propertyType, esc(pick("propertyType", row.property_type))],
  [q.fields.location, esc([pick("location", row.location), row.zone].filter(Boolean).join(" · "))],
  [q.fields.budget, esc(pick("budget", row.budget))],
  [q.fields.timeline, esc(pick("timeline", row.timeline))],
])}
<div style="font-family:${SERIF};font-size:21px;margin:30px 0 12px;padding-bottom:8px;border-bottom:1px solid ${C.stone}">${t.next}</div>
<table role="presentation" cellpadding="0" cellspacing="0">${t.steps
    .map(
      (s, i) =>
        `<tr><td valign="top" style="padding:6px 14px 6px 0;font-family:${SERIF};font-size:20px;color:${C.clay}">0${i + 1}</td><td style="padding:8px 0;font-size:14px">${s}</td></tr>`,
    )
    .join("")}</table>
<div style="margin-top:34px">${button(`${site.url}/${isEn ? "en" : "es"}/proyectos`, t.cta)}</div>`;

  return {
    subject: t.subject,
    html: layout({
      preheader: t.p1,
      hero: heroImage(row.service, t.kicker, t.title),
      body,
      footerNote: t.note,
    }),
  };
}

export function loginEmail(link: string, portal = false) {
  if (portal) return portalEmail(link);
  const body = `<p style="margin:0;font-size:15px;line-height:1.75;color:${C.muted}">Pulsa el botón para entrar al panel de Nina Marquina. El enlace es personal, sirve una sola vez y caduca en 1 hora.</p>
<div style="margin-top:30px">${button(link, "Entrar al panel", C.clay)}</div>
<p style="margin-top:28px;font-size:12px;color:${C.muted}">Si no lo has pedido tú, ignora este email.</p>`;
  return {
    subject: "Tu acceso al panel — Nina Marquina",
    html: layout({
      preheader: "Enlace de acceso al panel",
      hero: `<tr><td style="padding:36px 40px 0"><div style="font-family:${SANS};font-size:10px;letter-spacing:2.6px;text-transform:uppercase;color:${C.clay}">Panel</div><div style="font-family:${SERIF};font-size:36px;line-height:1.1;margin-top:12px">Tu enlace de <i>acceso</i>.</div></td></tr>`,
      body,
      footerNote: "Email de acceso al panel interno.",
    }),
  };
}

export function budgetEmail(b: { name: string; title: string; number: number; total: string; url: string }) {
  const first = esc(b.name.split(" ")[0]);
  const body = `<p style="margin:0;font-size:15px;line-height:1.75;color:${C.muted}">Hola ${first}, gracias por confiar en nosotros. Te compartimos la propuesta para <b style="color:${C.charcoal}">${esc(b.title)}</b>. Puedes verla completa y descargarla en PDF desde el enlace.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:${C.sand}"><tr><td style="padding:24px 26px">
<div style="font-family:${SANS};font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:${C.muted}">Presupuesto #${b.number}</div>
<div style="font-family:${SERIF};font-size:34px;line-height:1.1;margin-top:8px;color:${C.charcoal}">${esc(b.total)}</div>
</td></tr></table>
<div style="margin-top:30px">${button(b.url, "Ver presupuesto", C.charcoal)}</div>
<p style="margin-top:26px;font-size:13px;line-height:1.7;color:${C.muted}">Si tienes cualquier duda, responde a este email o escríbenos por WhatsApp. Estaremos encantadas de ajustarlo contigo.</p>`;
  return {
    subject: `Tu presupuesto · ${b.title} — Nina Marquina`,
    html: layout({
      preheader: `Presupuesto #${b.number} · ${b.total}`,
      hero: `<tr><td style="padding:36px 40px 0"><div style="font-family:${SANS};font-size:10px;letter-spacing:2.6px;text-transform:uppercase;color:${C.clay}">Propuesta</div><div style="font-family:${SERIF};font-size:38px;line-height:1.1;margin-top:12px;color:${C.charcoal}">Tu <i>presupuesto</i>.</div></td></tr>`,
      body,
      footerNote: "Recibes este email porque solicitaste una propuesta a Nina Marquina.",
    }),
  };
}

export function portalEmail(link: string, invite?: { name: string }) {
  const first = invite ? esc(invite.name.split(" ")[0]) : "";
  const intro = invite
    ? `Hola ${first}, ya tienes acceso a tu área de cliente de Nina Marquina. Allí podrás seguir tu proyecto por fases, ver los avances de obra con fotos y consultar tus presupuestos.`
    : "Pulsa el botón para entrar a tu área de cliente de Nina Marquina.";
  const body = `<p style="margin:0;font-size:15px;line-height:1.75;color:${C.muted}">${intro}</p>
<div style="margin-top:30px">${button(link, "Entrar a mi área", C.clay)}</div>
<p style="margin-top:28px;font-size:12px;line-height:1.7;color:${C.muted}">El enlace es personal, sirve una sola vez y caduca en 1 hora. Cuando quieras volver a entrar, pide uno nuevo en <a href="${site.url}/acceso" style="color:${C.clay}">${site.url.replace(/^https?:\/\//, "")}/acceso</a> con este mismo email.</p>`;
  return {
    subject: invite ? "Bienvenida a tu área de cliente — Nina Marquina" : "Tu acceso — Nina Marquina",
    html: layout({
      preheader: invite ? "Sigue tu proyecto paso a paso" : "Enlace de acceso a tu área de cliente",
      hero: `<tr><td style="padding:36px 40px 0"><div style="font-family:${SANS};font-size:10px;letter-spacing:2.6px;text-transform:uppercase;color:${C.clay}">Área de cliente</div><div style="font-family:${SERIF};font-size:36px;line-height:1.1;margin-top:12px">${invite ? "Tu proyecto, <i>paso a paso</i>." : "Tu enlace de <i>acceso</i>."}</div></td></tr>`,
      body,
      footerNote: "Email de acceso al área de clientes de Nina Marquina.",
    }),
  };
}
