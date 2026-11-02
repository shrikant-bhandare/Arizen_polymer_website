import { Schema, model, type InferSchemaType } from 'mongoose';

const image = { url: { type: String, default: '' }, alt: { type: String, default: '' } };
const seo = {
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  canonical: { type: String, default: '' },
};

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
categorySchema.index({ order: 1, name: 1 });

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
    tagline: { type: String, default: '' },
    accent: { type: String, default: '' },
    summary: { type: String, default: '' },
    description: { type: [String], default: [] },
    image,
    gallery: { type: [new Schema(image, { _id: false })], default: [] },
    specifications: {
      type: [{ property: String, value: String, unit: String, testMethod: String, _id: false }],
      default: [],
    },
    specificationsNote: { type: String, default: '' },
    grades: { type: [{ name: String, description: String, _id: false }], default: [] },
    applications: { type: [String], default: [] },
    relatedProducts: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    order: { type: Number, default: 0 },
    seo,
  },
  { timestamps: true },
);
// The public catalogue always filters on status and sorts by order.
productSchema.index({ status: 1, order: 1 });
productSchema.index({ category: 1 });

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const ProductCategory = model('ProductCategory', categorySchema, 'productcategories');
export const Product = model('Product', productSchema, 'products');
