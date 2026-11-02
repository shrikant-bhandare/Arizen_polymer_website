import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { trusted } from 'mongoose';
import { userCreateInput, userUpdateInput } from '../../../../shared/schemas';
import { HttpError, notFound } from '../../middleware/errors';
import { AdminUser } from '../../models/AdminUser';
import { idParam } from './params';

/** Administrator-only: who can sign in to the dashboard, and with which role. */
export const usersRouter = Router();

usersRouter.get('/', async (_req, res) => {
  res.json(await AdminUser.find().sort({ createdAt: 1 }));
});

usersRouter.post('/', async (req, res) => {
  const { password, ...input } = userCreateInput.parse(req.body);
  const user = await AdminUser.create({ ...input, email: input.email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json(user);
});

async function assertAnotherAdmin(excludingId: string) {
  const others = await AdminUser.countDocuments({ role: 'admin', isActive: true, _id: trusted({ $ne: excludingId }) });
  if (others === 0) throw new HttpError(409, 'There must always be at least one active administrator.');
}

usersRouter.put('/:id', async (req, res) => {
  const id = idParam(req.params.id, 'User');
  const { password, ...input } = userUpdateInput.parse(req.body);
  const user = await AdminUser.findById(id);
  if (!user) throw notFound('User');

  const losingAdmin = user.role === 'admin' && ((input.role && input.role !== 'admin') || input.isActive === false);
  if (losingAdmin) await assertAnotherAdmin(id);
  if (id === req.user!.id && input.isActive === false) throw new HttpError(409, 'You cannot deactivate your own account.');

  Object.assign(user, input);
  if (password) {
    user.passwordHash = await bcrypt.hash(password, 12);
    user.tokenVersion += 1; // sign the account out everywhere
  }
  if (input.isActive === false) user.tokenVersion += 1; // a deactivated account is signed out immediately
  await user.save();
  res.json(user);
});

usersRouter.delete('/:id', async (req, res) => {
  const id = idParam(req.params.id, 'User');
  if (id === req.user!.id) throw new HttpError(409, 'You cannot delete your own account.');
  const user = await AdminUser.findById(id);
  if (!user) throw notFound('User');
  if (user.role === 'admin') await assertAnotherAdmin(id);
  await user.deleteOne();
  res.status(204).end();
});
