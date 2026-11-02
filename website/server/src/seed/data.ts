/**
 * Initial website content.
 *
 * Only established facts are seeded: the company name, its industry and audience,
 * and the four product lines with general material descriptions. Everything Arizen
 * still has to supply (history, vision, team, specifications, grades, certificates,
 * contact details, photographs) is left empty and shows as a marked placeholder
 * until it is entered in the dashboard. See docs/client-content-checklist.md.
 */
import type { ContentMap } from '../../../shared/content';

const seo = (title = '', description = '') => ({ title, description, ogImage: '', canonical: '' });
const conceptual = (file: string, alt: string) => ({ url: `/media/illustrations/${file}.svg`, alt });

export const seedSettings = {
  companyName: 'Arizen Polymers India Private Limited',
  shortName: 'Arizen Polymers',
  defaultSeo: seo(
    'Arizen Polymers India Private Limited | HIPS, ABS, HDPE & Polystyrene',
    'Arizen Polymers India Private Limited works in polymer manufacturing and distribution. Explore HIPS, ABS, HDPE and polystyrene granules and request a quote.',
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
    tagline: 'Rubber-toughened polystyrene for impact-resistant parts.',
    summary: 'A rubber-modified polystyrene valued for its toughness and ease of processing.',
    description: [
      'High Impact Polystyrene (HIPS) is polystyrene modified with a rubber phase, which gives it considerably more impact resistance than general-purpose polystyrene while keeping it easy to process.',
      'It is widely used in thermoforming, injection moulding and extrusion, particularly where a rigid, cost-effective material must also withstand handling.',
    ],
    image: { url: '/media/products/hips.webp', alt: 'Close-up of opaque white polymer granules' },
    applications: ['Packaging and food-service trays', 'Appliance and refrigerator liners', 'Display and signage', 'Consumer goods housings', 'Toys and stationery'],
    order: 0,
  },
  {
    name: 'Acrylonitrile Butadiene Styrene',
    code: 'ABS',
    slug: 'abs',
    category: 'styrenics',
    tagline: 'An engineering thermoplastic balancing rigidity, toughness and finish.',
    summary: 'An engineering thermoplastic known for its balance of rigidity, toughness and surface finish.',
    description: [
      'Acrylonitrile Butadiene Styrene (ABS) combines the strength and chemical resistance of acrylonitrile, the toughness of butadiene and the rigidity and gloss of styrene.',
      'It is a common choice for moulded parts that need a good surface finish, dimensional stability and resistance to everyday impact.',
    ],
    image: { url: '/media/products/abs.webp', alt: 'Close-up of ivory polymer granules' },
    applications: ['Electrical and electronic housings', 'Automotive interior parts', 'Household appliances', 'Luggage and protective cases', 'Pipes and fittings'],
    order: 1,
  },
  {
    name: 'High-Density Polyethylene',
    code: 'HDPE',
    slug: 'hdpe',
    category: 'polyolefins',
    tagline: 'Strong, chemically resistant polyethylene for demanding uses.',
    summary: 'A high-density polyethylene recognised for its strength-to-density ratio and chemical resistance.',
    description: [
      'High-Density Polyethylene (HDPE) is a linear polyethylene with a high strength-to-density ratio, good chemical resistance and low moisture absorption.',
      'It is processed by blow moulding, injection moulding and extrusion into a wide range of rigid products.',
    ],
    image: { url: '/media/products/hdpe.webp', alt: 'Close-up of translucent milky polymer granules' },
    applications: ['Pipes and conduits', 'Bottles and containers', 'Crates and pallets', 'Films and sheets', 'Industrial moulded parts'],
    order: 2,
  },
  {
    name: 'Polystyrene Granules',
    code: 'PS',
    slug: 'polystyrene-granules',
    category: 'styrenics',
    tagline: 'General-purpose polystyrene with clarity and rigidity.',
    summary: 'General-purpose polystyrene in granule form, appreciated for its clarity, rigidity and ease of moulding.',
    description: [
      'General-purpose polystyrene (GPPS) is a clear, rigid thermoplastic that moulds easily and reproduces fine detail well.',
      'Supplied as granules, it is used on its own or blended with HIPS where clarity and stiffness matter.',
    ],
    image: { url: '/media/products/gpps.webp', alt: 'Close-up of clear crystal polymer granules' },
    applications: ['Packaging and containers', 'Disposable cutlery and cups', 'Household and stationery items', 'Display cases and transparent housings', 'Lighting diffusers'],
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
      supporting: 'Delivering polymer solutions for evolving industrial requirements.',
      primaryCta: { label: 'Explore Products', href: '/products' },
      secondaryCta: { label: 'Connect With Our Team', href: '/contact' },
    },
    introduction: {
      eyebrow: 'Who we are',
      heading: 'A polymer partner for industrial buyers.',
      body: [
        'Arizen Polymers India Private Limited works in polymer manufacturing and distribution, with a portfolio of HIPS, ABS, HDPE and polystyrene granules for B2B clients, industrial buyers, manufacturers and suppliers.',
      ],
      cta: { label: 'About Arizen', href: '/about' },
    },
    products: {
      heading: 'A focused polymer portfolio.',
      intro: 'Four materials, each with its own specifications, grades and applications. Select a product to learn more or request a quote.',
    },
    strengths: {
      heading: 'Built around B2B buyers.',
      items: [
        { title: 'Focused portfolio', text: 'HIPS, ABS, HDPE and polystyrene granules, each presented with clear product information.' },
        { title: 'Direct inquiries', text: 'Request a quote for any product online. Every inquiry goes straight to the Arizen team.' },
        { title: 'Technical information', text: 'Specifications and grades for each product, published as they are confirmed and shared on request.' },
        { title: 'Industrial focus', text: 'Serving B2B clients, industrial buyers, manufacturers and suppliers.' },
      ],
    },
    infrastructure: {
      heading: 'Infrastructure for reliable supply.',
      body: '',
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
      body: 'Share your product, grade and quantity requirements and the Arizen team will respond with a quotation.',
      cta: { label: 'Request a Quote', href: '/request-quote' },
    },
    seo: seo(),
  },
  about: {
    heading: 'About Arizen Polymers',
    intro: 'Arizen Polymers India Private Limited works in polymer manufacturing and distribution for B2B clients, industrial buyers, manufacturers and suppliers.',
    profile: { heading: 'Company profile', body: [] },
    overview: {
      heading: 'Company overview',
      body: [],
      facts: [
        { label: 'Company', value: 'Arizen Polymers India Private Limited' },
        { label: 'Industry', value: 'Polymer manufacturing / distribution' },
        { label: 'Product range', value: 'HIPS · ABS · HDPE · Polystyrene granules' },
        { label: 'Customers', value: 'B2B clients, industrial buyers, manufacturers, suppliers' },
      ],
    },
    vision: '',
    mission: '',
    approach: { heading: 'Business approach', items: [] },
    values: { heading: 'Corporate values', items: [] },
    team: { heading: 'Our team', intro: '', members: [] },
    director: { heading: 'Director’s message', name: '', designation: 'Director', photo: { url: '', alt: '' }, message: [] },
    seo: seo('', 'Learn about Arizen Polymers India Private Limited, a polymer manufacturing and distribution company serving industrial buyers.'),
  },
  products: {
    heading: 'Products',
    intro: 'Polymer materials for industrial applications. Select a product to view its details, specifications and available grades, or request a quote.',
    note: 'Specifications and grades are published as confirmed by Arizen. For a full technical data sheet, request a quote.',
    seo: seo('', 'HIPS, ABS, HDPE and polystyrene granules from Arizen Polymers. View product details and request a quote.'),
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
    seo: seo('', 'Contact Arizen Polymers India Private Limited for HIPS, ABS, HDPE and polystyrene granule inquiries and quotations.'),
  },
  footer: {
    tagline: 'Polymer materials for industrial requirements: HIPS, ABS, HDPE and polystyrene granules.',
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
