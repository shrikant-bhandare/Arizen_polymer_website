import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { loginInput } from '../../../../shared/schemas';
import { endSession, requireAuth, requireCsrf, sessionUser, startSession } from '../../middleware/auth';
import { HttpError } from '../../middleware/errors';
import { loginLimiter, requireJson } from '../../middleware/security';
import { AdminUser } from '../../models/AdminUser';

export const authRouter = Router();

// Compared against when the email is unknown, so response time does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 12);

authRouter.post('/login', loginLimiter, requireJson, async (req, res) => {
  const { email, password } = loginInput.parse(req.body);
  const user = await AdminUser.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.isActive) throw new HttpError(401, 'Incorrect email or password.');

  user.lastLoginAt = new Date();
  await user.save();
  const csrfToken = startSession(res, String(user._id), user.tokenVersion);
  res.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role }, csrfToken });
});

/** Session check for the dashboard: being signed out is a normal answer, not an error. */
authRouter.get('/me', async (req, res) => {
  res.json({ user: await sessionUser(req) });
});

/** Signing out revokes every session for this account, not just this browser. */
authRouter.post('/logout', requireAuth, requireCsrf, async (req, res) => {
  await AdminUser.updateOne({ _id: req.user!.id }, { $inc: { tokenVersion: 1 } });
  endSession(res);
  res.status(204).end();
});
