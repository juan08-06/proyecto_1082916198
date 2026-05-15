# Playa Alta Inventory — Plan Maestro del Sistema
> Gestión de Inventario para Restaurante | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Juan Orozco | Doc: 1082916198

---

## Nota sobre el stack

El documento de planificación original describe dos fases de persistencia: localStorage y luego Firebase. Este plan usa directamente el **stack estándar del curso**: Supabase Postgres para persistencia desde el primer día y Vercel para el deploy. Esto elimina la necesidad de migrar datos entre implementaciones.

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Actores del sistema](#2-actores-del-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Casos de uso](#4-casos-de-uso)
5. [Requerimientos funcionales](#5-requerimientos-funcionales)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Stack tecnológico](#7-stack-tecnológico)
8. [Arquitectura de persistencia](#8-arquitectura-de-persistencia)
9. [Bootstrap y migrations](#9-bootstrap-y-migrations)
10. [Capa de datos unificada (dataService)](#10-capa-de-datos-unificada)
11. [Modelo de datos — Supabase Postgres](#11-modelo-de-datos--supabase-postgres)
12. [Auditoría en Vercel Blob](#12-auditoría-en-vercel-blob)
13. [Arquitectura de rutas](#13-arquitectura-de-rutas)
14. [Requerimientos no funcionales](#14-requerimientos-no-funcionales)
15. [Flujos de usuario y de trabajo](#15-flujos-de-usuario-y-de-trabajo)
16. [Diseño de interfaz](#16-diseño-de-interfaz)
17. [Plan de fases de implementación](#17-plan-de-fases-de-implementación)
18. [Restricciones del sistema](#18-restricciones-del-sistema)
19. [Glosario](#19-glosario)

---

## 1. Definición del sistema

**Playa Alta Inventory** es una aplicación web de gestión de inventario diseñada para el restaurante Playa Alta. Permite registrar insumos e ingredientes con su categoría, cantidad, unidad de medida y stock mínimo; detecta automáticamente qué productos necesitan reabastecimiento; y centraliza el control de existencias en un panel accesible desde cualquier dispositivo con navegador.

---

## 2. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Administrador** | Interno | Control total. CRUD de productos, configuración del sistema, gestión de usuarios. |
| **Empleado** (cocinero / almacén) | Interno | Puede consultar el inventario, buscar productos y registrar entradas de mercancía (aumentar cantidad). No puede crear ni eliminar productos. |
| **Sistema** | No humano | Evalúa automáticamente la alerta de stock bajo tras cada operación. Registra auditoría. |

> No hay registro público. El Administrador crea las cuentas de los empleados.

---

## 3. Roles y permisos

| Recurso / Acción | Empleado | Administrador |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **PRODUCTOS** | | |
| Ver inventario completo | ✅ | ✅ |
| Buscar por nombre en tiempo real | ✅ | ✅ |
| Filtrar por categoría | ✅ | ✅ |
| Agregar nuevo producto | ❌ | ✅ |
| Editar producto (nombre, precio, unidad, stock mínimo) | ❌ | ✅ |
| Registrar entrada de mercancía (aumentar cantidad) | ✅ | ✅ |
| Eliminar producto | ❌ | ✅ |
| **ALERTAS** | | |
| Ver banner de alertas de stock bajo | ✅ | ✅ |
| **PANEL DE RESUMEN** | | |
| Ver total de productos, alertas activas, categorías | ✅ | ✅ |
| **CONFIGURACIÓN** | | |
| Cambiar umbral de alerta global | ❌ | ✅ |
| Crear / activar / suspender usuarios | ❌ | ✅ |
| **AUDITORÍA** | | |
| Ver bitácora de operaciones | ❌ | ✅ |

---

## 4. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Correo y contraseña. Redirige al panel según el rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Todos | Verifica la contraseña actual. |

### Módulo de Inventario

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Registrar producto | Administrador | Modal con formulario: nombre (único, case-insensitive), categoría, cantidad, unidad y stock mínimo. Validaciones inline. Toast de confirmación. |
| CU-02 | Editar producto | Administrador | Mismo formulario pre-cargado con los datos actuales. Validaciones. |
| CU-03 | Eliminar producto | Administrador | Modal de confirmación antes de borrar. Toast de confirmación. |
| CU-04 | Buscar y filtrar | Todos | Búsqueda en tiempo real por nombre + filtro por categoría. Los dos pueden combinarse. |
| CU-05 | Registrar entrada | Todos | El empleado indica cuántas unidades llegaron de un producto. El sistema suma al stock actual. |

### Módulo de Alertas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Ver alertas de stock bajo | Todos | Banner naranja con la lista de productos cuya `quantity <= minStock`. Se actualiza automáticamente tras cada operación. |

---

## 5. Requerimientos funcionales

| ID | Requerimiento | Actor | Prioridad |
|---|---|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. | Sistema | Alta |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. | Admin | Alta |
| RF-01 | El sistema debe permitir registrar un nuevo producto con nombre, categoría, cantidad, unidad de medida y stock mínimo. | Administrador | Alta |
| RF-02 | El sistema debe permitir editar la información de un producto existente. | Administrador | Alta |
| RF-03 | El sistema debe permitir eliminar un producto del inventario con confirmación modal. | Administrador | Alta |
| RF-04 | El sistema debe mostrar una lista completa de todos los productos registrados en el inventario. | Todos | Alta |
| RF-05 | El sistema debe permitir buscar productos por nombre en tiempo real. | Todos | Alta |
| RF-06 | El sistema debe permitir filtrar productos por categoría. | Todos | Media |
| RF-07 | El sistema debe mostrar una alerta visual cuando `quantity <= minStock` de un producto. | Todos | Alta |
| RF-08 | El sistema debe mostrar un panel de resumen: total de productos, alertas activas y categorías en uso. | Todos | Media |
| RF-09 | El sistema debe permitir al empleado registrar entradas de mercancía (aumentar cantidad). | Empleado / Admin | Alta |
| RF-10 | La unidad de medida solo puede ser una de las opciones predefinidas: kg, g, L, ml, unidad, caja, bolsa. | Admin | Media |

---

## 6. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | La cantidad disponible no puede ser negativa. | Zod: `z.number().int().min(0)`. CHECK en Postgres: `quantity >= 0`. |
| RN-02 | El nombre del producto es obligatorio y no puede ser solo espacios en blanco. | Zod: `z.string().trim().min(1)`. Validación visual inline. |
| RN-03 | La categoría es obligatoria — debe ser una de las categorías predefinidas. | Zod: `z.enum([...])`. Selector cerrado en el frontend. |
| RN-04 | El stock mínimo debe ser >= 0. | Zod: `z.number().int().min(0)`. CHECK en Postgres. |
| RN-05 | Alerta cuando `quantity <= minStock`. | Se evalúa en el servidor y en el cliente tras cada operación. Badge rojo en la tarjeta + banner naranja. |
| RN-06 | El nombre del producto es único (case-insensitive) en el inventario. | UNIQUE en `products(LOWER(name))`. Capturar error de Postgres y retornar 409. |
| RN-07 | La unidad de medida solo puede ser: kg, g, L, ml, unidad, caja, bolsa. | Enum en Postgres y en Zod. Selector cerrado. |
| RN-08 | Solo el Administrador puede crear, editar o eliminar productos. El empleado solo puede registrar entradas. | `withRole(['admin'])` en los endpoints de escritura de productos. `PATCH /api/products/[id]/stock` disponible para ambos roles. |

---

## 7. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Animación de tarjetas y modales |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs append-only |
| Iconos | Lucide React | — | Ícono de lápiz, papelera, etc. |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 8. Arquitectura de persistencia

### 8.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, productos. | El inventario requiere queries confiables: filtros por categoría, conteo de alertas, búsqueda ILIKE. |
| **Vercel Blob** | Auditoría (`audit/<YYYYMM>.json`). | Logs append-only. |
| **`data/` en el repo** | Seed: admin + productos demo + categorías. | Read-only. Solo para arrancar antes del bootstrap. |

### 8.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **La operación de entrada de mercancía SUMA** al stock actual — nunca reemplaza.
3. **CERO caché** en `/api/:path*`. Headers `no-store`.
4. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
5. **Token de Blob accedido con función lazy** (`getBlobToken()`).

---

## 9. Bootstrap y migrations

### 9.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "Playa Alta Inventory" }
  seed.json       ← {
                      "users": [{
                        email: "admin@playaalta.com",
                        password_hash: "<bcrypt admin123>",
                        name: "Administrador",
                        role: "admin"
                      }],
                      "products": [
                        { "name": "Pollo entero",   "category": "Carnes",      "quantity": 20, "unit": "kg",     "minStock": 5 },
                        { "name": "Arroz",          "category": "Granos",      "quantity": 30, "unit": "kg",     "minStock": 10 },
                        { "name": "Aceite de maíz", "category": "Condimentos", "quantity": 8,  "unit": "L",      "minStock": 3 },
                        { "name": "Leche",          "category": "Lácteos",     "quantity": 12, "unit": "L",      "minStock": 5 },
                        { "name": "Sal",            "category": "Condimentos", "quantity": 2,  "unit": "kg",     "minStock": 3 },
                        { "name": "Cerveza Club",   "category": "Bebidas",     "quantity": 24, "unit": "unidad", "minStock": 12 }
                      ]
                    }
  README.md
```

> Los productos demo incluyen uno en alerta (Sal: 2 kg con mínimo 3) para que el banner y el badge sean visibles desde el primer arranque.

### 9.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql     ← Fase 1: users + _migrations
  0002_init_products.sql  ← Fase 3: products
```

---

## 10. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 10.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 10.2 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Productos
export async function getProducts(filters?: ProductFilters): Promise<Product[]>
export async function getProductById(id: string): Promise<Product | null>
export async function createProduct(userId: string, data: CreateProductRequest): Promise<Product>
export async function updateProduct(id: string, userId: string, data: UpdateProductRequest): Promise<Product>
export async function restockProduct(id: string, userId: string, amount: number): Promise<Product>
// restockProduct: UPDATE products SET quantity = quantity + amount WHERE id = ?
// Nunca SET quantity = amount (reemplazar).
export async function deleteProduct(id: string, userId: string): Promise<void>
export async function getLowStockProducts(): Promise<Product[]>

// Panel de resumen
export async function getInventorySummary(): Promise<InventorySummary>
// { totalProducts, alertCount, categoriesInUse }

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

---

## 11. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'empleado'
                       CHECK (role IN ('empleado', 'admin')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_products.sql`

```sql
CREATE TABLE IF NOT EXISTS products (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  category    VARCHAR(20)   NOT NULL
              CHECK (category IN ('Carnes','Bebidas','Verduras','Granos','Lácteos','Condimentos','Otros')),
  quantity    DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),   -- RN-01
  unit        VARCHAR(10)   NOT NULL
              CHECK (unit IN ('kg','g','L','ml','unidad','caja','bolsa')),   -- RN-07
  min_stock   DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),   -- RN-04
  created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- RN-06: nombre único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_unique
  ON products(LOWER(name));

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(quantity, min_stock);
```

---

## 12. Auditoría en Vercel Blob

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'empleado' | 'admin';
  action:
    | 'login' | 'logout'
    | 'create_product' | 'update_product' | 'delete_product'
    | 'restock_product'
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'product' | 'user' | 'system';
  entity_id?: string;
  summary: string;  // "Restock: Arroz +15 kg (total: 45 kg)"
  metadata?: Record<string, unknown>;
};
```

---

## 13. Arquitectura de rutas

```
app/
  layout.tsx
  page.tsx                      ← Redirige a /inventory o /login
  login/page.tsx                ← Sin link de registro
  inventory/page.tsx            ← Panel principal con grid de productos
  profile/page.tsx              ← Cambiar contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    products/
      route.ts                  ← GET inventario | POST crear (admin)
      search/route.ts           ← GET búsqueda en tiempo real
      summary/route.ts          ← GET resumen para el panel
      alerts/route.ts           ← GET productos con stock bajo
      [id]/route.ts             ← GET | PUT (admin) | DELETE (admin)
      [id]/restock/route.ts     ← PATCH entrada de mercancía (ambos roles)
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/                           ← Button, Card, Modal, Toast, Badge, EmptyState
  layout/                       ← AppLayout, Sidebar, SeedModeBanner
  inventory/                    ← ProductCard, ProductForm, ProductGrid,
                                   AlertBanner, SummaryPanel, CategoryFilter,
                                   SearchBar, RestockModal
  admin/                        ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 14. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | La búsqueda por nombre usa debounce de 300ms — los resultados se filtran mientras el usuario escribe. |
| RNF-02 | Las alertas de stock bajo se recalculan en el servidor en cada carga — nunca un estado desactualizado. |
| RNF-03 | La interfaz debe ser funcional en tablets de cocina y celulares. |
| RNF-04 | Las contraseñas se hashean con bcrypt. |
| RNF-05 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-06 | Las cantidades se muestran con su unidad siempre: `15 kg`, `24 unidades`, `2 L`. |

---

## 15. Flujos de usuario y de trabajo

### Flujo de bootstrap

Login admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live. El bootstrap inserta los 6 productos demo (incluyendo Sal en alerta para que el banner sea visible de inmediato).

### Flujo de restock (empleado)

| Paso | Actor | Acción |
|---|---|---|
| 1 | Empleado | Llega mercancía al almacén. Busca el producto en el inventario. |
| 2 | Empleado | Hace clic en el botón "Entrada" de la tarjeta del producto. |
| 3 | Sistema | Abre el `RestockModal`: nombre del producto (solo lectura), input de cantidad a agregar. |
| 4 | Empleado | Ingresa la cantidad recibida y confirma. |
| 5 | Sistema | `PATCH /api/products/[id]/restock` con `{ amount: N }`. El servidor hace `UPDATE quantity = quantity + N`. |
| 6 | Sistema | Si el nuevo stock supera el mínimo: el badge de alerta desaparece de la tarjeta. El banner se actualiza. |
| 7 | Empleado | Toast verde: "✅ Stock actualizado — Arroz: 45 kg." |

---

## 16. Diseño de interfaz

### Identidad visual del Login

Playa Alta es un restaurante — el diseño transmite frescura, el mar y la gastronomía costeña.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado. Fondo arena clara (`#FEF9F0`). |
| **Tarjeta** | Fondo blanco, `border-radius: 14px`, sombra naranja suave, borde superior de 4px en naranja (`#EA580C`). |
| **Logo** | SVG de una ola estilizada con un ícono de caja de inventario superpuesto, en naranja (`#EA580C`), 52px. |
| **Nombre** | "Playa Alta Inventory" en Inter Bold 26px, azul marino (`#0C2340`). |
| **Tagline** | "Control de inventario para el restaurante." Inter Regular 13px, gris (`#6B7280`). |
| **Campos** | Borde gris, focus en naranja (`#EA580C`). |
| **Botón principal** | bg `#EA580C`, texto blanco, hover `#C2410C`. |
| **Animación** | Framer Motion: `opacity: 0→1`, `y: 8→0`, 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (naranja) | `#EA580C` |
| Primario oscuro | `#C2410C` |
| Primario claro | `#FFF7ED` |
| Acento (azul marino) | `#0C2340` |
| Fondo principal | `#FEF9F0` (arena) |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#1C1917` |
| Texto secundario | `#78716C` |
| **Stock OK** | `#16A34A` + fondo `#F0FDF4` |
| **Stock bajo** | `#D97706` + fondo `#FFFBEB` (badge ámbar) |
| **Stock mínimo = 0** | Gris — sin badge de alerta |
| Alert Banner | Fondo `#FFFBEB`, borde `#D97706`, texto `#92400E` |
| Eliminación | `#DC2626` |
| Bordes | `#E7E5E4` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Categorías con colores distintos

| Categoría | Color del badge |
|---|---|
| Carnes | `#DC2626` (rojo) |
| Bebidas | `#2563EB` (azul) |
| Verduras | `#16A34A` (verde) |
| Granos | `#D97706` (ámbar) |
| Lácteos | `#0891B2` (cyan) |
| Condimentos | `#7C3AED` (violeta) |
| Otros | `#6B7280` (gris) |

### Componentes clave

| Componente | Descripción |
|---|---|
| `ProductCard` | Tarjeta del producto: nombre, badge de categoría con color, cantidad + unidad en grande, badge "⚠ Stock bajo" si aplica, ícono de editar (lápiz), ícono de eliminar (papelera), botón "Entrada" para restock. El empleado no ve lápiz ni papelera. |
| `AlertBanner` | Banner ámbar en la parte superior del inventario. Lista los nombres de los productos en alerta. Si no hay alertas: no se renderiza. |
| `SummaryPanel` | Tres tarjetas: Total Productos, Alertas Activas, Categorías en Uso. Siempre visible arriba del inventario. |
| `SearchBar` | Input con debounce 300ms. Filtra la lista en tiempo real. Combina con el filtro de categoría. |
| `CategoryFilter` | Pills de categoría. La seleccionada tiene fondo naranja. "Todas" visible siempre como primera opción. |
| `ProductForm` | Modal con 5 campos: nombre, categoría (selector), cantidad, unidad (selector), stock mínimo. Validación inline bajo cada campo. |
| `RestockModal` | Modal pequeño: nombre del producto (solo lectura), input de cantidad a agregar, botón "Registrar Entrada". |

---

## 17. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin y los 6 productos demo (incluyendo Sal en alerta). |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. JWT incluye `role`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | API Routes: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.10 | Crear `app/login/page.tsx` con la identidad visual de Playa Alta: fondo arena, logo de ola + caja, naranja como primario. Sin link de registro. |
| 1.11 | `npm run typecheck` sin errores. Probar: login admin → cookie → modo seed. |

---

### Fase 2 — Layout, Panel de Inventario y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState. |
| 2.2 | Configurar variables CSS de la paleta naranja/arena en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar. Admin ve: Inventario, Administración (Usuarios, Auditoría), Perfil. Empleado ve: Inventario, Perfil. |
| 2.4 | Crear `/admin/db-setup/page.tsx` con diagnóstico y bootstrap. Informa que el bootstrap cargará 6 productos demo. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `middleware.ts`: `/admin/*` solo para admin. Empleado → redirect a /inventory. |
| 2.7 | Crear `GET /api/products/summary`: en modo seed lee del seedReader; en live consulta Supabase. |
| 2.8 | Crear `app/inventory/page.tsx`: `SummaryPanel` + `AlertBanner` (si hay alertas) + `SearchBar` + `CategoryFilter` + grid de `ProductCard`. Botón "➕ Agregar Producto" solo visible para admin. En modo seed: muestra los 6 productos demo con la alerta de Sal activa. |
| 2.9 | Probar: bootstrap → modo live → 6 productos demo → `AlertBanner` muestra Sal. |

---

### Fase 3 — CRUD de Productos y Restock
> Rol: Ingeniero Fullstack — Operaciones del inventario

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_products.sql` con el UNIQUE en `LOWER(name)`. Aplicar desde `/admin/db-setup`. El bootstrap inserta los 6 productos demo. |
| 3.2 | Agregar tipos `Product`, `CreateProductRequest`, `UpdateProductRequest` y schemas Zod (todas las RN). |
| 3.3 | Extender `dataService`: `getProducts` (con filtros de categoría + búsqueda ILIKE), `getProductById`, `createProduct` (captura UNIQUE → 409 con "Ya existe un producto con ese nombre"), `updateProduct`, `restockProduct` (SUMA — no reemplaza), `deleteProduct`, `getLowStockProducts`, `getInventorySummary`. |
| 3.4 | API Routes: `GET/POST /api/products`, `GET /api/products/search?q=`, `GET /api/products/summary`, `GET /api/products/alerts`, `GET/PUT/DELETE /api/products/[id]` (PUT/DELETE con `withRole(['admin'])`), `PATCH /api/products/[id]/restock` (ambos roles). |
| 3.5 | Crear componente `ProductForm` (modal) con validación inline en cada campo. |
| 3.6 | Crear componente `RestockModal` con el input de cantidad a agregar. |
| 3.7 | Crear componente `AlertBanner` que consume `/api/products/alerts`. Se auto-actualiza tras cada operación. |
| 3.8 | Verificar RN-06: crear dos productos con el mismo nombre (diferente case) → 409. |
| 3.9 | Verificar el restock: producto con 20 kg + restock de 15 → debe quedar 35, no 15. |
| 3.10 | Verificar que el empleado no puede hacer POST /api/products → 403. |
| 3.11 | Verificar la alerta: bajar el stock de un producto por debajo del mínimo → badge rojo en la tarjeta + aparece en el AlertBanner. Subir el stock → badge y banner desaparecen. |

---

### Fase 4 — Administración y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 4.1 | API Routes con `withRole(['admin'])`: `GET/POST /api/users`, `GET/PUT /api/users/[id]`. POST genera contraseña temporal, `must_change_password=true`, retorna en claro una sola vez con modal. |
| 4.2 | En login: `must_change_password=true` → redirect a `/profile` para cambio obligatorio. |
| 4.3 | Crear `app/admin/users/page.tsx`: tabla de empleados con nombre, email y estado. |
| 4.4 | Crear `app/admin/audit/page.tsx`: AuditViewer con selector de mes. |
| 4.5 | Empty states: inventario vacío ("No hay productos en el inventario. ¡Agrega el primero!"), búsqueda sin resultados, filtro de categoría sin resultados. |
| 4.6 | Manejo de errores: 401 (sesión expirada), 403 (empleado en ruta admin), 409 (nombre duplicado — toast), 500 (toast genérico). |
| 4.7 | Verificar la búsqueda combinada con filtro: buscar "pol" + filtro "Carnes" → solo productos que cumplan ambas condiciones. |
| 4.8 | Verificar en celular de 375px: grid de ProductCard (columna única), modales accesibles, botones de al menos 44px. |
| 4.9 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 4.10 | Deploy en Vercel con todas las variables de entorno. |
| 4.11 | Probar en producción: admin crea empleado → empleado hace login → cambia contraseña → ve el inventario → registra entrada de mercancía → stock actualizado → alerta desaparece. Admin agrega producto nuevo → empleado lo ve. |

---

## 18. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | El admin crea los usuarios. |
| RS-02 | Sin recuperación de contraseña por correo | Solo cambio de contraseña autenticado. Sin Resend en v1. |
| RS-03 | Sin historial de movimientos | El sistema muestra el stock actual pero no el historial de entradas/salidas. Queda para v2. |
| RS-04 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo login admin. |

---

## 19. Glosario

| Término | Definición |
|---|---|
| **Stock bajo** | Condición cuando `quantity <= min_stock`. Activa el badge en la tarjeta y el AlertBanner. |
| **Restock** | Operación de entrada de mercancía: SUMA la cantidad recibida al stock actual. |
| **UNIQUE case-insensitive** | El nombre "Arroz" y "arroz" son considerados el mismo producto. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Juan Orozco | Doc: 1082916198
> Curso: Lógica y Programación — SIST0200
