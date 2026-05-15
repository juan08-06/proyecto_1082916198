# Resumen Fase 1 — Bootstrap, Login y `dataService` base

## Objetivo

Establecer la arquitectura base del sistema en modo seed, implementar autenticación segura con JWT y crear el acceso inicial al inventario con los datos demo.

## Acciones ejecutadas

- Añadido `data/seed.json` con un usuario admin y los 6 productos demo del restaurante.
- Implementado `lib/seedReader.ts` para leer y validar la semilla desde `data/seed.json`.
- Creado `lib/auth.ts` con `bcryptjs` para validación de contraseña y JWT firmado con `jose`.
- Creado `lib/withAuth.ts` y `lib/withRole.ts` para control de sesión y autorización.
- Construido `lib/dataService.ts` como punto único de acceso a datos en modo seed.
- Añadidos los módulos de soporte:
  - `lib/supabase.ts` (cliente Supabase)
  - `lib/blobAudit.ts` (SDK de Blob con token lazy)
  - `lib/pgMigrate.ts` (ejecución de migrations)
- Configurada la cabecera `Cache-Control: no-store` para `/api/:path*` en `next.config.mjs`.
- Creada la página de login `app/login/page.tsx` con identidad visual de Playa Alta.
- Creada la página de inventario `app/inventory/page.tsx` con los 6 productos demo y alerta activa para Sal.
- Implementadas las rutas API: `/api/login`, `/api/logout`, `/api/me`, `/api/mode`, `/api/diagnose`, `/api/bootstrap`, `/api/change-password`.

## Archivos principales modificados / creados

- `data/seed.json`
- `supabase/migrations/0001_init_users.sql`
- `lib/auth.ts`
- `lib/seedReader.ts`
- `lib/dataService.ts`
- `lib/withAuth.ts`
- `lib/withRole.ts`
- `lib/supabase.ts`
- `lib/blobAudit.ts`
- `lib/pgMigrate.ts`
- `app/login/page.tsx`
- `app/inventory/page.tsx`
- `app/api/login/route.ts`
- `app/api/logout/route.ts`
- `app/api/me/route.ts`
- `app/api/mode/route.ts`
- `app/api/diagnose/route.ts`
- `app/api/bootstrap/route.ts`
- `app/api/change-password/route.ts`
- `next.config.mjs`

## Decisiones técnicas

- El modo seed es el modo predeterminado cuando no se configura `DATABASE_URL`.
- El login usa JWT firmado con `JWT_SECRET` y se almacena en cookie HttpOnly.
- La contraseña admin inicial se generó con bcrypt y se guarda como `passwordHash` en la semilla.
- `dataService.ts` unifica el acceso a la semilla para productos, usuarios y sistema.
- Se preparó `lib/pgMigrate.ts` y `supabase/migrations/0001_init_users.sql` para el bootstrap live futuro.
- El helper de Blob implementa token lazy y usa `get()` del SDK para lectura de auditoría.

## Problemas encontrados y resolución

- El paquete `@vercel/blob` no exporta un default tipado simple, por lo que se adaptó la importación con `import * as BlobPackage`.

## Qué se probó y resultado

- `node ./node_modules/typescript/bin/tsc --noEmit` — sin errores.
- `node ./node_modules/next/dist/bin/next build` — build exitoso.

## Estado final

EXITOSO

## Prerrequisitos para la siguiente fase

- Fase 1 completada y marcada como terminada en `doc/ESTADO_EJECUCION_PLAYAALTA.md`.
- Login admin en modo seed listo.
- Inventario de seed con 6 productos demo disponible.
- `dataService` y rutas API iniciales implementadas.
