export type Discipline = 'photography' | 'music' | 'fashion' | 'design' | 'now' | 'inheritance';
export type Motif = 'portrait' | 'sleeve' | 'stripe' | 'lettering' | 'repeat' | 'crop' | 'grain' | 'circle' | 'light';

export interface BaseArtifact {
  id: string;
  discipline: Discipline;
  title: string;
  caption: string;
  file: string;
  alt: string;
  motifs: Motif[];
  relatedIds: string[];
}

export interface ArchivalArtifact extends BaseArtifact {
  kind: 'archival';
  makerCulture: string;
  date: string;
  creditLine: string;
  licence: string;
  sourceUrl: string;
  sacred: boolean;
}

export interface ConceptualArtifact extends BaseArtifact {
  kind: 'conceptual';
  makerCulture?: never;
  date?: never;
  creditLine?: string;
  licence?: string;
  sourceUrl?: string;
  sacred?: false;
}

export type Artifact = ArchivalArtifact | ConceptualArtifact;

export const ARTIFACTS: Artifact[] = [
  // ================= PHOTOGRAPHY (HISTORICAL ARCHIVAL) =================
  {
    id: 'ph-hist-1',
    discipline: 'photography',
    title: 'Studio Portrait of a Chief and Attendants',
    caption: 'Formal studio portrait documenting chieftaincy regalia, layered beadwork, and posture.',
    file: '/img/ph-hist-1.jpg',
    alt: 'Archival studio portrait of a seated Yoruba chief with ceremonial staff and attendants',
    makerCulture: 'Yoruba Culture, Nigeria',
    date: 'c. 1910–1920',
    creditLine: 'The Metropolitan Museum of Art, The Michael C. Rockefeller Memorial Collection',
    licence: 'Open Access (CC0 1.0)',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/310481',
    sacred: false,
    motifs: ['portrait', 'light', 'grain'],
    relatedIds: ['ph-hist-2', 'ph-darkroom', 'fa-textile-1'],
    kind: 'archival'
  },
  {
    id: 'ph-hist-2',
    discipline: 'photography',
    title: 'Portrait of Two Women with Elaborate Hairstyles',
    caption: 'Gelatin silver print capturing intricate braided architectural coiffure and woven wrappers.',
    file: '/img/ph-hist-2.jpg',
    alt: 'Black and white archival studio photograph of two Nigerian women with crested braided hairstyles',
    makerCulture: 'Ife / Yoruba Artist, Nigeria',
    date: 'c. 1930',
    creditLine: 'Smithsonian National Museum of African Art, Eliot Elisofon Photographic Archives',
    licence: 'Smithsonian Open Access (CC0)',
    sourceUrl: 'https://africa.si.edu/collection/photographic-archives/',
    sacred: false,
    motifs: ['portrait', 'repeat', 'crop'],
    relatedIds: ['ph-hist-1', 'ph-hist-3', 'fa-textile-2'],
    kind: 'archival'
  },
  {
    id: 'ph-hist-3',
    discipline: 'photography',
    title: 'Market Day Gathering along the Marina',
    caption: 'Outdoor view recording woven canopies, river trade, and movement at the water edge.',
    file: '/img/ph-hist-3.jpg',
    alt: 'Historical wide perspective photograph of trading canoes and market pavilions along Lagos marina',
    makerCulture: 'Lagos Colony Photographer',
    date: 'c. 1925',
    creditLine: 'The British Museum, Department of Africa, Oceania and the Americas',
    licence: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',
    sourceUrl: 'https://www.britishmuseum.org/collection',
    sacred: false,
    motifs: ['light', 'repeat', 'grain'],
    relatedIds: ['ph-hist-1', 'mu-inst-1', 'de-obj-1'],
    kind: 'archival'
  },
  {
    id: 'ph-darkroom',
    discipline: 'photography',
    title: 'Darkroom under a safelight',
    caption: 'Wet prints hang suspended along a drying wire beneath a low red glow.',
    file: '/img/ph-darkroom.jpg',
    alt: 'Darkroom workspace with red safelight glow and drying photographic prints',
    motifs: ['light', 'grain', 'crop'],
    relatedIds: ['ph-hist-1', 'mu-inst-2', 'de-obj-2'],
    kind: 'conceptual'
  },

  // ================= MUSIC (HISTORICAL INSTRUMENTS & SLEEVES) =================
  {
    id: 'mu-inst-1',
    discipline: 'music',
    title: 'Carved Slit Drum (Ikoro)',
    caption: 'Monumental hollowed hardwood resonant chamber carved with ancestral relief faces.',
    file: '/img/mu-inst-1.jpg',
    alt: 'Carved wooden Igbo slit drum with figurative anthropomorphic handles',
    makerCulture: 'Igbo Artist, Nigeria',
    date: 'Late 19th–Early 20th Century',
    creditLine: 'The Metropolitan Museum of Art, Gift of Ernst Anspach',
    licence: 'Open Access (CC0 1.0)',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/312217',
    sacred: true, // Sacred communal acoustic instrument
    motifs: ['circle', 'repeat', 'grain'],
    relatedIds: ['mu-inst-2', 'ph-hist-1', 'de-obj-1'],
    kind: 'archival'
  },
  {
    id: 'mu-inst-2',
    discipline: 'music',
    title: 'Tension Drum with Beaded Strap (Dùndún)',
    caption: 'Hourglass talking drum bound with longitudinal leather cords and brass ornamentation.',
    file: '/img/mu-inst-2.jpg',
    alt: 'Yoruba pressure drum with leather tension thongs and curved wooden beater',
    makerCulture: 'Yoruba Artist, Southwestern Nigeria',
    date: 'c. 1940',
    creditLine: 'Museum of Fine Arts, Boston, Collection of Musical Instruments',
    licence: 'Open Access (CC0)',
    sourceUrl: 'https://collections.mfa.org/',
    sacred: false,
    motifs: ['circle', 'stripe', 'light'],
    relatedIds: ['mu-inst-1', 'mu-inst-3', 'fa-textile-3'],
    kind: 'archival'
  },
  {
    id: 'mu-inst-3',
    discipline: 'music',
    title: 'Royal Ivory Side-Blown Trumpet (Akohen)',
    caption: 'Spiral carved royal court horn sculpted from elephant ivory for palace processions.',
    file: '/img/mu-inst-3.jpg',
    alt: 'Carved ivory side-blown court trumpet with interlaced geometric relief motifs',
    makerCulture: 'Edo / Kingdom of Benin, Nigeria',
    date: 'c. 18th Century',
    creditLine: 'The British Museum, Historic Court Regalia',
    licence: 'CC BY-NC-SA 4.0',
    sourceUrl: 'https://www.britishmuseum.org/collection',
    sacred: true, // Royal ceremonial sacred instrument
    motifs: ['sleeve', 'repeat', 'crop'],
    relatedIds: ['mu-inst-2', 'de-obj-1', 'fa-textile-1'],
    kind: 'archival'
  },

  // ================= FASHION (HISTORICAL TEXTILES) =================
  {
    id: 'fa-textile-1',
    discipline: 'fashion',
    title: 'Indigo-Dyed Resist Cloth (Adire Eleko)',
    caption: 'Cassava-starch hand-stenciled indigo cotton cloth with sacred geometric grid cartouches.',
    file: '/img/fa-textile-1.jpg',
    alt: 'Deep blue indigo resist patterned Adire Eleko textile panel with repeating bird and geometric seals',
    makerCulture: 'Yoruba Woman Dyer, Abeokuta, Nigeria',
    date: 'c. 1935',
    creditLine: 'The British Museum, Department of Africa, Oceania and the Americas',
    licence: 'CC BY-NC-SA 4.0',
    sourceUrl: 'https://www.britishmuseum.org/collection',
    sacred: false,
    motifs: ['repeat', 'stripe', 'crop'],
    relatedIds: ['fa-textile-2', 'ph-hist-1', 'de-obj-2'],
    kind: 'archival'
  },
  {
    id: 'fa-textile-2',
    discipline: 'fashion',
    title: 'Prestige Strip-Woven Cloth (Aso-Oke)',
    caption: 'Narrow-band loom woven wild silk and cotton with openwork perforations and silver weft floats.',
    file: '/img/fa-textile-2.jpg',
    alt: 'Aso-Oke ceremonial prestige textile woven from narrow strips with shimmering metallic and magenta stripes',
    makerCulture: 'Yoruba Weaver, Iseyin, Nigeria',
    date: 'c. 1950',
    creditLine: 'Smithsonian National Museum of African Art, Museum Purchase',
    licence: 'Smithsonian Open Access (CC0)',
    sourceUrl: 'https://africa.si.edu/',
    sacred: false,
    motifs: ['stripe', 'repeat', 'lettering'],
    relatedIds: ['fa-textile-1', 'fa-textile-3', 'mu-inst-2'],
    kind: 'archival'
  },
  {
    id: 'fa-textile-3',
    discipline: 'fashion',
    title: 'Akete Beaded Ceremonial Crown Crown',
    caption: 'Conical headdress embroidered with glass seed beads forming interlaced ancestral quadrupeds.',
    file: '/img/fa-textile-3.jpg',
    alt: 'Conical beaded ceremonial crown with multicolored seed bead patterns and projecting avian finial',
    makerCulture: 'Yoruba Artist, Nigeria',
    date: 'c. 1920–1940',
    creditLine: 'The Metropolitan Museum of Art, Gift of D. and J. de Menil',
    licence: 'Open Access (CC0 1.0)',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/312294',
    sacred: true, // Sacred royal regalia headdress
    motifs: ['portrait', 'light', 'circle'],
    relatedIds: ['fa-textile-2', 'fa-textile-4', 'de-obj-3'],
    kind: 'archival'
  },
  {
    id: 'fa-textile-4',
    discipline: 'fashion',
    title: 'Akwete Weft-Float Patterned Wrapper',
    caption: 'Handwoven broad-loom cotton cloth with geometric chevrons and tortoise comb emblems.',
    file: '/img/fa-textile-4.jpg',
    alt: 'Akwete woven textile panel displaying distinct raised geometric weft-float diamonds on black cotton',
    makerCulture: 'Ndoki Igbo Weaver, Akwete, Nigeria',
    date: 'c. 1945',
    creditLine: 'Horniman Museum and Gardens, London',
    licence: 'Creative Commons Attribution-ShareAlike (CC BY-SA 4.0)',
    sourceUrl: 'https://www.horniman.ac.uk/collection/',
    sacred: false,
    motifs: ['stripe', 'repeat', 'crop'],
    relatedIds: ['fa-textile-1', 'de-obj-3', 'ph-hist-2'],
    kind: 'archival'
  },

  // ================= DESIGN (HISTORICAL OBJECTS & TYPOGRAPHY) =================
  {
    id: 'de-obj-1',
    discipline: 'design',
    title: 'Cast Brass Commemorative Relief Plaque',
    caption: 'Lost-wax cast architectural court panel with relief figures and river-leaf background punchmarks.',
    file: '/img/de-obj-1.jpg',
    alt: 'High-relief cast brass plaque showing three court dignitaries holding ceremonial shields',
    makerCulture: 'Edo / Kingdom of Benin, Nigeria',
    date: '16th–17th Century',
    creditLine: 'The Metropolitan Museum of Art, Gift of Mr. and Mrs. Klaus G. Perls',
    licence: 'Open Access (CC0 1.0)',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/316499',
    sacred: true, // Sacred ancestral court installation plaque
    motifs: ['portrait', 'repeat', 'lettering'],
    relatedIds: ['de-obj-2', 'mu-inst-1', 'fa-textile-3'],
    kind: 'archival'
  },
  {
    id: 'de-obj-2',
    discipline: 'design',
    title: 'Carved Wood Divination Board (Opon Ifa)',
    caption: 'Circular ceremonial tray featuring the carved visage of Eshu at the perimeter rim.',
    file: '/img/de-obj-2.jpg',
    alt: 'Circular carved wooden divination tray with a central smooth flat plain and figured relief borders',
    makerCulture: 'Yoruba Sculptor, Osi-Ilorin Workshop, Nigeria',
    date: 'Early 20th Century',
    creditLine: 'National Museum of African Art, Smithsonian Institution',
    licence: 'Smithsonian Open Access (CC0)',
    sourceUrl: 'https://africa.si.edu/',
    sacred: true, // Sacred Ifa divination apparatus
    motifs: ['circle', 'grain', 'portrait'],
    relatedIds: ['de-obj-1', 'de-obj-3', 'ph-darkroom'],
    kind: 'archival'
  },
  {
    id: 'de-obj-3',
    discipline: 'design',
    title: 'Beaded Diviner Bag (Apo Ifa)',
    caption: 'Velvet and canvas pouch decorated with polychrome seed-bead geometric checkerboards.',
    file: '/img/de-obj-3.jpg',
    alt: 'Rectangular ceremonial bead-embroidered shoulder bag with chevron and lozenge color registrations',
    makerCulture: 'Yoruba Beadworker, Nigeria',
    date: 'c. 1930',
    creditLine: 'The Metropolitan Museum of Art, Purchase, Rogers Fund',
    licence: 'Open Access (CC0 1.0)',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/314120',
    sacred: false,
    motifs: ['stripe', 'repeat', 'sleeve'],
    relatedIds: ['de-obj-2', 'fa-textile-3', 'now-street-poster'],
    kind: 'archival'
  },

  // ================= NOW (CONCEPTUAL STILL LIFES) =================
  {
    id: 'now-phone',
    discipline: 'now',
    title: 'Smartphone recording screen',
    caption: 'An illuminated handheld screen captures soundwaves and live visual streams.',
    file: '/img/now-phone.jpg',
    alt: 'Smartphone screen glowing in darkness with audio waveform visualizer',
    motifs: ['light', 'portrait', 'crop'],
    relatedIds: ['now-street-poster', 'ph-hist-2', 'mu-inst-2'],
    kind: 'conceptual'
  },
  {
    id: 'now-street-poster',
    discipline: 'now',
    title: 'Street concert poster',
    caption: 'Freshly pasted graphic prints stand sharp against a corrugated zinc fence.',
    file: '/img/now-street-poster.jpg',
    alt: 'Vivid newly wheatpasted street poster on a textured metal fence',
    motifs: ['lettering', 'stripe', 'light'],
    relatedIds: ['now-night-road', 'de-obj-3', 'fa-textile-4'],
    kind: 'conceptual'
  },
  {
    id: 'now-night-road',
    discipline: 'now',
    title: 'Night highway light trails',
    caption: 'Streamlined vehicle headlamps carve golden ribbons across coastal asphalt.',
    file: '/img/now-night-road.jpg',
    alt: 'Long exposure photograph of expressway traffic lights over water at twilight',
    motifs: ['light', 'stripe', 'circle'],
    relatedIds: ['now-phone', 'ph-darkroom', 'mu-inst-1'],
    kind: 'conceptual'
  },

  // ================= INHERITANCE (CONCEPTUAL REPOSITORY) =================
  {
    id: 'inh-archive-boxes',
    discipline: 'inheritance',
    title: 'Archival document boxes',
    caption: 'Reinforced acid-free cartons rest on metal shelving holding preserved paper.',
    file: '/img/inh-archive-boxes.jpg',
    alt: 'Rows of uniform cardboard archival boxes tied with string in a quiet repository',
    motifs: ['repeat', 'grain', 'sleeve'],
    relatedIds: ['ph-darkroom', 'mu-inst-1', 'fa-textile-1'],
    kind: 'conceptual'
  }
];

export const DISCIPLINE_FALLBACKS: Record<Discipline, string> = {
  photography: '/img/ph-darkroom.jpg',
  music: '/img/mu-inst-1.jpg',
  fashion: '/img/fa-textile-1.jpg',
  design: '/img/de-obj-1.jpg',
  now: '/img/now-phone.jpg',
  inheritance: '/img/inh-archive-boxes.jpg'
};
