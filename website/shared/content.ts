/**
 * Every CMS-editable page, described once. The server validates against these,
 * the admin dashboard builds its forms from them, and the public site reads the
 * stored values.
 */
import type { z } from 'zod';
import { schemaFor, type Field } from './fields';

const seo: Field = { key: 'seo', label: 'Search engine & sharing', type: 'seo' };
const heading = (label = 'Heading'): Field => ({ key: 'heading', label, type: 'text', max: 160 });
const intro: Field = { key: 'intro', label: 'Introduction', type: 'text', multiline: true, max: 800 };
const titledItems = (key: string, label: string, itemLabel: string): Field => ({
  key,
  label,
  type: 'list',
  itemLabel,
  item: [
    { key: 'title', label: 'Title', type: 'text', max: 120 },
    { key: 'text', label: 'Text', type: 'text', multiline: true, max: 800 },
  ],
});
const imageSection = (key: string, label: string): Field => ({
  key,
  label,
  type: 'group',
  fields: [
    { key: 'heading', label: 'Heading', type: 'text', max: 120 },
    { key: 'body', label: 'Body', type: 'paragraphs' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'imageIsConceptual', label: 'Image is a conceptual illustration (not Arizen’s premises)', type: 'boolean' },
  ],
});

export const contentPages = {
  home: {
    label: 'Homepage',
    path: '/',
    fields: [
      {
        key: 'hero',
        label: 'Hero',
        type: 'group',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 80 },
          { key: 'headline', label: 'Headline', type: 'text', max: 120, help: 'Use a line break (Enter) to split lines.', multiline: true },
          { key: 'supporting', label: 'Supporting text', type: 'text', multiline: true, max: 300 },
          { key: 'primaryCta', label: 'Primary button', type: 'link' },
          { key: 'secondaryCta', label: 'Secondary button', type: 'link' },
        ],
      },
      {
        key: 'introduction',
        label: 'Company introduction',
        type: 'group',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text', max: 80 },
          heading(),
          { key: 'body', label: 'Body', type: 'paragraphs' },
          { key: 'cta', label: 'Link', type: 'link' },
        ],
      },
      {
        key: 'products',
        label: 'Product showcase',
        type: 'group',
        fields: [heading(), intro],
      },
      {
        key: 'strengths',
        label: 'Business strengths',
        type: 'group',
        fields: [heading(), titledItems('items', 'Strengths', 'Strength')],
      },
      {
        key: 'infrastructure',
        label: 'Infrastructure preview',
        type: 'group',
        fields: [
          heading(),
          { key: 'body', label: 'Body', type: 'text', multiline: true, max: 800 },
          { key: 'image', label: 'Image', type: 'image' },
          { key: 'imageIsConceptual', label: 'Image is a conceptual illustration', type: 'boolean' },
          { key: 'cta', label: 'Link', type: 'link' },
        ],
      },
      {
        key: 'quality',
        label: 'Quality commitment',
        type: 'group',
        fields: [heading(), { key: 'body', label: 'Body', type: 'text', multiline: true, max: 800 }, { key: 'points', label: 'Points', type: 'strings' }, { key: 'cta', label: 'Link', type: 'link' }],
      },
      {
        key: 'inquiry',
        label: 'B2B inquiry call to action',
        type: 'group',
        fields: [heading(), { key: 'body', label: 'Body', type: 'text', multiline: true, max: 400 }, { key: 'cta', label: 'Button', type: 'link' }],
      },
      seo,
    ],
  },
  about: {
    label: 'About Us',
    path: '/about',
    fields: [
      heading('Page heading'),
      intro,
      {
        key: 'profile',
        label: 'Company profile',
        type: 'group',
        fields: [heading(), { key: 'body', label: 'Body', type: 'paragraphs' }],
      },
      {
        key: 'overview',
        label: 'Company overview',
        type: 'group',
        fields: [
          heading(),
          { key: 'body', label: 'Body', type: 'paragraphs' },
          {
            key: 'facts',
            label: 'Key facts',
            type: 'list',
            itemLabel: 'Fact',
            help: 'Only verified facts, e.g. year established or location.',
            item: [
              { key: 'label', label: 'Label', type: 'text', max: 60 },
              { key: 'value', label: 'Value', type: 'text', max: 120 },
            ],
          },
        ],
      },
      {
        key: 'sustainability',
        label: 'Journey towards sustainability',
        type: 'group',
        fields: [heading(), { key: 'body', label: 'Body', type: 'paragraphs' }],
      },
      { key: 'vision', label: 'Vision', type: 'text', multiline: true, max: 800 },
      { key: 'mission', label: 'Mission', type: 'text', multiline: true, max: 800 },
      {
        key: 'values',
        label: 'Environmental commitment',
        type: 'group',
        fields: [
          heading(),
          { key: 'intro', label: 'Introduction', type: 'text', multiline: true, max: 600 },
          titledItems('items', 'Commitments', 'Commitment'),
          { key: 'note', label: 'Closing note', type: 'text', multiline: true, max: 600 },
        ],
      },
      {
        key: 'approach',
        label: 'Commitment to customers',
        type: 'group',
        fields: [heading(), { key: 'intro', label: 'Introduction', type: 'text', multiline: true, max: 800 }, titledItems('items', 'Points', 'Point')],
      },
      {
        key: 'closing',
        label: 'Closing statement',
        type: 'group',
        fields: [heading(), { key: 'body', label: 'Body', type: 'paragraphs' }, { key: 'signoff', label: 'Sign-off line', type: 'text', max: 160 }],
      },
      {
        key: 'team',
        label: 'Team',
        type: 'group',
        fields: [
          heading(),
          intro,
          {
            key: 'members',
            label: 'Team members',
            type: 'list',
            itemLabel: 'Member',
            item: [
              { key: 'name', label: 'Name', type: 'text', max: 80 },
              { key: 'role', label: 'Role', type: 'text', max: 80 },
              { key: 'photo', label: 'Photo', type: 'image' },
            ],
          },
        ],
      },
      {
        key: 'director',
        label: 'Director’s message',
        type: 'group',
        fields: [
          heading(),
          { key: 'name', label: 'Director’s name', type: 'text', max: 80 },
          { key: 'designation', label: 'Designation', type: 'text', max: 80 },
          { key: 'photo', label: 'Photograph', type: 'image' },
          { key: 'message', label: 'Message', type: 'paragraphs' },
        ],
      },
      seo,
    ],
  },
  products: {
    label: 'Products page',
    path: '/products',
    fields: [heading('Page heading'), intro, { key: 'note', label: 'Specifications note', type: 'text', multiline: true, max: 400 }, seo],
  },
  infrastructure: {
    label: 'Infrastructure',
    path: '/infrastructure',
    fields: [
      heading('Page heading'),
      intro,
      imageSection('facilities', 'Facilities overview'),
      imageSection('storage', 'Storage infrastructure'),
      imageSection('distribution', 'Distribution capabilities'),
      imageSection('handling', 'Material handling'),
      { key: 'processes', label: 'Operational processes', type: 'group', fields: [heading(), titledItems('steps', 'Process steps', 'Step')] },
      {
        key: 'gallery',
        label: 'Image gallery',
        type: 'list',
        itemLabel: 'Image',
        max: 40,
        item: [
          { key: 'image', label: 'Image', type: 'image' },
          { key: 'caption', label: 'Caption', type: 'text', max: 160 },
          { key: 'isConceptual', label: 'Conceptual illustration', type: 'boolean' },
        ],
      },
      seo,
    ],
  },
  quality: {
    label: 'Quality Control',
    path: '/quality',
    fields: [
      heading('Page heading'),
      intro,
      { key: 'philosophy', label: 'Quality philosophy', type: 'group', fields: [heading(), { key: 'body', label: 'Body', type: 'paragraphs' }] },
      { key: 'processes', label: 'Quality assurance processes', type: 'group', fields: [heading(), titledItems('items', 'Processes', 'Process')] },
      { key: 'testing', label: 'Testing procedures', type: 'group', fields: [heading(), titledItems('items', 'Procedures', 'Procedure')] },
      { key: 'documentation', label: 'Quality documentation', type: 'group', fields: [heading(), { key: 'body', label: 'Body', type: 'paragraphs' }, { key: 'documents', label: 'Documents provided', type: 'strings' }] },
      {
        key: 'certifications',
        label: 'Certifications & standards',
        type: 'group',
        fields: [
          heading(),
          {
            key: 'items',
            label: 'Certifications',
            type: 'list',
            itemLabel: 'Certification',
            help: 'Add only certifications Arizen holds and can evidence. Unverified entries are never shown on the website.',
            item: [
              { key: 'name', label: 'Name / standard', type: 'text', max: 120 },
              { key: 'issuer', label: 'Issued by', type: 'text', max: 120 },
              { key: 'validUntil', label: 'Valid until', type: 'text', max: 40 },
              { key: 'image', label: 'Certificate image', type: 'image' },
              { key: 'verified', label: 'Verified by Arizen — show on website', type: 'boolean' },
            ],
          },
        ],
      },
      { key: 'image', label: 'Supporting image', type: 'image' },
      { key: 'imageIsConceptual', label: 'Image is a conceptual illustration', type: 'boolean' },
      seo,
    ],
  },
  contact: {
    label: 'Contact Us',
    path: '/contact',
    fields: [heading('Page heading'), intro, { key: 'formHeading', label: 'Form heading', type: 'text', max: 120 }, { key: 'businessCta', label: 'Business inquiry note', type: 'text', multiline: true, max: 400 }, seo],
  },
  footer: {
    label: 'Footer',
    path: null,
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text', multiline: true, max: 300 },
      { key: 'ctaHeading', label: 'Footer call to action', type: 'text', max: 120 },
      { key: 'legal', label: 'Legal line', type: 'text', max: 200, help: 'The © year is added automatically.' },
    ],
  },
  navigation: {
    label: 'Navigation',
    path: null,
    fields: [
      {
        key: 'items',
        label: 'Menu items',
        type: 'list',
        itemLabel: 'Menu item',
        max: 10,
        item: [
          { key: 'label', label: 'Label', type: 'text', max: 40 },
          { key: 'href', label: 'Link', type: 'text', format: 'href', placeholder: '/products' },
          { key: 'visible', label: 'Visible', type: 'boolean' },
        ],
      },
      { key: 'ctaLabel', label: 'Header button label', type: 'text', max: 40 },
    ],
  },
} satisfies Record<string, { label: string; path: string | null; fields: Field[] }>;

export type ContentKey = keyof typeof contentPages;
export const contentKeys = Object.keys(contentPages) as ContentKey[];

export const contentSchemas = Object.fromEntries(contentKeys.map((k) => [k, schemaFor(contentPages[k].fields)])) as Record<ContentKey, z.ZodObject>;

/* Typed shapes the public site renders. Kept explicit so components get real types. */
export interface Link {
  label: string;
  href: string;
}
export interface Img {
  url: string;
  alt: string;
}
export interface TitledItem {
  title: string;
  text: string;
}
export interface SeoFields {
  title: string;
  description: string;
  ogImage: string;
  canonical: string;
}
interface ImageSection {
  heading: string;
  body: string[];
  image: Img;
  imageIsConceptual: boolean;
}

export interface ContentMap {
  home: {
    hero: { eyebrow: string; headline: string; supporting: string; primaryCta: Link; secondaryCta: Link };
    introduction: { eyebrow: string; heading: string; body: string[]; cta: Link };
    products: { heading: string; intro: string };
    strengths: { heading: string; items: TitledItem[] };
    infrastructure: { heading: string; body: string; image: Img; imageIsConceptual: boolean; cta: Link };
    quality: { heading: string; body: string; points: string[]; cta: Link };
    inquiry: { heading: string; body: string; cta: Link };
    seo: SeoFields;
  };
  about: {
    heading: string;
    intro: string;
    profile: { heading: string; body: string[] };
    overview: { heading: string; body: string[]; facts: { label: string; value: string }[] };
    sustainability: { heading: string; body: string[] };
    vision: string;
    mission: string;
    values: { heading: string; intro: string; items: TitledItem[]; note: string };
    approach: { heading: string; intro: string; items: TitledItem[] };
    closing: { heading: string; body: string[]; signoff: string };
    team: { heading: string; intro: string; members: { name: string; role: string; photo: Img }[] };
    director: { heading: string; name: string; designation: string; photo: Img; message: string[] };
    seo: SeoFields;
  };
  products: { heading: string; intro: string; note: string; seo: SeoFields };
  infrastructure: {
    heading: string;
    intro: string;
    facilities: ImageSection;
    storage: ImageSection;
    distribution: ImageSection;
    handling: ImageSection;
    processes: { heading: string; steps: TitledItem[] };
    gallery: { image: Img; caption: string; isConceptual: boolean }[];
    seo: SeoFields;
  };
  quality: {
    heading: string;
    intro: string;
    philosophy: { heading: string; body: string[] };
    processes: { heading: string; items: TitledItem[] };
    testing: { heading: string; items: TitledItem[] };
    documentation: { heading: string; body: string[]; documents: string[] };
    certifications: { heading: string; items: { name: string; issuer: string; validUntil: string; image: Img; verified: boolean }[] };
    image: Img;
    imageIsConceptual: boolean;
    seo: SeoFields;
  };
  contact: { heading: string; intro: string; formHeading: string; businessCta: string; seo: SeoFields };
  footer: { tagline: string; ctaHeading: string; legal: string };
  navigation: { items: { label: string; href: string; visible: boolean }[]; ctaLabel: string };
}
