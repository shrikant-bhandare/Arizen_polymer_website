import { Schema, model, type InferSchemaType } from 'mongoose';
import { inquiryStatuses } from '../../../shared/schemas';

const noteSchema = new Schema(
  {
    kind: { type: String, enum: ['note', 'status'], default: 'note' },
    text: { type: String, required: true },
    authorName: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const inquirySchema = new Schema(
  {
    fullName: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    /** Product name at the time of the inquiry, kept even if the product is later renamed or removed. */
    productName: { type: String, default: '' },
    quantity: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, enum: inquiryStatuses, default: 'new' },
    notes: { type: [noteSchema], default: [] },
    sourcePath: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    notification: {
      sent: { type: Boolean, default: false },
      error: { type: String, default: '' },
    },
  },
  { timestamps: true },
);
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ product: 1, createdAt: -1 });

export type InquiryDoc = InferSchemaType<typeof inquirySchema>;
export const Inquiry = model('Inquiry', inquirySchema, 'inquiries');
