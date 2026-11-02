/**
 * npm run seed            fill in missing content, catalogue and first admin
 * npm run seed -- --reset overwrite page content and settings with the defaults
 *
 * The first administrator comes from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
 * in server/.env. It is created only when no administrator exists yet.
 */
import { connectDatabase, disconnectDatabase } from '../db';
import { seedDatabase } from '../seed/seed';

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

await connectDatabase();
try {
  const created = await seedDatabase({
    reset: process.argv.includes('--reset'),
    admin: ADMIN_EMAIL && ADMIN_PASSWORD ? { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME || 'Administrator' } : undefined,
  });
  console.log(created.length ? `Seeded:\n  ${created.join('\n  ')}` : 'Nothing to seed.');
  if (!ADMIN_EMAIL) console.log('No ADMIN_EMAIL/ADMIN_PASSWORD set; create an administrator with `npm run create-admin -w server`.');
} finally {
  await disconnectDatabase();
}
