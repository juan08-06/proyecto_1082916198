import { z } from 'zod';

const ProductCategorySchema = z.enum([
  'Carnes',
  'Bebidas',
  'Verduras',
  'Granos',
  'Lácteos',
  'Condimentos',
  'Otros',
]);

const ProductUnitSchema = z.enum(['kg', 'g', 'L', 'ml', 'unidad', 'caja', 'bolsa']);

export const HomeDataSchema = z.object({
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string(),
    description: z.string(),
    animationStyle: z.enum(['typewriter', 'fadeIn', 'slideUp']),
  }),
  meta: z.object({
    pageTitle: z.string(),
    description: z.string(),
  }),
});

export const AppConfigSchema = z.object({
  appName: z.string(),
  version: z.string(),
  locale: z.string(),
  theme: z.enum(['light', 'dark']),
});

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  category: ProductCategorySchema,
  quantity: z.number().int().min(0),
  unit: ProductUnitSchema,
  minStock: z.number().int().min(0),
});

export const CreateProductSchema = ProductSchema.omit({ id: true });
export const UpdateProductSchema = CreateProductSchema;

export const RestockRequestSchema = z.object({
  amount: z.number().int().min(1),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type RestockRequestInput = z.infer<typeof RestockRequestSchema>;
