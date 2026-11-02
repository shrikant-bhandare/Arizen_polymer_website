import { Router, type Request } from 'express';
import { trusted } from 'mongoose';
import { z } from 'zod';
import { inquiryNote, inquiryStatuses, inquiryStatusLabels, inquiryUpdate } from '../../../../shared/schemas';
import { requireRole } from '../../middleware/auth';
import { notFound } from '../../middleware/errors';
import { Inquiry } from '../../models/Inquiry';
import { escapeRegex, idParam, pagination } from './params';

export const inquiriesRouter = Router();

const filterQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(inquiryStatuses).optional(),
  product: z.string().regex(/^([a-f0-9]{24}|general)$/i).optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

function buildFilter(req: Request) {
  const { q, status, product, from, to } = filterQuery.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (product) filter.product = product === 'general' ? null : product;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) range.$lte = new Date(`${to}T23:59:59.999Z`);
    filter.createdAt = trusted(range);
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ fullName: rx }, { companyName: rx }, { email: rx }, { phone: rx }, { productName: rx }];
  }
  return filter;
}

inquiriesRouter.get('/', async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = buildFilter(req);
  const [items, total] = await Promise.all([
    Inquiry.find(filter, { notes: 0, userAgent: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

/** Neutralises spreadsheet formula injection and quotes every cell. */
const csvCell = (value: unknown) => {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

inquiriesRouter.get('/export.csv', async (req, res) => {
  const items = await Inquiry.find(buildFilter(req)).sort({ createdAt: -1 }).limit(10_000).lean();
  const header = ['Received', 'Status', 'Full name', 'Company', 'Email', 'Phone', 'Product', 'Quantity', 'Message', 'Notes'];
  const rows = items.map((i) => [
    i.createdAt.toISOString(),
    inquiryStatusLabels[i.status],
    i.fullName,
    i.companyName,
    i.email,
    i.phone,
    i.productName || 'General inquiry',
    i.quantity,
    i.message,
    i.notes.filter((n) => n.kind === 'note').map((n) => `${n.authorName}: ${n.text}`).join(' | '),
  ]);
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="arizen-inquiries-${stamp}.csv"`, 'Cache-Control': 'no-store' });
  res.send(csv);
});

inquiriesRouter.get('/:id', async (req, res) => {
  const inquiry = await Inquiry.findById(idParam(req.params.id, 'Inquiry')).populate('product', 'name slug').lean();
  if (!inquiry) throw notFound('Inquiry');
  res.json(inquiry);
});

inquiriesRouter.patch('/:id', async (req, res) => {
  const { status } = inquiryUpdate.parse(req.body);
  const inquiry = await Inquiry.findById(idParam(req.params.id, 'Inquiry'));
  if (!inquiry) throw notFound('Inquiry');
  if (inquiry.status !== status) {
    inquiry.notes.push({ kind: 'status', text: `Status changed from ${inquiryStatusLabels[inquiry.status]} to ${inquiryStatusLabels[status]}`, authorName: req.user!.name, author: req.user!.id });
    inquiry.status = status;
    await inquiry.save();
  }
  res.json(inquiry);
});

inquiriesRouter.post('/:id/notes', async (req, res) => {
  const { text } = inquiryNote.parse(req.body);
  const inquiry = await Inquiry.findByIdAndUpdate(
    idParam(req.params.id, 'Inquiry'),
    { $push: { notes: { kind: 'note', text, authorName: req.user!.name, author: req.user!.id } } },
    { returnDocument: 'after' },
  );
  if (!inquiry) throw notFound('Inquiry');
  res.status(201).json(inquiry);
});

inquiriesRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(idParam(req.params.id, 'Inquiry'));
  if (!inquiry) throw notFound('Inquiry');
  res.status(204).end();
});
