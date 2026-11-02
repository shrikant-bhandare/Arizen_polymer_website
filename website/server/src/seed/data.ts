/**
 * Initial website content.
 *
 * Only facts supplied by Arizen are seeded: the company profile, journey, mission,
 * vision and commitments (from Arizen's "Our Journey" text), contact details and
 * product colours (from the company brochure), and the four product lines with
 * general material descriptions. Everything still to be supplied (team, director,
 * specifications, grades, certificates, photographs) is left empty and shows as a
 * marked placeholder until it is entered in the dashboard.
 * See docs/client-content-checklist.md.
 */
import type { ContentMap } from '../../../shared/content';

const seo = (title = '', description = '') => ({ title, description, ogImage: '', canonical: '' });
const conceptual = (file: string, alt: string) => ({ url: `/media/illustrations/${file}.svg`, alt });

export const seedSettings = {
  companyName: 'Arizen Polymers India Private Limited',
  shortName: 'Arizen Polymers',
  address: 'M-69, MIDC Shrirampur,\nDist. Ahilyanagar, Maharashtra 413709, India',
  phone: '+91 90821 56088',
  phone2: '+91 88050 14188',
  mapQuery: 'M-69, MIDC Shrirampur, Ahilyanagar, Maharashtra 413709',
  defaultSeo: seo(
    'Arizen Polymers India Private Limited | HIPS, ABS, HDPE & Polystyrene',
    'Manufacturer of reprocessed plastic granules in MIDC Shrirampur, Maharashtra: Black HIPS, ABS, HDPE and polystyrene. Request a quote.',
  ),
  showPlaceholders: true,
};

export const seedCategories = [
  { name: 'Styrenics', slug: 'styrenics', description: 'Styrene-based polymers: HIPS, ABS and polystyrene.', order: 0 },
  { name: 'Polyolefins', slug: 'polyolefins', description: 'Polyethylene-based polymers, including HDPE.', order: 1 },
];

const specNote = 'Technical specifications and available grades will be published here once confirmed by Arizen. Request a quote to receive the current technical data sheet.';

export const seedProducts = [
  {
    name: 'High Impact Polystyrene',
    code: 'HIPS',
    slug: 'hips',
    category: 'styrenics',
    accent: '#1F4E9C',
    tagline: 'Black reprocessed HIPS granules for sheet extrusion and moulding.',
    summary: 'Black HIPS reprocessed plastic granules for suitable plastic sheet extrusion and moulding applications.',
    description: [
      'Arizen manufactures Black HIPS reprocessed plastic granules for suitable plastic sheet extrusion and moulding applications.',
      'High Impact Polystyrene (HIPS) is polystyrene modified with a rubber phase, which gives it considerably more impact resistance than general-purpose polystyrene while keeping it easy to process.',
    ],
    image: { url: '/media/products/hips.webp', alt: 'Close-up of black HIPS granules' },
    applications: ['Plastic sheet extrusion', 'Moulding applications'],
    order: 0,
  },
  {
    name: 'Acrylonitrile Butadiene Styrene',
    code: 'ABS',
    slug: 'abs',
    category: 'styrenics',
    accent: '#E8641B',
    tagline: 'Reprocessed ABS granules for industrial plastic processing.',
    summary: 'ABS reprocessed plastic granules for suitable industrial plastic processing applications.',
    description: [
      'Arizen manufactures ABS reprocessed plastic granules for suitable industrial plastic processing applications.',
      'Acrylonitrile Butadiene Styrene (ABS) combines the strength and chemical resistance of acrylonitrile, the toughness of butadiene and the rigidity and gloss of styrene.',
    ],
    image: { url: '/media/products/abs.webp', alt: 'Close-up of black ABS granules' },
    applications: ['Industrial plastic processing'],
    order: 1,
  },
  {
    name: 'High-Density Polyethylene',
    code: 'HDPE',
    slug: 'hdpe',
    category: 'polyolefins',
    accent: '#1E7B3C',
    tagline: 'Reprocessed HDPE granules for plastic manufacturing.',
    summary: 'HDPE reprocessed plastic granules for suitable plastic manufacturing applications.',
    description: [
      'Arizen manufactures HDPE reprocessed plastic granules for suitable plastic manufacturing applications.',
      'High-Density Polyethylene (HDPE) is a linear polyethylene with a high strength-to-density ratio, good chemical resistance and low moisture absorption.',
    ],
    image: { url: '/media/products/hdpe.webp', alt: 'Close-up of blue HDPE granules' },
    applications: ['Plastic manufacturing'],
    order: 2,
  },
  {
    name: 'Polystyrene Granules',
    code: 'PS',
    slug: 'polystyrene-granules',
    category: 'styrenics',
    accent: '#6A2C9E',
    tagline: 'Reprocessed polystyrene granules for industrial processing.',
    summary: 'Polystyrene reprocessed plastic granules for suitable industrial processing requirements.',
    description: [
      'Arizen manufactures Polystyrene reprocessed plastic granules for suitable industrial processing requirements.',
      'Polystyrene is a clear, rigid thermoplastic that moulds easily and reproduces fine detail well.',
    ],
    image: { url: '/media/products/gpps.webp', alt: 'Close-up of clear polystyrene granules' },
    applications: ['Industrial processing'],
    order: 3,
  },
].map((p) => ({
  ...p,
  specifications: [],
  specificationsNote: specNote,
  grades: [],
  status: 'published' as const,
  seo: seo(`${p.code} — ${p.name} | Arizen Polymers`, `${p.summary} Request a quote from Arizen Polymers.`),
}));

export const seedContent: ContentMap = {
  home: {
    hero: {
      eyebrow: 'Arizen Polymers India Private Limited',
      headline: 'MATERIALS THAT\nMOVE INDUSTRIES.',
      supporting: 'Quality reprocessed plastic granules (Black HIPS, ABS, HDPE and polystyrene) for a cleaner, greener tomorrow.',
      primaryCta: { label: 'Explore Products', href: '/products' },
      secondaryCta: { label: 'Connect With Our Team', href: '/contact' },
    },
    introduction: {
      eyebrow: 'Who we are',
      heading: 'Transforming plastic waste into valuable resources.',
      body: [
        'Established on 19 November 2025 at M-69, MIDC Shrirampur, Maharashtra, Arizen Polymers India Private Limited was founded with a vision to manufacture quality reprocessed plastic granules while contributing to a cleaner and greener environment.',
        'We specialise in Black HIPS, ABS, HDPE and polystyrene reprocessed plastic granules, serving clients in plastic sheet manufacturing and injection moulding.',
      ],
      cta: { label: 'About Arizen', href: '/about' },
    },
    products: {
      heading: 'Reprocessed granules for industry.',
      intro: 'Four reprocessed materials for plastic sheet manufacturing, injection moulding and industrial processing. Select a product to learn more or request a quote.',
    },
    strengths: {
      heading: 'Quality polymers for a sustainable future.',
      items: [
        { title: 'High quality recycled polymers', text: 'Quality reprocessed Black HIPS, ABS, HDPE and polystyrene granules.' },
        { title: 'Environmentally responsible', text: 'Giving suitable plastic waste, including plastics from electronic and electrical products, a new life.' },
        { title: 'Reliable supply', text: 'Product consistency and dependable service for manufacturers.' },
        { title: 'Advanced processing', text: 'Recovering and reprocessing plastic materials into reusable granules.' },
        { title: 'Sustainable business', text: 'Supporting the circular economy by keeping valuable plastic materials in use.' },
      ],
    },
    infrastructure: {
      heading: 'Infrastructure for reliable supply.',
      body: 'Our manufacturing unit is located at M-69, MIDC Shrirampur, Dist. Ahilyanagar, Maharashtra.',
      image: conceptual('warehousing', 'Illustration of warehouse racking holding palletised polymer bags'),
      imageIsConceptual: true,
      cta: { label: 'Explore infrastructure', href: '/infrastructure' },
    },
    quality: {
      heading: 'Quality, documented.',
      body: '',
      points: [],
      cta: { label: 'Our approach to quality', href: '/quality' },
    },
    inquiry: {
      heading: 'Tell us what you need.',
      body: 'Share your product, grade and quantity requirements and the Arizen team will respond with a quotation. Or call +91 90821 56088 / +91 88050 14188.',
      cta: { label: 'Request a Quote', href: '/request-quote' },
    },
    seo: seo(),
  },
  about: {
    heading: 'About Arizen Polymers',
    intro: 'Transforming plastic waste into valuable resources.',
    profile: {
      heading: 'Our journey',
      body: [
        'Established on 19 November 2025, at M-69, MIDC, Shrirampur, Maharashtra, India, Arizen Polymers India Private Limited was founded with a vision to manufacture quality reprocessed plastic granules while contributing to a cleaner and greener environment.',
        'We specialise in manufacturing high-quality Black HIPS, ABS, HDPE and Polystyrene reprocessed plastic granules. By recovering and reprocessing suitable plastic materials, we aim to give valuable resources a new life and support a more sustainable plastics industry.',
      ],
    },
    overview: {
      heading: 'At a glance',
      body: [],
      facts: [
        { label: 'Company', value: 'Arizen Polymers India Private Limited' },
        { label: 'Established', value: '19 November 2025' },
        { label: 'Location', value: 'M-69, MIDC Shrirampur, Maharashtra, India' },
        { label: 'We make', value: 'Reprocessed plastic granules' },
        { label: 'Products', value: 'Black HIPS · ABS · HDPE · Polystyrene' },
        { label: 'Customers', value: 'Plastic sheet manufacturing and injection moulding' },
      ],
    },
    sustainability: {
      heading: 'Our journey towards sustainability',
      body: [
        'At Arizen Polymers India Private Limited, we believe that waste can become a valuable resource when managed responsibly. Our work focuses on reprocessing suitable plastic waste, including plastic materials recovered from electronic and electrical products.',
        'By converting recoverable plastic waste into reusable granules, we aim to reduce the amount of plastic waste sent for disposal, support resource conservation, and contribute to reducing the environmental impact associated with electronic waste.',
        'Our efforts support the circular economy by keeping valuable plastic materials in use and supplying reprocessed raw materials to manufacturers.',
      ],
    },
    vision: 'To become a trusted manufacturer of reprocessed plastic granules in India while contributing to a cleaner environment, improved resource efficiency, and a sustainable circular economy.',
    mission: 'To manufacture quality reprocessed plastic granules, deliver reliable material solutions to our customers, and contribute to reducing plastic waste through responsible recycling and resource recovery.',
    values: {
      heading: 'Our environmental commitment',
      intro: 'We are committed to supporting a more eco-friendly future through responsible plastic reprocessing and resource utilisation.',
      items: [
        { title: 'Reducing plastic waste', text: 'Giving suitable discarded plastic materials a new life through reprocessing.' },
        { title: 'Supporting e-waste reduction', text: 'Helping recover reusable plastics from electronic and electrical waste streams.' },
        { title: 'Promoting resource conservation', text: 'Reducing the need for virgin plastic materials where reprocessed materials are suitable.' },
        { title: 'Encouraging the circular economy', text: 'Turning recoverable plastic waste into useful raw materials for manufacturing.' },
        { title: 'Building a greener future', text: 'Supporting responsible plastic use and better waste management practices.' },
      ],
      note: 'We recognise that responsible electronic waste management requires proper segregation and environmentally sound handling of all materials, including plastics and non-plastic components.',
    },
    approach: {
      heading: 'Our commitment to customers',
      intro: 'We believe in building lasting relationships through product consistency, dependable service, and an understanding of our customers’ manufacturing requirements. We serve customers in the sheet extrusion and injection moulding industries with a focus on quality and continuous improvement.',
      items: [
        { title: 'Product consistency', text: '' },
        { title: 'Dependable service', text: '' },
        { title: 'Understanding your manufacturing requirements', text: '' },
        { title: 'Quality and continuous improvement', text: '' },
      ],
    },
    closing: {
      heading: 'Looking towards a greener tomorrow',
      body: [
        'At Arizen Polymers India Private Limited, our journey is about more than manufacturing plastic granules. It is about creating value from recoverable waste, conserving resources, and supporting a future where plastic materials can be used more responsibly.',
      ],
      signoff: 'Reprocessing Today. Conserving Resources for Tomorrow.',
    },
    team: { heading: 'Our team', intro: '', members: [] },
    director: { heading: 'Director’s message', name: '', designation: 'Director', photo: { url: '', alt: '' }, message: [] },
    seo: seo('', 'Arizen Polymers India Private Limited, MIDC Shrirampur: manufacturer of reprocessed plastic granules, founded 19 November 2025.'),
  },
  products: {
    heading: 'Products',
    intro: 'Reprocessed plastic granules for plastic sheet manufacturing, injection moulding and industrial processing. Select a product to view its details, or request a quote.',
    note: 'Specifications and grades are published as confirmed by Arizen. For a full technical data sheet, request a quote.',
    seo: seo('', 'Reprocessed Black HIPS, ABS, HDPE and polystyrene granules from Arizen Polymers. View product details and request a quote.'),
  },
  infrastructure: {
    heading: 'Infrastructure',
    intro: '',
    facilities: { heading: 'Facilities overview', body: [], image: conceptual('facilities', 'Illustration of an industrial facility with loading bays'), imageIsConceptual: true },
    storage: { heading: 'Storage infrastructure', body: [], image: conceptual('warehousing', 'Illustration of warehouse racking holding palletised polymer bags'), imageIsConceptual: true },
    distribution: { heading: 'Distribution capabilities', body: [], image: conceptual('distribution', 'Illustration of a delivery truck and distribution routes'), imageIsConceptual: true },
    handling: { heading: 'Material handling', body: [], image: conceptual('handling', 'Illustration of a pallet truck moving bagged polymer'), imageIsConceptual: true },
    processes: { heading: 'Operational processes', steps: [] },
    gallery: [],
    seo: seo('', 'Infrastructure, storage, material handling and distribution at Arizen Polymers India Private Limited.'),
  },
  quality: {
    heading: 'Quality Control',
    intro: '',
    philosophy: { heading: 'Quality philosophy', body: [] },
    processes: { heading: 'Quality assurance processes', items: [] },
    testing: { heading: 'Testing procedures', items: [] },
    documentation: { heading: 'Quality documentation', body: [], documents: [] },
    certifications: { heading: 'Certifications & standards', items: [] },
    image: conceptual('quality-lab', 'Illustration of a polymer quality-testing bench'),
    imageIsConceptual: true,
    seo: seo('', 'Quality assurance, testing procedures and documentation at Arizen Polymers India Private Limited.'),
  },
  contact: {
    heading: 'Contact Us',
    intro: 'Questions about a product, grade or quantity? Send a message and the Arizen team will get back to you.',
    formHeading: 'Send an inquiry',
    businessCta: 'For bulk or recurring requirements, include your expected volume and delivery location so we can prepare an accurate quotation.',
    seo: seo('', 'Contact Arizen Polymers, M-69 MIDC Shrirampur, Maharashtra. Call +91 90821 56088 or +91 88050 14188 for granule quotations.'),
  },
  footer: {
    tagline: 'Reprocessing Today. Conserving Resources for Tomorrow. Manufacturer of reprocessed Black HIPS, ABS, HDPE and polystyrene granules.',
    ctaHeading: 'Have a requirement in mind?',
    legal: 'Arizen Polymers India Private Limited. All rights reserved.',
  },
  navigation: {
    items: [
      { label: 'Home', href: '/', visible: true },
      { label: 'About', href: '/about', visible: true },
      { label: 'Products', href: '/products', visible: true },
      { label: 'Infrastructure', href: '/infrastructure', visible: true },
      { label: 'Quality', href: '/quality', visible: true },
      { label: 'Contact', href: '/contact', visible: true },
    ],
    ctaLabel: 'Request a Quote',
  },
};
