const journal = new Set([
  "el-dia-que-conoci-a-bjarke-ingels",
  "disenar-con-la-gente-y-para-la-gente",
  "conocer-a-norman-foster-en-persona",
  "ghosting-laboral-el-deporte-favorito-de-algunos-clientes",
  "como-ser-un-homebody-sin-culpa-y-con-estilo",
  "tu-refugio-el-impacto-de-crear-espacios-como-cocinas-exteriores-y-piscinas-en-casa",
  "superheroes-nostalgia-y-diseno-por-que-el-diseno-de-mediados-de-siglo-esta-dominando-las-pantallas-y-nuestros-hogares",
  "disenar-con-intencion-por-que-el-futuro-del-interiorismo-esta-en-el-espacio-curado",
  "la-musica-como-parte-del-diseno-interior-como-mejorar-tus-espacios-con-sonido-de-alta-fid-elidad",
  "tendencia-de-proyectos-mixtos-deporte-entretenimiento-residencial",
  "el-naranja-es-el-nuevo-negro-asi-el-color-conquista-la-moda-la-tecnologia-y-nuestros-hogares",
  "centros-comerciales-de-experiencia-el-nuevo-eje-del-lifestyle",
  "friccion-cero-como-lograr-una-contratacion-rapida-y-clara-en-proyectos-de-construccion",
  "el-valor-del-arquitecto-y-disenador-que-los-hace-unicos-en-la-era-de-la-inteligencia-artificial",
  "norman-foster-institute-en-madrid-una-pregunta-sobre-el-futuro-de-las-ciudades",
]);

const projects: Record<string, string> = {
  "sport-city-club": "sport-city-club",
  "townhouses-white-onyx": "townhouses-white-onyx",
  townhouses: "townhouses-white-onyx",
  "villa-sunset": "villa-sunset",
  "solana-villas": "solana-villas",
  "villa-solana": "solana-villas",
  "solana-apartments": "solana-apartments",
  "showroom-zavotti": "showroom-zavotti",
};

const pages: Record<string, string> = {
  "bungalow-trends": "/es/journal",
  blog: "/es/journal",
  "sobre-mi": "/es/estudio",
  proyectos: "/es/proyectos",
  servicios: "/es#servicios",
  contacto: "/es/cotizar",
  contactame: "/es/cotizar",
  feed: "/es/journal",
  "privacy-legal-policy": "/es",
  "sample-page": "/es",
};

function normalize(segment: string) {
  let s = segment;
  try {
    s = decodeURIComponent(segment);
  } catch {}
  return s
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Maps URLs of the old WordPress site to their new location. */
export function legacyRedirect(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length || ["es", "en", "admin"].includes(parts[0])) return null;
  const slug = normalize(parts[parts.length - 1]);
  if (journal.has(slug)) return `/es/journal/${slug}`;
  if (projects[slug]) return `/es/proyectos/${projects[slug]}`;
  if (parts.length === 1 && pages[slug]) return pages[slug];
  return null;
}
