export const SERVICES = ["reformas", "arquitectura", "construccion", "interiorismo", "render3d", "otro"] as const;
export const PROPERTY_TYPES = ["casa", "apartamento", "townhouse", "local", "oficina", "terreno", "otro"] as const;
export const PROPERTY_STATUS = ["existente", "nuevo", "compra"] as const;
export const COUNTRIES = ["ve", "do", "us", "otro"] as const;
export const CITIES: Partial<Record<(typeof COUNTRIES)[number], readonly string[]>> = {
  ve: ["caracas", "valencia", "barquisimeto", "maracaibo", "maracay", "puertolacruz", "lecheria", "otra"],
  do: ["puntacana", "santodomingo", "santiago", "laromana", "otra"],
};
export const CARACAS_ZONES = [
  "elhatillo",
  "altohatillo",
  "lalagunita",
  "latrinidad",
  "baruta",
  "chacao",
  "altamira",
  "lacastellana",
  "lospalosgrandes",
  "lasmercedes",
  "pradosdeleste",
  "santafe",
  "otra",
] as const;
export const PLACE_NAMES: Record<string, string> = {
  caracas: "Caracas",
  valencia: "Valencia",
  barquisimeto: "Barquisimeto",
  maracaibo: "Maracaibo",
  maracay: "Maracay",
  puertolacruz: "Puerto La Cruz",
  lecheria: "Lechería",
  puntacana: "Punta Cana",
  santodomingo: "Santo Domingo",
  santiago: "Santiago",
  laromana: "La Romana",
  elhatillo: "El Hatillo",
  altohatillo: "Alto Hatillo",
  lalagunita: "La Lagunita",
  latrinidad: "La Trinidad",
  baruta: "Baruta",
  chacao: "Chacao",
  altamira: "Altamira",
  lacastellana: "La Castellana",
  lospalosgrandes: "Los Palos Grandes",
  lasmercedes: "Las Mercedes",
  pradosdeleste: "Prados del Este",
  santafe: "Santa Fe",
};
const COUNTRY_NAMES_ES: Record<string, string> = { ve: "Venezuela", do: "República Dominicana", us: "Estados Unidos", otro: "" };
export const NEEDS = [
  "cocina",
  "banos",
  "closet",
  "sala",
  "habitaciones",
  "distribucion",
  "ampliacion",
  "fachada",
  "terraza",
  "piscina",
  "iluminacion",
  "mobiliario",
  "planos",
  "renders",
] as const;
export const BUDGETS = ["b1", "b2", "b3", "b4", "b5", "nd"] as const;
export const TIMELINES = ["asap", "m3", "m6", "later"] as const;
export const CONTACT_PREFS = ["whatsapp", "email", "llamada"] as const;

export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];

export type QuoteInput = {
  locale: "es" | "en";
  service: (typeof SERVICES)[number] | "";
  propertyType: (typeof PROPERTY_TYPES)[number] | "";
  propertyStatus: (typeof PROPERTY_STATUS)[number] | "";
  area: string;
  country: (typeof COUNTRIES)[number] | "";
  city: string;
  cityOther: string;
  zone: string;
  needs: string[];
  description: string;
  budget: (typeof BUDGETS)[number] | "";
  timeline: (typeof TIMELINES)[number] | "";
  links: string;
  files: string[];
  name: string;
  email: string;
  phone: string;
  contactPref: (typeof CONTACT_PREFS)[number];
  consent: boolean;
  newsletter?: boolean;
  company?: string;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const oneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] =>
  typeof v === "string" && (list as readonly string[]).includes(v);

export function validateQuote(q: Partial<QuoteInput>): string | null {
  if (!oneOf(SERVICES, q.service)) return "service";
  if (!oneOf(PROPERTY_TYPES, q.propertyType)) return "propertyType";
  if (locationError(q)) return "location";
  if (!Array.isArray(q.needs) || q.needs.some((n) => !oneOf(NEEDS, n))) return "needs";
  if (!oneOf(BUDGETS, q.budget)) return "budget";
  if (!oneOf(TIMELINES, q.timeline)) return "timeline";
  if (!q.name || q.name.trim().length < 2) return "name";
  if (!q.email || !EMAIL_RE.test(q.email)) return "email";
  if (!q.phone || q.phone.replace(/\D/g, "").length < 7) return "phone";
  if (!q.consent) return "consent";
  if (!Array.isArray(q.files) || q.files.length > MAX_FILES || q.files.some((f) => !/^requests\/[\w-]+\/[\w.-]+$/.test(f)))
    return "files";
  return null;
}

const needsCityText = (q: Pick<QuoteInput, "country" | "city">) => !CITIES[q.country as keyof typeof CITIES] || q.city === "otra";

export function locationError(q: Partial<QuoteInput>): boolean {
  if (!oneOf(COUNTRIES, q.country)) return true;
  const cities = CITIES[q.country];
  if (cities && !oneOf(cities, q.city)) return true;
  if (needsCityText({ country: q.country, city: q.city ?? "" }) && (q.cityOther ?? "").trim().length < 2) return true;
  return false;
}

/** "Venezuela · Caracas" — country name is passed in so the UI can localise it. */
export function formatLocation(q: Pick<QuoteInput, "country" | "city" | "cityOther">, countryName?: string) {
  const country = countryName ?? COUNTRY_NAMES_ES[q.country] ?? "";
  const city = needsCityText(q) ? q.cityOther.trim().slice(0, 80) : PLACE_NAMES[q.city] ?? "";
  return [country, city].filter(Boolean).join(" · ");
}
