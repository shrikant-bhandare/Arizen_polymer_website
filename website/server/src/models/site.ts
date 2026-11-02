import { Schema, model, type InferSchemaType } from 'mongoose';
import { contentKeys } from '../../../shared/content';

/** One document per editable page; `data` is validated against shared/content.ts before saving. */
const websiteContentSchema = new Schema(
  {
    key: { type: String, enum: contentKeys, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true, minimize: false },
);

const mediaAssetSchema = new Schema(
  {
    url: { type: String, required: true, unique: true },
    originalName: { type: String, default: '' },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    variants: {
      type: [{ width: Number, format: String, url: String, size: Number, _id: false }],
      default: [],
    },
    uploadedBy: { type: String, default: '' },
  },
  { timestamps: true },
);
mediaAssetSchema.index({ createdAt: -1 });

/** Singleton (key: 'site') for company details, notification recipients and SEO defaults. */
const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: 'site', unique: true },
    companyName: { type: String, default: 'Arizen Polymers India Private Limited' },
    shortName: { type: String, default: 'Arizen Polymers' },
    logo: { url: { type: String, default: '' }, alt: { type: String, default: '' } },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    businessHours: { type: String, default: '' },
    mapQuery: { type: String, default: '' },
    social: { type: [{ label: String, href: String, _id: false }], default: [] },
    notificationEmails: { type: [String], default: [] },
    siteUrl: { type: String, default: '' },
    defaultSeo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      ogImage: { type: String, default: '' },
      canonical: { type: String, default: '' },
    },
    showPlaceholders: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;
export const WebsiteContent = model('WebsiteContent', websiteContentSchema, 'websitecontent');
export const MediaAsset = model('MediaAsset', mediaAssetSchema, 'mediaassets');
export const SiteSettings = model('SiteSettings', siteSettingsSchema, 'sitesettings');
