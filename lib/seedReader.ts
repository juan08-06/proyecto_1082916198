import fs from 'fs';
import path from 'path';
import { z } from 'zod';

export const SeedUserSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'empleado']),
  passwordHash: z.string(),
  mustChangePassword: z.boolean().optional(),
  active: z.boolean().optional().default(true),
});

export const SeedProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().int().min(0),
  unit: z.string().min(1),
  minStock: z.number().int().min(0),
});

const SeedSchema = z.object({
  users: z.array(SeedUserSchema),
  products: z.array(SeedProductSchema),
});

type SeedData = z.infer<typeof SeedSchema>;

const seedFilePath = path.join(process.cwd(), 'data', 'seed.json');

export function readSeedFile(): SeedData {
  const raw = fs.readFileSync(seedFilePath, 'utf-8');
  const parsed = JSON.parse(raw);
  return SeedSchema.parse(parsed);
}

function writeSeedFile(seed: SeedData) {
  fs.writeFileSync(seedFilePath, JSON.stringify(seed, null, 2));
}

export function getSeedUsers() {
  return readSeedFile().users.map((user) => ({
    ...user,
    id: user.id ?? crypto.randomUUID(),
    active: user.active ?? true,
  }));
}

export function getSeedProducts() {
  return readSeedFile().products.map((product) => ({
    ...product,
    id: product.id ?? crypto.randomUUID(),
  }));
}

export function findSeedUserByEmail(email: string) {
  return getSeedUsers().find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export function updateSeedUserPassword(email: string, passwordHash: string) {
  const seed = readSeedFile();
  const nextUsers = seed.users.map((user) =>
    user.email.toLowerCase() === email.toLowerCase()
      ? {
          ...user,
          passwordHash,
          mustChangePassword: false,
        }
      : user
  );

  writeSeedFile({ ...seed, users: nextUsers });
}

export function getSeedProductByName(name: string) {
  return getSeedProducts().find((product) => product.name.toLowerCase() === name.toLowerCase()) || null;
}

export function getSeedUserById(id: string) {
  return getSeedUsers().find((user) => user.id === id) || null;
}

export function writeSeedUsers(users: SeedData['users']) {
  const seed = readSeedFile();
  writeSeedFile({ ...seed, users });
}

export function createSeedUser(user: Omit<z.infer<typeof SeedUserSchema>, 'id'>) {
  const seed = readSeedFile();
  const existing = seed.users.find((existingUser) => existingUser.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    throw new Error('Ya existe un usuario con ese email');
  }

  const nextUser = {
    ...user,
    id: crypto.randomUUID(),
  };

  writeSeedUsers([...seed.users, nextUser]);
  return nextUser;
}

export function updateSeedUserActive(id: string, active: boolean) {
  const seed = readSeedFile();
  const nextUsers = seed.users.map((user) =>
    user.id === id
      ? {
          ...user,
          active,
        }
      : user
  );
  writeSeedUsers(nextUsers);
}

export function getSeedProductById(id: string) {
  return getSeedProducts().find((product) => product.id === id) || null;
}

export function writeSeedProducts(products: SeedData['products']) {
  const seed = readSeedFile();
  writeSeedFile({ ...seed, products });
}
