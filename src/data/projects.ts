import type { Locale } from "@/i18n/routing";
import type { ProjectDetails } from "./project-details";

type Localized = Record<Locale, string>;

export type Project = {
  slug: string;
  title: string;
  year: number;
  location?: string;
  category: Localized;
  summary: Localized;
  images: string[];
  featured?: boolean;
  details?: ProjectDetails;
};

const gallery = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/projects/${slug}/${String(i + 1).padStart(2, "0")}.webp`);

export const projects: Project[] = [
  {
    slug: "townhouses-white-onyx",
    title: "Townhouses White & Onyx",
    year: 2025,
    featured: true,
    category: {
      es: "Residencial · Diseño arquitectónico y visualización 3D",
      en: "Residential · Architectural design & 3D visualization",
    },
    summary: {
      es: "Conjunto de villas adosadas con un toque de arquitectura neoclásica. El contraste entre el townhouse White, con sus molduras y cornisas, y el Onyx, con ladrillo gris oscuro, crea una atmósfera elegante y sutil. 100 m² en dos plantas: cocina abierta, sala, comedor y patio; arriba, dos habitaciones con baño.",
      en: "A set of terraced villas with a neoclassical touch. The contrast between the White townhouse, with its mouldings and cornices, and the Onyx, in dark grey brick, creates an elegant, understated atmosphere. 100 m² over two floors: open kitchen, living, dining and patio; upstairs, two en-suite bedrooms.",
    },
    images: gallery("townhouses-white-onyx", 4),
  },
  {
    slug: "solana-villas",
    title: "Solana Villas",
    year: 2025,
    featured: true,
    category: {
      es: "Residencial · Diseño arquitectónico y visualización 3D",
      en: "Residential · Architectural design & 3D visualization",
    },
    summary: {
      es: "Villas del conjunto residencial Solana, diseñadas para un entorno tropical con concreto y celosías de madera que se abren mecánicamente en el ventanal frontal. Planta baja con sala, comedor y cocina abierta hacia un jardín con outdoor kitchen y plunge pool; arriba, habitación principal con vista al jardín y una secundaria.",
      en: "Villas within the Solana residential complex, designed for a tropical setting in concrete with mechanically opening timber screens on the front glazing. Ground floor with living, dining and open kitchen onto a garden with outdoor kitchen and plunge pool; upstairs, a main bedroom overlooking the garden and a second bedroom.",
    },
    images: gallery("solana-villas", 4),
  },
  {
    slug: "sport-city-club",
    title: "Sport City Club",
    year: 2024,
    location: "Punta Cana",
    category: {
      es: "Complejo deportivo y de entretenimiento · Diseño arquitectónico + 3D",
      en: "Sports & entertainment complex · Architectural design + 3D",
    },
    summary: {
      es: "Centro deportivo y de entretenimiento en Punta Cana sobre un terreno de 40.000 m² con tres edificios: entretenimiento familiar (bowling de 8 líneas, restaurante, trampoline park, museo deportivo y sport bar con simulador de bateo), un edificio con gimnasio, simuladores deportivos y salad bar, y un hotel deportivo con interiorismo temático y vistas a las canchas.",
      en: "A sports and entertainment centre in Punta Cana on a 40,000 m² site with three buildings: family entertainment (8-lane bowling, restaurant, trampoline park, sports museum and a sports bar with batting simulator), a building with gym, sports simulators and salad bar, and a sports hotel with themed interiors overlooking the courts.",
    },
    images: gallery("sport-city-club", 15),
  },
  {
    slug: "villa-sunset",
    title: "Villa Sunset",
    year: 2023,
    category: {
      es: "Residencial · Concepto y visualización 3D",
      en: "Residential · Concept & 3D visualization",
    },
    summary: {
      es: "Villa en un entorno tropical con arquitectura moderna y materiales de la zona. Inspirada en las villas brasileñas y balinesas: líneas rectas, concreto a la vista y madera en celosías, quiebrasoles de los grandes ventanales y en la cubierta del garaje.",
      en: "A villa in a tropical setting with modern architecture and local materials. Inspired by Brazilian and Balinese villas: straight lines, exposed concrete and timber used for screens, brise-soleils over the large windows and the carport roof.",
    },
    images: gallery("villa-sunset", 3),
  },
  {
    slug: "solana-apartments",
    title: "Solana Apartments",
    year: 2025,
    category: {
      es: "Residencial · Diseño arquitectónico y visualización 3D",
      en: "Residential · Architectural design & 3D visualization",
    },
    summary: {
      es: "Conjunto de edificios de arquitectura moderna con fachada de piedra y celosías de madera que actúan como quiebrasoles, reduciendo la incidencia solar y aportando materialidad. Apartamentos de 2 y 3 habitaciones con área social, piscina y caminerías al aire libre.",
      en: "A group of modern buildings with stone façades and timber screens acting as brise-soleils, reducing solar gain and adding materiality. Two- and three-bedroom apartments with a social area, pool and outdoor walkways.",
    },
    images: gallery("solana-apartments", 3),
  },
  {
    slug: "showroom-zavotti",
    title: "Showroom Zavotti",
    year: 2024,
    category: {
      es: "Interiorismo comercial · Diseño arquitectónico y visualización 3D",
      en: "Commercial interiors · Architectural design & 3D visualization",
    },
    summary: {
      es: "Espacio de exhibición para el mobiliario de exterior de Zavotti. Los muebles se modelaron desde cero para que el cliente viera su producto real. Diseño de carácter industrial, con ductos de ventilación y vigas metálicas a la vista e iluminación focal sobre cada pieza.",
      en: "An exhibition space for Zavotti's outdoor furniture. Every piece was modelled from scratch so the client could see their real products. An industrial character, with exposed ventilation ducts and steel beams and focused lighting on each piece.",
    },
    images: gallery("showroom-zavotti", 3),
  },
];

export function projectMeta(p: Project, locale: Locale) {
  return [p.location, p.category[locale], p.year].filter(Boolean).join(" · ");
}
