import { z } from 'zod';
import { contentKeys, contentSchemas, type ContentKey } from '../../../shared/content';
import { siteSettingsInput } from '../../../shared/schemas';
import { SiteSettings, WebsiteContent } from '../models/site';

/** Stored content for a page, normalised through its schema so new fields always have defaults. */
export async function getContent(key: ContentKey): Promise<Record<string, unknown>> {
  const doc = await WebsiteContent.findOne({ key }).lean();
  const parsed = contentSchemas[key].safeParse(doc?.data ?? {});
  // Content saved under an older schema still renders: fall back to defaults field by field.
  return parsed.success ? parsed.data : contentSchemas[key].parse({});
}

export async function getContentMeta(): Promise<{ key: ContentKey; updatedAt: Date | null; updatedBy: string }[]> {
  const docs = await WebsiteContent.find({}, { key: 1, updatedAt: 1, updatedBy: 1 }).lean();
  return contentKeys.map((key) => {
    const d = docs.find((x) => x.key === key);
    return { key, updatedAt: d?.updatedAt ?? null, updatedBy: d?.updatedBy ?? '' };
  });
}

/** Same fields as the input schema, but unknown database fields (_id, timestamps) are dropped, not rejected. */
const settingsReader = z.object(siteSettingsInput.shape);

export async function getSettings() {
  const doc = await SiteSettings.findOne({ key: 'site' }).lean();
  return settingsReader.parse({ companyName: 'Arizen Polymers India Private Limited', shortName: 'Arizen Polymers', ...doc });
}

/** The subset of settings safe to expose publicly (no notification recipients). */
export async function getPublicSettings() {
  const { notificationEmails: _n, ...rest } = await getSettings();
  void _n;
  return rest;
}
