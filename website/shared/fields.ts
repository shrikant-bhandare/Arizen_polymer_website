/**
 * A small field-descriptor language for CMS content.
 *
 * Each editable page is described once (see content.ts). From that single
 * description the server derives its validation schema, the admin dashboard
 * renders its editing form, and the seed script fills in defaults. Adding a
 * field therefore needs one change, in one place.
 */
import { z } from 'zod';

interface Base {
  key: string;
  label: string;
  help?: string;
}

export type Field =
  | (Base & { type: 'text'; max?: number; multiline?: boolean; placeholder?: string; format?: 'href' })
  | (Base & { type: 'paragraphs'; max?: number })
  | (Base & { type: 'strings'; max?: number })
  | (Base & { type: 'image' })
  | (Base & { type: 'link' })
  | (Base & { type: 'boolean' })
  | (Base & { type: 'seo' })
  | (Base & { type: 'group'; fields: Field[] })
  | (Base & { type: 'list'; item: Field[]; max?: number; itemLabel?: string });

/** Internal paths, http(s), mail and phone links only — never javascript: or data: URLs. */
const SAFE_HREF = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
/** Images come from the media library, the bundled assets, or an https URL. */
const SAFE_IMAGE = /^(\/(?!\/)|https:\/\/)/i;

export const safeHref = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || SAFE_HREF.test(v), 'Use a path such as /products, or an http(s), mailto: or tel: link');

export const imageRef = z.object({
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || SAFE_IMAGE.test(v), 'Choose an image from the media library'),
  alt: z.string().trim().max(200).default(''),
});
export type ImageRef = z.infer<typeof imageRef>;

export const seoSchema = z.object({
  title: z.string().trim().max(70).default(''),
  description: z.string().trim().max(170).default(''),
  ogImage: z.string().trim().max(500).refine((v) => v === '' || SAFE_IMAGE.test(v), 'Choose an image from the media library').default(''),
  canonical: z.string().trim().max(500).refine((v) => v === '' || /^https:\/\//i.test(v), 'Canonical URLs must start with https://').default(''),
});
export type Seo = z.infer<typeof seoSchema>;

const text = (max = 2000) => z.string().trim().max(max);

/** Build a strict Zod schema from field descriptors. Unknown keys are rejected. */
export function schemaFor(fields: Field[]): z.ZodObject {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) shape[f.key] = fieldSchema(f);
  return z.strictObject(shape);
}

function fieldSchema(f: Field): z.ZodType {
  switch (f.type) {
    case 'text':
      return f.format === 'href' ? safeHref.default('') : text(f.max ?? (f.multiline ? 2000 : 200)).default('');
    case 'paragraphs':
      return z.array(text(3000)).max(f.max ?? 20).default([]);
    case 'strings':
      return z.array(text(200)).max(f.max ?? 40).default([]);
    case 'image':
      return imageRef.default({ url: '', alt: '' });
    case 'link':
      return z.object({ label: text(60).default(''), href: safeHref.default('') }).default({ label: '', href: '' });
    case 'boolean':
      return z.boolean().default(false);
    case 'seo':
      return seoSchema.default({ title: '', description: '', ogImage: '', canonical: '' });
    case 'group':
      return schemaFor(f.fields).default(defaultsFor(f.fields) as never);
    case 'list':
      return z.array(schemaFor(f.item)).max(f.max ?? 30).default([]);
  }
}

/** Empty value for every field — used for new list items and missing content. */
export function defaultsFor(fields: Field[]): Record<string, unknown> {
  return schemaFor(fields).parse({});
}
