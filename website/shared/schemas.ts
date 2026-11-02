/** Validation shared by the public site, the admin dashboard and the API. */
import { z } from 'zod';
import { imageRef, safeHref, seoSchema } from './fields';

export { imageRef, safeHref, seoSchema };

const str = (min: number, max: number, message?: string) => z.string().trim().min(min, message).max(max);

/* ------------------------------------------------------------------ Inquiries */

export const inquiryStatuses = ['new', 'contacted', 'in_discussion', 'quotation_sent', 'converted', 'closed'] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];
export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_discussion: 'In Discussion',
  quotation_sent: 'Quotation Sent',
  converted: 'Converted',
  closed: 'Closed',
};

export const PHONE_PATTERN = /^\+?[0-9 ()\-.]{7,20}$/;

/** What a visitor submits. The same schema validates in the browser and on the server. */
export const inquiryInput = z.object({
  fullName: str(2, 100, 'Please enter your full name'),
  companyName: str(2, 150, 'Please enter your company name'),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email('Please enter a valid business email')),
  phone: z.string().trim().regex(PHONE_PATTERN, 'Please enter a valid phone number, e.g. +91 98765 43210'),
  product: z.string().trim().max(120).default(''),
  quantity: z.string().trim().max(60).default(''),
  message: str(10, 2000, 'Please add a few words about your requirement (at least 10 characters)'),
});
export type InquiryInput = z.input<typeof inquiryInput>;

/** Anti-spam fields sent alongside the inquiry; never stored. */
export const inquiryGuard = z.object({
  /** Honeypot: hidden from people, filled by naive bots. Must stay empty. */
  website: z.string().max(0).optional().default(''),
  /** Milliseconds since the form was rendered. Humans take longer than bots. */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export const inquiryUpdate = z.object({ status: z.enum(inquiryStatuses) }).strict();
export const inquiryNote = z.object({ text: str(1, 2000, 'Note cannot be empty') }).strict();

/* ------------------------------------------------------------------ Catalogue */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().trim().toLowerCase().max(80).regex(SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens, e.g. high-impact-polystyrene');

export const categoryInput = z
  .object({
    name: str(2, 80),
    slug,
    description: z.string().trim().max(600).default(''),
    image: imageRef.default({ url: '', alt: '' }),
    order: z.number().int().min(0).max(999).default(0),
    isActive: z.boolean().default(true),
  })
  .strict();
export type CategoryInput = z.input<typeof categoryInput>;

export const specificationRow = z
  .object({
    property: str(1, 120),
    value: str(1, 120),
    unit: z.string().trim().max(40).default(''),
    testMethod: z.string().trim().max(80).default(''),
  })
  .strict();

export const gradeRow = z
  .object({
    name: str(1, 80),
    description: z.string().trim().max(400).default(''),
  })
  .strict();

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

export const productInput = z
  .object({
    name: str(2, 120),
    code: str(1, 20),
    slug,
    category: objectId.nullable().default(null),
    tagline: z.string().trim().max(160).default(''),
    /** Signature colour for the product's card and page, e.g. #1F4E9C. Empty uses the site default. */
    accent: z.union([z.literal(''), z.string().trim().regex(/^#[0-9a-f]{6}$/i, 'Use a colour code like #1F4E9C')]).default(''),
    summary: z.string().trim().max(400).default(''),
    description: z.array(z.string().trim().max(3000)).max(20).default([]),
    image: imageRef.default({ url: '', alt: '' }),
    gallery: z.array(imageRef).max(12).default([]),
    specifications: z.array(specificationRow).max(60).default([]),
    specificationsNote: z.string().trim().max(400).default(''),
    grades: z.array(gradeRow).max(40).default([]),
    applications: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
    relatedProducts: z.array(objectId).max(8).default([]),
    status: z.enum(['draft', 'published']).default('draft'),
    order: z.number().int().min(0).max(999).default(0),
    seo: seoSchema.default({ title: '', description: '', ogImage: '', canonical: '' }),
  })
  .strict();
export type ProductInput = z.input<typeof productInput>;

/* ------------------------------------------------------------------ Settings */

export const siteSettingsInput = z
  .object({
    companyName: str(2, 120),
    shortName: str(2, 60),
    logo: imageRef.default({ url: '', alt: '' }),
    address: z.string().trim().max(400).default(''),
    email: z.union([z.literal(''), z.email()]).default(''),
    phone: z.union([z.literal(''), z.string().trim().regex(PHONE_PATTERN)]).default(''),
    phone2: z.union([z.literal(''), z.string().trim().regex(PHONE_PATTERN)]).default(''),
    whatsapp: z.union([z.literal(''), z.string().trim().regex(PHONE_PATTERN)]).default(''),
    businessHours: z.string().trim().max(160).default(''),
    mapQuery: z.string().trim().max(300).default(''),
    social: z
      .array(z.object({ label: str(1, 40), href: safeHref }).strict())
      .max(10)
      .default([]),
    notificationEmails: z.array(z.email()).max(10).default([]),
    siteUrl: z.union([z.literal(''), z.url({ protocol: /^https?$/ })]).default(''),
    defaultSeo: seoSchema.default({ title: '', description: '', ogImage: '', canonical: '' }),
    showPlaceholders: z.boolean().default(true),
  })
  .strict();
export type SiteSettingsInput = z.input<typeof siteSettingsInput>;

/* ------------------------------------------------------------------ Users */

export const roles = ['admin', 'editor'] as const;
export type Role = (typeof roles)[number];

export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters')
  .max(128)
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

export const loginInput = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) }).strict();

export const userCreateInput = z
  .object({ name: str(2, 80), email: z.email().max(254), role: z.enum(roles), password: passwordSchema })
  .strict();

export const userUpdateInput = z
  .object({ name: str(2, 80).optional(), role: z.enum(roles).optional(), isActive: z.boolean().optional(), password: passwordSchema.optional() })
  .strict();

export const mediaUpdateInput = z.object({ alt: z.string().trim().max(200), caption: z.string().trim().max(300).default('') }).strict();
