import type { ContentMap, Img, SeoFields } from '@shared/content';
import type { InquiryStatus, Role } from '@shared/schemas';

export type { ContentMap, Img, SeoFields };

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: Img;
  order: number;
  isActive: boolean;
  productCount?: number;
  updatedAt?: string;
}

export interface ProductCard {
  _id: string;
  name: string;
  code: string;
  slug: string;
  tagline: string;
  accent: string;
  summary: string;
  image: Img;
  category: string | null;
  order: number;
}

export interface Product extends Omit<ProductCard, 'category'> {
  category: { _id: string; name: string; slug: string } | null;
  description: string[];
  gallery: Img[];
  specifications: { property: string; value: string; unit: string; testMethod: string }[];
  specificationsNote: string;
  grades: { name: string; description: string }[];
  applications: string[];
  related: ProductCard[];
  seo: SeoFields;
  updatedAt: string;
}

export interface SiteSettings {
  companyName: string;
  shortName: string;
  logo: Img;
  address: string;
  email: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  businessHours: string;
  mapQuery: string;
  social: { label: string; href: string }[];
  siteUrl: string;
  defaultSeo: SeoFields;
  showPlaceholders: boolean;
}

export interface SiteData {
  settings: SiteSettings;
  navigation: ContentMap['navigation'];
  footer: ContentMap['footer'];
  categories: Category[];
  products: ProductCard[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface InquiryNote {
  _id: string;
  kind: 'note' | 'status';
  text: string;
  authorName: string;
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  product: string | { _id: string; name: string; slug: string } | null;
  productName: string;
  quantity: string;
  message: string;
  status: InquiryStatus;
  notes: InquiryNote[];
  sourcePath: string;
  notification: { sent: boolean; error: string };
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  _id: string;
  url: string;
  originalName: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  caption: string;
  variants: { width: number; format: string; url: string; size: number }[];
  uploadedBy: string;
  createdAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
