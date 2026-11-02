import { Router } from 'express';
import { z } from 'zod';
import { categoryInput, productInput } from '../../../../shared/schemas';
import { requireRole } from '../../middleware/auth';
import { HttpError, notFound } from '../../middleware/errors';
import { Product, ProductCategory } from '../../models/catalog';
import { idParam } from './params';

/* ------------------------------------------------------------------ Products */

export const productsRouter = Router();

productsRouter.get('/', async (_req, res) => {
  const products = await Product.find({}, { description: 0, specifications: 0, grades: 0, gallery: 0 })
    .populate('category', 'name')
    .sort({ order: 1, name: 1 })
    .lean();
  res.json(products);
});

productsRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(idParam(req.params.id, 'Product')).lean();
  if (!product) throw notFound('Product');
  res.json(product);
});

async function checkReferences(input: z.infer<typeof productInput>, selfId?: string) {
  if (input.category && !(await ProductCategory.exists({ _id: input.category }))) {
    throw new HttpError(400, 'Please choose a valid category.', { issues: [{ path: 'category', message: 'Category not found' }] });
  }
  input.relatedProducts = [...new Set(input.relatedProducts)].filter((id) => id !== selfId);
}

productsRouter.post('/', async (req, res) => {
  const input = productInput.parse(req.body);
  await checkReferences(input);
  const product = await Product.create(input);
  res.status(201).json(product);
});

productsRouter.put('/:id', async (req, res) => {
  const id = idParam(req.params.id, 'Product');
  const input = productInput.parse(req.body);
  await checkReferences(input, id);
  const product = await Product.findByIdAndUpdate(id, input, { returnDocument: 'after', runValidators: true });
  if (!product) throw notFound('Product');
  res.json(product);
});

productsRouter.patch('/:id/status', async (req, res) => {
  const { status } = z.object({ status: z.enum(['draft', 'published']) }).strict().parse(req.body);
  const product = await Product.findByIdAndUpdate(idParam(req.params.id, 'Product'), { status }, { returnDocument: 'after' });
  if (!product) throw notFound('Product');
  res.json(product);
});

productsRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = idParam(req.params.id, 'Product');
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw notFound('Product');
  await Product.updateMany({ relatedProducts: id }, { $pull: { relatedProducts: id } });
  res.status(204).end();
});

/* ------------------------------------------------------------------ Categories */

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res) => {
  const [categories, counts] = await Promise.all([
    ProductCategory.find().sort({ order: 1, name: 1 }).lean(),
    Product.aggregate<{ _id: unknown; count: number }>([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  res.json(categories.map((c) => ({ ...c, productCount: counts.find((x) => String(x._id) === String(c._id))?.count ?? 0 })));
});

categoriesRouter.post('/', async (req, res) => {
  res.status(201).json(await ProductCategory.create(categoryInput.parse(req.body)));
});

categoriesRouter.put('/reorder', async (req, res) => {
  const { ids } = z.object({ ids: z.array(z.string().regex(/^[a-f0-9]{24}$/i)).max(200) }).strict().parse(req.body);
  await ProductCategory.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
  res.json(await ProductCategory.find().sort({ order: 1, name: 1 }).lean());
});

categoriesRouter.put('/:id', async (req, res) => {
  const category = await ProductCategory.findByIdAndUpdate(idParam(req.params.id, 'Category'), categoryInput.parse(req.body), { returnDocument: 'after', runValidators: true });
  if (!category) throw notFound('Category');
  res.json(category);
});

categoriesRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = idParam(req.params.id, 'Category');
  const inUse = await Product.countDocuments({ category: id });
  if (inUse) throw new HttpError(409, `This category still contains ${inUse} product${inUse === 1 ? '' : 's'}. Move them to another category first.`);
  const category = await ProductCategory.findByIdAndDelete(id);
  if (!category) throw notFound('Category');
  res.status(204).end();
});
