import type { Locale } from "@/i18n/routing";

type Localized = Record<Locale, string>;
type Paragraphs = Record<Locale, string[]>;

export type ProjectSection = { title: Localized; body: Paragraphs };

export type ProjectDetails = {
  scope: Localized;
  facts?: { label: Localized; value: Localized }[];
  sections: ProjectSection[];
  highlights?: Localized[];
};

const process: ProjectSection = {
  title: { es: "Cómo trabajamos", en: "How we worked" },
  body: {
    es: [
      "Como en cada encargo del estudio, el proceso fue estructurado y coherente: desde los primeros bocetos conceptuales y la planificación espacial hasta el desarrollo de planos técnicos y renders de alta calidad.",
      "La visualización 3D permite al cliente comprender, ajustar y experimentar el proyecto antes de construirlo, de modo que cada decisión de diseño, función y atmósfera queda clara desde el principio.",
    ],
    en: [
      "As with every commission, the process was structured and consistent: from the first conceptual sketches and space planning through to technical drawings and high-quality renders.",
      "3D visualization lets the client understand, refine and experience the project before it is built, so every decision on design, function and atmosphere is clear from the start.",
    ],
  },
};

export const projectDetails: Record<string, ProjectDetails> = {
  "sport-city-club": {
    scope: { es: "Diseño arquitectónico + desarrollo 3D", en: "Architectural design + 3D development" },
    facts: [
      { label: { es: "Terreno", en: "Site" }, value: { es: "40.000 m²", en: "40,000 m²" } },
      { label: { es: "Programa", en: "Programme" }, value: { es: "3 edificios", en: "3 buildings" } },
    ],
    sections: [
      {
        title: { es: "El concepto", en: "The concept" },
        body: {
          es: [
            "Sport City Club nace de una necesidad concreta: crear en la zona de Punta Cana un centro donde el deporte, el entretenimiento y la gastronomía convivan en un mismo lugar.",
            "La idea es hacer comunidad. Con ligas deportivas, competiciones y espacios donde poner a prueba tus habilidades, el club se convierte en un sitio para socializar, recrearse y ejercitarse sin importar la edad, sin tener que atravesar la ciudad para llegar a un centro de ocio.",
          ],
          en: [
            "Sport City Club was born from a specific need: a centre in the Punta Cana area where sport, entertainment and food come together in one place.",
            "The idea is to build community. With sports leagues, competitions and spaces to test your skills, the club becomes a place to socialise, have fun and exercise at any age, without crossing the city to reach a leisure centre.",
          ],
        },
      },
      {
        title: { es: "Tres edificios, un ecosistema", en: "Three buildings, one ecosystem" },
        body: {
          es: [
            "El proyecto se concibió en un terreno de 40.000 m² donde se distribuyen tres edificios principales.",
            "El primero es un edificio de entretenimiento familiar: una pista de bowling moderna de 8 líneas, un restaurante, un trampoline park y un museo deportivo. En la planta superior se ubica un sport bar con un simulador de bateo, abierto a una cancha techada desde la que se pueden seguir finales y entrenamientos.",
            "El segundo edificio reúne un gimnasio, simuladores deportivos con una infinidad de disciplinas y un salad bar para los socios del club.",
            "El último es un hotel deportivo pensado para que atletas y aficionados se alojen con vistas a las canchas. Su interiorismo se ideó con motivos deportivos, para que los huéspedes vivan el deporte incluso a la hora del descanso.",
          ],
          en: [
            "The project was conceived on a 40,000 m² site with three main buildings.",
            "The first is a family entertainment building: a modern 8-lane bowling alley, a restaurant, a trampoline park and a sports museum. Upstairs, a sports bar with a batting simulator overlooks a covered court where guests can watch finals and training sessions.",
            "The second building brings together a gym, sports simulators covering countless disciplines and a salad bar for club members.",
            "The last is a sports hotel designed so that athletes and fans can stay with views over the courts. Its interiors use sporting motifs, so guests live the sport even while they rest.",
          ],
        },
      },
      {
        title: { es: "Un proyecto de uso mixto", en: "A mixed-use project" },
        body: {
          es: [
            "En destinos como Punta Cana o La Romana, la tendencia es integrar residencias vacacionales con espacios deportivos y zonas de entretenimiento familiar. Sport City Club responde a esa demanda de turistas, residentes e inversionistas.",
            "Combinar deporte, ocio, gastronomía y alojamiento diversifica los ingresos (membresías, hotel, restaurante) y crea amenidades que se usan una y otra vez, tanto por los huéspedes como por el público local.",
          ],
          en: [
            "In destinations such as Punta Cana or La Romana, the trend is to combine holiday residences with sports facilities and family entertainment. Sport City Club answers that demand from tourists, residents and investors alike.",
            "Bringing together sport, leisure, food and accommodation diversifies revenue (memberships, hotel, restaurant) and creates amenities that are used again and again by guests and locals.",
          ],
        },
      },
      process,
    ],
    highlights: [
      { es: "Bowling interactivo de 8 pistas LED y juegos arcade", en: "Interactive 8-lane LED bowling and arcade games" },
      { es: "Jaula de bateo con simulador en el sport bar", en: "Batting cage with simulator in the sports bar" },
      { es: "Gimnasio y salad bar", en: "Gym and salad bar" },
      { es: "Simuladores deportivos de alta resolución", en: "High-resolution sports simulators" },
      { es: "Sportel y apartamentos con vistas a las canchas", en: "Sports hotel and apartments overlooking the courts" },
      { es: "Trampoline park, restaurante y museo deportivo", en: "Trampoline park, restaurant and sports museum" },
    ],
  },

  "townhouses-white-onyx": {
    scope: { es: "Concepto y visualización arquitectónica", en: "Architectural concept & visualization" },
    facts: [
      { label: { es: "Superficie", en: "Area" }, value: { es: "100 m² por vivienda", en: "100 m² per home" } },
      { label: { es: "Plantas", en: "Floors" }, value: { es: "2 × 50 m²", en: "2 × 50 m²" } },
    ],
    sections: [
      {
        title: { es: "El concepto", en: "The concept" },
        body: {
          es: [
            "Los Townhouses White & Onyx son uno de los proyectos favoritos de Nina: un conjunto de villas adosadas con un toque de arquitectura neoclásica, reinterpretada con una mirada contemporánea.",
            "El proyecto juega con dos versiones hermanas de la misma vivienda, que comparten volumetría pero tienen carácter propio.",
          ],
          en: [
            "Townhouses White & Onyx is one of Nina's favourite projects: a set of terraced villas with a neoclassical touch, reinterpreted through a contemporary lens.",
            "The project plays with two sister versions of the same home, sharing a volume but each with its own character.",
          ],
        },
      },
      {
        title: { es: "White y Onyx", en: "White and Onyx" },
        body: {
          es: [
            "El townhouse White se define por sus molduras y cornisas, que dibujan la fachada con luz y sombra. El Onyx, en cambio, apuesta por el ladrillo en un gris oscuro.",
            "El contraste entre ambos crea una atmósfera elegante y sutil. A ello se suma una vegetación ornamental, con piezas en espiral, que aporta dinamismo y realza los detalles de la escena.",
          ],
          en: [
            "The White townhouse is defined by its mouldings and cornices, which draw the façade in light and shadow. The Onyx, by contrast, is built in dark grey brick.",
            "The contrast between the two creates an elegant, understated atmosphere, enhanced by ornamental planting with spiral-shaped pieces that adds movement and brings out the details.",
          ],
        },
      },
      {
        title: { es: "La distribución", en: "The layout" },
        body: {
          es: [
            "La distribución es simple pero cómoda: 100 m² repartidos en dos plantas de 50 m².",
            "En la planta baja, una cocina abierta integrada con la sala de estar y el comedor, que se abre a un patio. En la planta superior, una habitación principal y una secundaria, ambas con su propio baño.",
          ],
          en: [
            "The layout is simple yet comfortable: 100 m² over two 50 m² floors.",
            "On the ground floor, an open kitchen flows into the living and dining areas and out to a patio. Upstairs, a main bedroom and a second bedroom, each with its own bathroom.",
          ],
        },
      },
      process,
    ],
    highlights: [
      { es: "Dos fachadas: molduras blancas y ladrillo gris oscuro", en: "Two façades: white mouldings and dark grey brick" },
      { es: "Cocina abierta, sala, comedor y patio", en: "Open kitchen, living, dining and patio" },
      { es: "Dos habitaciones con baño propio", en: "Two bedrooms, each with en-suite bathroom" },
    ],
  },

  "villa-sunset": {
    scope: { es: "Concepto y visualización 3D", en: "Concept & 3D visualization" },
    sections: [
      {
        title: { es: "El concepto", en: "The concept" },
        body: {
          es: [
            "Villa Sunset es una vivienda en un entorno tropical, con una arquitectura moderna y una fachada que incorpora materiales propios de la zona.",
            "Es una casa pensada para su paisaje: grandes ventanales protegidos del sol con madera, y volúmenes de concreto visto.",
          ],
          en: [
            "Villa Sunset is a home in a tropical setting, with modern architecture and a façade that uses materials from the region.",
            "It is a house designed for its landscape: large windows shaded with timber, and volumes in exposed concrete.",
          ],
        },
      },
      {
        title: { es: "Referencias", en: "References" },
        body: {
          es: [
            "El diseño se inspira en las villas brasileñas y balinesas, donde predominan las líneas rectas, el concreto a la vista y la madera como protagonista.",
          ],
          en: [
            "The design draws on Brazilian and Balinese villas, where straight lines, exposed concrete and timber take centre stage.",
          ],
        },
      },
      {
        title: { es: "Materialidad", en: "Materials" },
        body: {
          es: [
            "La madera se usa tanto en celosías y quiebrasoles para los grandes ventanales como en la cubierta del garaje techado, y dialoga con el concreto visto de los volúmenes principales.",
          ],
          en: [
            "Timber is used both for the screens and brise-soleils on the large windows and for the roof of the covered garage, in dialogue with the exposed concrete of the main volumes.",
          ],
        },
      },
      process,
    ],
    highlights: [
      { es: "Concreto a la vista y líneas rectas", en: "Exposed concrete and straight lines" },
      { es: "Celosías y quiebrasoles de madera", en: "Timber screens and brise-soleils" },
      { es: "Garaje techado con cubierta de madera", en: "Covered garage with timber roof" },
    ],
  },

  "solana-villas": {
    scope: { es: "Diseño arquitectónico y visualización 3D", en: "Architectural design & 3D visualization" },
    facts: [{ label: { es: "Conjunto", en: "Development" }, value: { es: "Residencial Solana", en: "Solana residences" } }],
    sections: [
      {
        title: { es: "El concepto", en: "The concept" },
        body: {
          es: [
            "Las villas Solana forman parte de un conjunto residencial llamado Solana, formado por apartamentos y villas que comparten un mismo lenguaje arquitectónico.",
            "La arquitectura se diseñó para un entorno tropical, con el concreto y la madera como materiales principales.",
          ],
          en: [
            "Solana Villas belong to a residential development called Solana, made up of apartments and villas that share the same architectural language.",
            "The architecture was designed for a tropical setting, with concrete and timber as its main materials.",
          ],
        },
      },
      {
        title: { es: "Una fachada que se abre", en: "A façade that opens" },
        body: {
          es: [
            "El gran gesto de la villa está en su ventanal frontal, protegido por celosías de madera que se abren de forma mecánica. Así la fachada puede abrirse o cerrarse según la luz y la privacidad que se quiera en cada momento.",
          ],
          en: [
            "The villa's main gesture is its front window wall, shielded by timber screens that open mechanically, so the façade can be opened or closed for light and privacy as needed.",
          ],
        },
      },
      {
        title: { es: "La distribución", en: "The layout" },
        body: {
          es: [
            "En la planta baja se encuentran la sala de estar, el comedor y una cocina abierta, que se prolongan hacia un jardín con outdoor kitchen y plunge pool.",
            "En el nivel superior, una habitación principal con vista al jardín y una habitación secundaria con vista a la calle.",
          ],
          en: [
            "The ground floor holds the living room, dining room and an open kitchen, extending out to a garden with an outdoor kitchen and plunge pool.",
            "Upstairs, a main bedroom overlooking the garden and a second bedroom facing the street.",
          ],
        },
      },
      process,
    ],
    highlights: [
      { es: "Celosías de madera de apertura mecánica", en: "Mechanically opening timber screens" },
      { es: "Jardín con outdoor kitchen y plunge pool", en: "Garden with outdoor kitchen and plunge pool" },
      { es: "Habitación principal con vista al jardín", en: "Main bedroom overlooking the garden" },
    ],
  },

  "solana-apartments": {
    scope: { es: "Diseño arquitectónico y visualización 3D", en: "Architectural design & 3D visualization" },
    facts: [
      { label: { es: "Conjunto", en: "Development" }, value: { es: "Residencial Solana", en: "Solana residences" } },
      { label: { es: "Viviendas", en: "Units" }, value: { es: "2 y 3 habitaciones", en: "2 and 3 bedrooms" } },
    ],
    sections: [
      {
        title: { es: "El concepto", en: "The concept" },
        body: {
          es: [
            "Los apartamentos Solana son un conjunto de edificios de arquitectura moderna, parte del mismo residencial que las villas Solana.",
            "Los edificios comparten con las villas la idea de una arquitectura tropical, cálida y protegida del sol.",
          ],
          en: [
            "Solana Apartments is a group of modern buildings, part of the same development as Solana Villas.",
            "The buildings share with the villas the idea of a warm tropical architecture, shaded from the sun.",
          ],
        },
      },
      {
        title: { es: "Materialidad", en: "Materials" },
        body: {
          es: [
            "Las paredes frontales se revisten de piedra, y las celosías de madera actúan como quiebrasoles: reducen la incidencia solar y aportan materialidad a la fachada.",
          ],
          en: [
            "The front walls are clad in stone, and timber screens act as brise-soleils, reducing solar gain and adding texture to the façade.",
          ],
        },
      },
      {
        title: { es: "Viviendas y zonas comunes", en: "Homes and shared spaces" },
        body: {
          es: [
            "El conjunto ofrece apartamentos de 2 y 3 habitaciones. Además se diseñó un área social con piscina y caminerías al aire libre para el disfrute de los propietarios.",
          ],
          en: [
            "The development offers 2- and 3-bedroom apartments, along with a social area with a pool and outdoor walkways for residents to enjoy.",
          ],
        },
      },
      process,
    ],
    highlights: [
      { es: "Fachada de piedra y celosías de madera", en: "Stone façade and timber screens" },
      { es: "Apartamentos de 2 y 3 habitaciones", en: "2- and 3-bedroom apartments" },
      { es: "Área social con piscina y caminerías", en: "Social area with pool and walkways" },
    ],
  },

  "showroom-zavotti": {
    scope: {
      es: "Diseño de interiores comerciales, diseño arquitectónico y visualización 3D",
      en: "Commercial interior design, architectural design & 3D visualization",
    },
    facts: [{ label: { es: "Cliente", en: "Client" }, value: { es: "Zavotti", en: "Zavotti" } }],
    sections: [
      {
        title: { es: "El encargo", en: "The brief" },
        body: {
          es: [
            "El Showroom Zavotti es un espacio de exhibición para el mobiliario de exterior de la empresa Zavotti.",
            "La prioridad era que la marca reconociera su propia colección en cada imagen del proyecto.",
          ],
          en: [
            "Showroom Zavotti is an exhibition space for the outdoor furniture of the Zavotti company.",
            "The priority was for the brand to recognise its own collection in every image of the project.",
          ],
        },
      },
      {
        title: { es: "Mobiliario modelado desde cero", en: "Furniture modelled from scratch" },
        body: {
          es: [
            "Todos los muebles de la escena se modelaron desde cero, de modo que en las entregas el cliente veía su mobiliario real y no piezas genéricas.",
          ],
          en: [
            "Every piece of furniture in the scene was modelled from scratch, so the client saw its actual products in the deliverables rather than generic pieces.",
          ],
        },
      },
      {
        title: { es: "Un carácter industrial", en: "An industrial character" },
        body: {
          es: [
            "El diseño es en parte industrial: las tuberías de ventilación y las vigas metálicas se dejaron a la vista, y la iluminación se pensó como luz focal para destacar cada mueble del showroom.",
          ],
          en: [
            "The design is partly industrial: ventilation ducts and steel beams were left exposed, and the lighting was conceived as focused light to highlight each piece in the showroom.",
          ],
        },
      },
      process,
    ],
    highlights: [
      { es: "Mobiliario real modelado en 3D", en: "Real furniture modelled in 3D" },
      { es: "Instalaciones y vigas metálicas vistas", en: "Exposed ducts and steel beams" },
      { es: "Iluminación focal sobre cada pieza", en: "Focused lighting on each piece" },
    ],
  },
};
