export const site = {
  name: "Nina Marquina",
  tagline: "Architecture & Interiors",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://new.ninamarquina.com",
  email: "hello@ninamarquina.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  locations: ["El Hatillo", "Caracas", "Madrid", "Punta Cana"],
  social: {
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
    pinterest: "https://www.pinterest.com/",
  },
};

export function whatsappHref(message?: string) {
  const base = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`
    : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
