import { Schema, model, type InferSchemaType } from 'mongoose';
import { roles } from '../../../shared/schemas';

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: roles, default: 'editor', required: true },
    isActive: { type: Boolean, default: true },
    /** Incremented on logout or password change to revoke every existing session. */
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

adminUserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    delete ret.tokenVersion;
    delete ret.__v;
    return ret;
  },
});

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>;
export const AdminUser = model('AdminUser', adminUserSchema, 'adminusers');
