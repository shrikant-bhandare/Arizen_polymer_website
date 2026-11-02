import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { mediaUpdateInput } from '../../../../shared/schemas';
import { config } from '../../config';
import { requireRole } from '../../middleware/auth';
import { HttpError, notFound } from '../../middleware/errors';
import { requireJson } from '../../middleware/security';
import { MediaAsset } from '../../models/site';
import { ALLOWED_MIME, deleteImageFiles, findMediaUsage, storeImage } from '../../services/media';
import { escapeRegex, idParam, pagination } from './params';

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024, files: 1, fields: 4 },
  fileFilter: (_req, file, cb) => {
    // A first, cheap check. The image is decoded and re-encoded afterwards, which is the real guard.
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new HttpError(400, 'Only JPEG, PNG, WebP and AVIF images are accepted.'));
    cb(null, true);
  },
});

mediaRouter.get('/', async (req, res) => {
  const { page, limit, skip } = pagination({ limit: 40, ...req.query });
  const q = z.string().trim().max(100).optional().parse(req.query.q);
  const filter = q ? { $or: [{ originalName: new RegExp(escapeRegex(q), 'i') }, { alt: new RegExp(escapeRegex(q), 'i') }] } : {};
  const [items, total] = await Promise.all([
    MediaAsset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MediaAsset.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

mediaRouter.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Please choose an image to upload.');
  const asset = await storeImage(req.file.buffer, req.file.originalname, req.user!.name);
  const alt = z.string().trim().max(200).optional().parse(req.body?.alt);
  if (alt) {
    asset.alt = alt;
    await asset.save();
  }
  res.status(201).json(asset);
});

mediaRouter.patch('/:id', requireJson, async (req, res) => {
  const asset = await MediaAsset.findByIdAndUpdate(idParam(req.params.id, 'Image'), mediaUpdateInput.parse(req.body), { returnDocument: 'after' });
  if (!asset) throw notFound('Image');
  res.json(asset);
});

mediaRouter.get('/:id/usage', async (req, res) => {
  const asset = await MediaAsset.findById(idParam(req.params.id, 'Image')).lean();
  if (!asset) throw notFound('Image');
  res.json({ usage: await findMediaUsage(asset.url) });
});

mediaRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  const asset = await MediaAsset.findById(idParam(req.params.id, 'Image'));
  if (!asset) throw notFound('Image');
  const usage = await findMediaUsage(asset.url);
  if (usage.length && req.query.force !== 'true') {
    throw new HttpError(409, 'This image is still used on the website.', { usage });
  }
  await deleteImageFiles(asset);
  await asset.deleteOne();
  res.status(204).end();
});
