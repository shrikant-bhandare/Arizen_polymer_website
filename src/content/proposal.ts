/**
 * Single source of truth for every word and figure in the proposal.
 * Both the interactive presentation and the print/PDF layout read from here,
 * so edit content in this file only.
 *
 * Values left as `null` are deliberately unfilled (contact details, portfolio
 * links). They render as clearly marked placeholders, never as invented facts.
 */
import hipsImage from '../assets/materials/hips.webp';
import absImage from '../assets/materials/abs.webp';
import hdpeImage from '../assets/materials/hdpe.webp';
import gppsImage from '../assets/materials/gpps.webp';
import hipsPrint from '../assets/materials/hips-print.jpg';
import absPrint from '../assets/materials/abs-print.jpg';
import hdpePrint from '../assets/materials/hdpe-print.jpg';
import gppsPrint from '../assets/materials/gpps-print.jpg';

export const meta = {
  client: 'Arizen Polymers India Private Limited',
  clientShort: 'Arizen Polymers',
  preparedBy: 'Neureonix',
  project: 'Corporate Website Design & Development Proposal',
  proposalNo: 'NP/2026-27/001',
  date: '02 November 2026',
  validityDays: 15,
  validUntil: '17 November 2026',
  pdfFileName: 'Arizen-Polymers-Website-Proposal-NP-2026-27-001.pdf',
};

/** Neureonix contact details. Fill these in before sending; null renders as a placeholder. */
export const contact: { label: string; value: string | null; href?: (v: string) => string }[] = [
  { label: 'Contact person', value: null },
  { label: 'Email', value: null, href: (v) => `mailto:${v}` },
  { label: 'Phone', value: null, href: (v) => `tel:${v.replace(/\s+/g, '')}` },
  { label: 'Website', value: null, href: (v) => (v.startsWith('http') ? v : `https://${v}`) },
];

export const hero = {
  eyebrow: 'Website Design & Development Proposal',
  headline: ['BUILDING A STRONGER', 'DIGITAL IDENTITY.'],
  supporting: 'A Strategic Website Development Proposal for Arizen Polymers India Private Limited.',
};

export const introduction = {
  heading: 'A Digital Foundation for the Next Stage of Growth.',
  lead:
    'For industrial buyers, a supplier’s website is often the first conversation. This proposal sets out how Neureonix will design and build a corporate website for Arizen Polymers India Private Limited — one credible destination that presents the company, its polymer portfolio and its capabilities, and turns visitor interest into qualified enquiries.',
  body:
    'The website will be built on a content management system, so the Arizen team can keep products, images and pages current without depending on a developer for every change.',
  outcomes: [
    { title: 'Corporate digital presence', text: 'Establish a strong, professional presence that reflects the company accurately.' },
    { title: 'Product showcase', text: 'Present the polymer portfolio in a clear, structured and searchable way.' },
    { title: 'Buyer confidence', text: 'Build confidence with industrial buyers through clarity, consistency and detail.' },
    { title: 'Qualified B2B enquiries', text: 'Turn interest into qualified enquiries through focused calls to action.' },
    { title: 'Capabilities on display', text: 'Present infrastructure and quality capabilities with supporting imagery.' },
    { title: 'Self-managed content', text: 'Manage products and content through a secure administrative dashboard.' },
  ],
};

export const understanding = {
  heading: 'Project Understanding',
  statement: 'A polymer business that needs a website as precise as its materials.',
  company: 'Arizen Polymers India Private Limited',
  industry: 'Polymer Manufacturing / Distribution',
  audience: ['B2B clients', 'Industrial buyers', 'Manufacturers', 'Suppliers'],
  requirements: [
    'Corporate website with six public sections',
    'Four product lines with dedicated presentation',
    'Inquiry capture and management',
    'CMS admin dashboard for ongoing updates',
  ],
};

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  /** JPEG copy for the PDF: print engines embed JPEG as-is but re-encode WebP losslessly. */
  printImage: string;
  imageAlt: string;
}

export const products = {
  heading: 'The Portfolio, Presented with Precision.',
  intro:
    'Each product line will have its own structured presence on the website. The descriptions below are general material characteristics for presentation; final product content, grades and specifications will be supplied by Arizen.',
  imageNote: 'Imagery shown is an illustrative material render, to be replaced with Arizen product photography.',
  pageIncludes: ['Product overview', 'Technical specifications (supplied by Arizen)', 'Product image gallery', 'Direct product inquiry'],
  items: [
    {
      id: 'hips',
      code: 'HIPS',
      name: 'High Impact Polystyrene',
      description:
        'A rubber-modified polystyrene valued for its toughness and ease of processing, commonly used for packaging, appliance components and display applications.',
      image: hipsImage,
      printImage: hipsPrint,
      imageAlt: 'Close-up render of opaque white polymer granules',
    },
    {
      id: 'abs',
      code: 'ABS',
      name: 'Acrylonitrile Butadiene Styrene',
      description:
        'An engineering thermoplastic known for its balance of rigidity, toughness and surface finish, widely used for housings, automotive parts and consumer products.',
      image: absImage,
      printImage: absPrint,
      imageAlt: 'Close-up render of ivory polymer granules',
    },
    {
      id: 'hdpe',
      code: 'HDPE',
      name: 'High-Density Polyethylene',
      description:
        'A high-density polyethylene recognised for its strength and chemical resistance, commonly processed into pipes, containers and moulded industrial products.',
      image: hdpeImage,
      printImage: hdpePrint,
      imageAlt: 'Close-up render of translucent milky polymer granules',
    },
    {
      id: 'gpps',
      code: 'PS',
      name: 'Polystyrene Granules',
      description:
        'General-purpose polystyrene in granule form, appreciated for its clarity, rigidity and ease of moulding across packaging, household and disposable products.',
      image: gppsImage,
      printImage: gppsPrint,
      imageAlt: 'Close-up render of clear crystal polymer granules',
    },
  ] satisfies Product[],
};

export interface ScopeArea {
  id: string;
  title: string;
  summary: string;
  items: string[];
  layout: 'home' | 'about' | 'catalog' | 'infrastructure' | 'quality' | 'contact' | 'admin';
}

export const scope = {
  heading: 'Website Scope of Work',
  intro: 'Six public sections and one private dashboard, designed as a single coherent platform.',
  areas: [
    {
      id: 'home',
      title: 'Home Page',
      summary: 'The first impression: who Arizen is, what it offers and how to get in touch.',
      items: ['Corporate hero section', 'Company introduction', 'Product highlights', 'Business strengths', 'Infrastructure overview', 'Inquiry CTA'],
      layout: 'home',
    },
    {
      id: 'about',
      title: 'About Us',
      summary: 'The people, purpose and direction behind the company.',
      items: ['Company profile', 'Vision and mission', 'Team introduction', 'Director’s Message'],
      layout: 'about',
    },
    {
      id: 'catalog',
      title: 'Product Catalog',
      summary: 'A structured catalogue that helps buyers find the right material quickly.',
      items: ['Product categories', 'Product details', 'Technical specifications supplied by client', 'Product images', 'Inquiry functionality'],
      layout: 'catalog',
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      summary: 'A visual overview of facilities and operational capability.',
      items: ['Facilities overview', 'Operational capabilities', 'Infrastructure images'],
      layout: 'infrastructure',
    },
    {
      id: 'quality',
      title: 'Quality Control',
      summary: 'How quality is assured, presented with verified client-supplied detail.',
      items: ['Quality assurance processes', 'Testing procedures', 'Verified certifications and standards supplied by the client'],
      layout: 'quality',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      summary: 'Every route for a buyer to reach the team.',
      items: ['Contact details', 'Inquiry form', 'Google Maps integration', 'Phone and email options'],
      layout: 'contact',
    },
    {
      id: 'admin',
      title: 'CMS Admin Dashboard',
      summary: 'A private, secure dashboard to manage the website without a developer.',
      items: [
        'Secure authentication',
        'Dashboard overview',
        'Product management',
        'Category management',
        'Website content management',
        'Image management',
        'Inquiry management',
        'SEO metadata management',
      ],
      layout: 'admin',
    },
  ] satisfies ScopeArea[],
};

export const features = {
  heading: 'Engineered for Performance, Security & Search.',
  intro: 'The technical capabilities included in the proposed build.',
  items: [
    { icon: 'responsive', title: 'Fully responsive design', text: 'Layouts crafted for desktop, tablet and mobile.' },
    { icon: 'cms', title: 'CMS-based content management', text: 'Update products and pages from the dashboard.' },
    { icon: 'auth', title: 'Secure admin authentication', text: 'Protected sign-in for authorised administrators.' },
    { icon: 'seo', title: 'SEO-friendly architecture', text: 'Clean URLs and semantic, crawlable structure.' },
    { icon: 'sitemap', title: 'Search engine sitemap', text: 'XML sitemap to help search engines index pages.' },
    { icon: 'robots', title: 'Robots.txt', text: 'Crawler rules configured for the live site.' },
    { icon: 'meta', title: 'Meta title & description management', text: 'Editable search metadata for each page.' },
    { icon: 'ssl', title: 'SSL configuration', text: 'HTTPS encryption across the entire website.' },
    { icon: 'performance', title: 'Performance optimisation', text: 'Optimised assets for fast loading.' },
    { icon: 'forms', title: 'Secure inquiry forms', text: 'Validated forms with protection against spam.' },
    { icon: 'backup', title: 'Backup strategy', text: 'A defined approach to protecting site data.' },
    { icon: 'deploy', title: 'Production deployment', text: 'Configured and launched on the live server.' },
  ] as const,
};

export const architecture = {
  heading: 'The Digital Foundation',
  intro:
    'How the proposed website will be put together, layer by layer. Everything described here is part of the planned build and will be delivered during the project.',
  layers: [
    {
      id: 'frontend',
      title: 'Frontend experience',
      text: 'A fast, responsive interface designed mobile-first, with clear typography and navigation tuned for industrial buyers on every screen size.',
    },
    {
      id: 'products',
      title: 'Product information architecture',
      text: 'Categories, products and specifications organised so a buyer can reach the right material, and send an inquiry about it, in a few steps.',
    },
    {
      id: 'inquiry',
      title: 'Inquiry processing',
      text: 'Validated, spam-protected inquiry forms whose submissions are stored in the dashboard for the team to review and follow up.',
    },
    {
      id: 'backend',
      title: 'Backend architecture',
      text: 'A secure application layer and database that serve products, categories, pages and inquiries to the website in a structured way.',
    },
    {
      id: 'cms',
      title: 'CMS management',
      text: 'A private admin dashboard where authorised staff manage products, categories, images, page content, inquiries and SEO metadata.',
    },
    {
      id: 'seo',
      title: 'SEO & performance',
      text: 'Managed meta titles and descriptions, an XML sitemap, robots.txt and optimised assets, so the website is fast and discoverable.',
    },
    {
      id: 'security',
      title: 'Security & deployment',
      text: 'SSL, secure authentication, a backup strategy and production deployment on domain and hosting registered under Arizen’s ownership.',
    },
  ],
};

export interface CostLine {
  description: string;
  amount: number;
}

export const commercial = {
  heading: 'AN INVESTMENT IN YOUR DIGITAL FUTURE.',
  caption: 'Total Website Design & Development Investment',
  gstNote: 'GST: Additional as applicable.',
  lines: [
    { description: 'UI/UX Design & Corporate Website Layout', amount: 15000 },
    { description: 'Frontend Website Development', amount: 20000 },
    { description: 'Backend Development & CMS Admin Dashboard', amount: 22000 },
    { description: 'Product Catalog & Inquiry Management', amount: 12000 },
    { description: 'Testing, Optimization & SEO Setup', amount: 8000 },
    { description: 'Deployment, SSL & Production Configuration', amount: 8000 },
  ] satisfies CostLine[],
};

export const projectTotal = commercial.lines.reduce((sum, line) => sum + line.amount, 0);

export interface Stage {
  title: string;
  days: string;
  detail: string;
}

export const timeline = {
  heading: 'FROM CONCEPT TO LAUNCH.',
  durationRange: '25–33',
  durationUnit: 'working days',
  get duration() {
    return `${this.durationRange} ${this.durationUnit}`;
  },
  stages: [
    {
      title: 'Requirement Analysis & UI/UX Design',
      days: '5–7 Days',
      detail: 'Confirm requirements and site structure, then design the key page layouts for review. Two rounds of design revisions are included.',
    },
    {
      title: 'Frontend Development',
      days: '7–8 Days',
      detail: 'Build the approved designs as a fully responsive website across desktop, tablet and mobile.',
    },
    {
      title: 'Backend & CMS Development',
      days: '7–8 Days',
      detail: 'Develop the database, secure authentication and CMS admin dashboard for products, content, images, inquiries and SEO.',
    },
    {
      title: 'Integration, Testing & SEO',
      days: '5–6 Days',
      detail: 'Connect the frontend to the CMS, test forms and devices, optimise performance and configure SEO essentials.',
    },
    {
      title: 'Client Review & Deployment',
      days: '3–4 Days',
      detail: 'Final review with the Arizen team, then SSL-enabled production deployment and handover.',
    },
  ] satisfies Stage[],
};

export interface Milestone {
  percent: number;
  amount: number;
  label: string;
}

export const payments = {
  heading: 'A CLEAR & TRANSPARENT ENGAGEMENT.',
  milestones: [
    { percent: 40, amount: 34000, label: 'Project Confirmation & Initiation' },
    { percent: 30, amount: 25500, label: 'Design Approval & Development Progress' },
    { percent: 20, amount: 17000, label: 'Final Testing & Client Approval' },
    { percent: 10, amount: 8500, label: 'Production Deployment & Handover' },
  ] satisfies Milestone[],
};

export interface RecurringLine {
  service: string;
  cost: string;
  min: number;
  max: number;
  optional?: boolean;
}

export const recurring = {
  heading: 'Annual Recurring Costs',
  intro: 'Estimated yearly running costs after launch. These are separate from the project investment.',
  lines: [
    { service: 'Domain Registration', cost: '₹1,000–₹1,500', min: 1000, max: 1500 },
    { service: 'Website Hosting / Cloud Server', cost: '₹8,000–₹12,000', min: 8000, max: 12000 },
    { service: 'SSL Certificate', cost: 'Free (Let’s Encrypt)', min: 0, max: 0 },
    { service: 'Optional Technical Maintenance', cost: '₹18,000', min: 18000, max: 18000, optional: true },
  ] satisfies RecurringLine[],
  totalLabel: 'Estimated annual total with optional maintenance',
  maintenance: {
    title: 'Optional Technical Maintenance',
    price: '₹18,000',
    period: 'per year',
    coverage: [
      'Website availability monitoring',
      'Basic technical troubleshooting',
      'Security and dependency updates',
      'Minor content updates',
      'Backup monitoring',
    ],
  },
  note: 'Domain, hosting and other third-party prices are indicative estimates. Actual third-party prices may vary.',
};

export const recurringTotal = {
  min: recurring.lines.reduce((s, l) => s + l.min, 0),
  max: recurring.lines.reduce((s, l) => s + l.max, 0),
};

export const deliverables = {
  heading: 'What You Receive.',
  items: [
    'Fully functional corporate website',
    'Responsive design',
    'CMS admin dashboard',
    'Product and category management',
    'Inquiry management',
    'Basic SEO configuration',
    'SSL-enabled production deployment',
    'Source code handover',
    'Admin credentials',
    'Admin usage guidance',
    '30 days of post-launch bug-fix support',
  ],
};

export const terms = {
  heading: 'Terms & Conditions',
  items: [
    'Client provides company logo, brand assets, product images, and content.',
    'Two rounds of design revisions are included.',
    'Additional functionality outside agreed scope is charged separately.',
    'Premium licenses and third-party API charges are excluded unless specified.',
    'Timelines depend on timely client feedback and content submission.',
    'Domain and hosting should be registered under client ownership.',
    `Quotation validity: 15 days (valid until ${meta.validUntil}).`,
    'Final source-code handover after full payment.',
    'Maintenance is optional and separate.',
  ],
};

export interface PortfolioItem {
  title: string;
  url: string;
  image?: string;
  summary?: string;
}

/**
 * Real project references only. Leave empty to show the
 * "Portfolio References Available Upon Request" layout.
 */
export const portfolio: { heading: string; text: string; items: PortfolioItem[] } = {
  heading: 'Portfolio References Available Upon Request.',
  text: 'Relevant project references, live links and case material can be shared on request, ahead of or alongside a discussion of this proposal.',
  items: [],
};

export const closing = {
  headline: ['LET’S BUILD SOMETHING', 'EXCEPTIONAL TOGETHER.'],
  supporting:
    'We look forward to partnering with Arizen Polymers India Private Limited to create a strong, professional, and future-ready digital presence.',
  acceptance: `We accept the scope, commercials and terms set out in Proposal ${meta.proposalNo}.`,
};
