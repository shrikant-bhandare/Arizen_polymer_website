/**
 * Creates (or resets the password of) a dashboard user.
 *
 *   npm run create-admin -w server -- --email you@company.com --name "Your Name" [--role editor]
 *
 * The password is read from the ADMIN_PASSWORD environment variable so it never
 * appears in shell history or process listings.
 */
import bcrypt from 'bcryptjs';
import { parseArgs } from 'node:util';
import { passwordSchema, roles, type Role } from '../../../shared/schemas';
import { connectDatabase, disconnectDatabase } from '../db';
import { AdminUser } from '../models/AdminUser';

const { values } = parseArgs({ options: { email: { type: 'string' }, name: { type: 'string' }, role: { type: 'string', default: 'admin' } } });
const password = process.env.ADMIN_PASSWORD ?? '';
const email = values.email?.toLowerCase();

if (!email || !roles.includes(values.role as Role)) {
  console.error('Usage: ADMIN_PASSWORD=... npm run create-admin -w server -- --email you@company.com --name "Your Name" [--role admin|editor]');
  process.exit(1);
}
const strength = passwordSchema.safeParse(password);
if (!strength.success) {
  console.error(`ADMIN_PASSWORD is not strong enough: ${strength.error.issues.map((i) => i.message).join('; ')}`);
  process.exit(1);
}

await connectDatabase();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    existing.tokenVersion += 1;
    await existing.save();
    console.log(`Password reset for ${email}.`);
  } else {
    await AdminUser.create({ email, name: values.name || 'Administrator', role: values.role as Role, passwordHash });
    console.log(`Created ${values.role} ${email}.`);
  }
} finally {
  await disconnectDatabase();
}
