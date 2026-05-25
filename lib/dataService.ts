import fs from 'fs';
import path from 'path';
import { HomeDataSchema, AppConfigSchema } from './validators';
import type { HomeData, AppConfig, Product, User, UserRole } from './types';
import {
  findSeedUserByEmail,
  getSeedProducts,
  getSeedUsers,
  getSeedUserById,
  getSeedProductById,
  getSeedProductByName,
  readSeedFile,
  writeSeedProducts,
  writeSeedUsers,
  createSeedUser,
  updateSeedUserActive,
} from './seedReader';
import { appendAuditEntry, readAuditMonth } from './auditService';
import { getPostgresUrl } from './env';

/**
 * Función genérica para lectura de archivos JSON
 * @param filename - Nombre del archivo en la carpeta /data
 * @returns Contenido del archivo parseado como tipo T
 */
export function readJsonFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/**
 * Lee y valida config.json
 * Garantiza que los datos cumplen con AppConfig
 * @returns Datos de configuración validados
 * @throws ZodError si la validación falla
 */
export function readAppConfig(): AppConfig {
  const rawData = readJsonFile<AppConfig>('config.json');
  return AppConfigSchema.parse(rawData);
}

/**
 * Lee y valida home.json
 * Garantiza que los datos cumplen con HomeData
 * @returns Datos de página Home validados
 * @throws ZodError si la validación falla
 */
export function readHomeData(): HomeData {
  const rawData = readJsonFile<HomeData>('home.json');
  return HomeDataSchema.parse(rawData);
}

export function getSystemMode(): 'seed' | 'live' {
  const hasDb = Boolean(getPostgresUrl());
  if (process.env.SYSTEM_MODE === 'seed') return 'seed';
  return hasDb ? 'live' : 'seed';
}

function normalizeProductName(name: string) {
  return name.trim().toLowerCase();
}

export async function getProducts(filters?: { query?: string; category?: string }): Promise<Product[]> {
  if (getSystemMode() === 'seed') {
    return getSeedProducts().filter((product) => {
      const queryMatch = !filters?.query || product.name.toLowerCase().includes(filters.query.toLowerCase());
      const categoryMatch =
        !filters?.category || filters.category === 'Todas' || product.category === filters.category;
      return queryMatch && categoryMatch;
    });
  }

  return [];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (getSystemMode() === 'seed') {
    return getSeedProductById(id);
  }

  return null;
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  if (getSystemMode() === 'seed') {
    const products = getSeedProducts();
    const normalizedName = normalizeProductName(data.name);

    if (products.some((product) => normalizeProductName(product.name) === normalizedName)) {
      throw new Response('Ya existe un producto con este nombre', { status: 409 });
    }

    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
    };

    writeSeedProducts([...products, newProduct]);
    await recordAudit('product.created', `Producto creado: ${newProduct.name}`);
    return newProduct;
  }

  throw new Response('Modo live no soportado', { status: 501 });
}

export async function updateProduct(id: string, data: Omit<Product, 'id'>): Promise<Product> {
  if (getSystemMode() === 'seed') {
    const products = getSeedProducts();
    const existing = products.find((product) => product.id === id);

    if (!existing) {
      throw new Response('Producto no encontrado', { status: 404 });
    }

    const normalizedName = normalizeProductName(data.name);
    if (
      products.some(
        (product) => product.id !== id && normalizeProductName(product.name) === normalizedName
      )
    ) {
      throw new Response('Ya existe un producto con este nombre', { status: 409 });
    }

    const updatedProduct: Product = {
      ...existing,
      ...data,
    };

    writeSeedProducts(products.map((product) => (product.id === id ? updatedProduct : product)));
    await recordAudit('product.updated', `Producto actualizado: ${updatedProduct.name}`);
    return updatedProduct;
  }

  throw new Response('Modo live no soportado', { status: 501 });
}

export async function deleteProduct(id: string): Promise<void> {
  if (getSystemMode() === 'seed') {
    const products = getSeedProducts();
    const existing = products.find((product) => product.id === id);

    if (!existing) {
      throw new Response('Producto no encontrado', { status: 404 });
    }

    writeSeedProducts(products.filter((product) => product.id !== id));
    await recordAudit('product.deleted', `Producto eliminado: ${existing.name}`);
    return;
  }

  throw new Response('Modo live no soportado', { status: 501 });
}

export async function restockProduct(id: string, amount: number, user?: { id: string; name: string; role: UserRole }): Promise<Product> {
  if (getSystemMode() === 'seed') {
    if (amount <= 0) {
      throw new Response('La cantidad a agregar debe ser mayor a cero', { status: 400 });
    }

    const products = getSeedProducts();
    const existing = products.find((product) => product.id === id);

    if (!existing) {
      throw new Response('Producto no encontrado', { status: 404 });
    }

    const updatedProduct: Product = {
      ...existing,
      quantity: existing.quantity + amount,
    };

    writeSeedProducts(products.map((product) => (product.id === id ? updatedProduct : product)));
    await recordAudit('product.restocked', `Producto reabastecido: ${updatedProduct.name}, +${amount}`);
    if (user) {
      appendAuditEntry({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        event: 'product.restocked',
        detail: `${user.name} reabasteció ${updatedProduct.name} (+${amount})`,
      });
    }
    return updatedProduct;
  }

  throw new Response('Modo live no soportado', { status: 501 });
}

export async function getLowStockProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.quantity <= product.minStock);
}

export async function listUsers() {
  if (getSystemMode() === 'seed') {
    return getSeedUsers().map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active ?? true,
      mustChangePassword: user.mustChangePassword ?? false,
    }));
  }

  return [];
}

export async function createUser(user: {
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  mustChangePassword: boolean;
  active?: boolean;
}) {
  if (getSystemMode() === 'seed') {
    const created = createSeedUser({ ...user, active: user.active ?? true });
    appendAuditEntry({
      userId: created.id,
      userName: created.name,
      userRole: created.role,
      event: 'user.created',
      detail: `Usuario creado: ${created.email}`,
    });
    return created;
  }

  throw new Response('Modo live no soportado', { status: 501 });
}

export async function updateUserActive(id: string, active: boolean) {
  if (getSystemMode() === 'seed') {
    const user = getSeedUserById(id);
    if (!user) {
      throw new Response('Usuario no encontrado', { status: 404 });
    }

    updateSeedUserActive(id, active);
    appendAuditEntry({
      userId: id,
      userName: user.name,
      userRole: user.role,
      event: active ? 'user.activated' : 'user.suspended',
      detail: `${user.name} ${active ? 'activado' : 'suspendido'}`,
    });
    return { id, active };
  }

  throw new Response('Modo live no soportado', { status: 501 });
}

export async function listAuditMonth(yyyymm: string) {
  if (getSystemMode() === 'seed') {
    return readAuditMonth(yyyymm);
  }

  return [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = findSeedUserByEmail(email);
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? email,
    name: user.name,
    email: user.email,
    role: user.role,
    passwordHash: user.passwordHash,
    mustChangePassword: user.mustChangePassword,
    active: user.active ?? true,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const users = getSeedUsers();
  return users.find((user) => user.id === id) || null;
}

export async function recordAudit(event: string, detail: string): Promise<void> {
  if (getSystemMode() === 'live') {
    // En live se escribirá en Blob Audit.
  }

  console.log('[audit]', event, detail);
}

export function getSeedStatus() {
  const seed = readSeedFile();
  return {
    users: seed.users.length,
    products: seed.products.length,
  };
}

