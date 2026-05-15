# Resumen Fase 2 — Layout, Panel de Inventario y bootstrap

## Objetivo

Diseñar y construir la interfaz principal del inventario para Playa Alta Inventory, con enfoque en alertas claras, panel de resumen, búsqueda, filtro de categoría y navegación role-based.

## Acciones ejecutadas

- Implementado layout principal de inventario con sidebar y área de contenido.
- Creado `components/Sidebar.tsx` con menú role-based:
  - Empleado: Inventario y Perfil.
  - Admin: Inventario, Administración (DB setup, Usuarios, Auditoría) y Perfil.
- Creado `components/InventoryShell.tsx` para renderizar la pantalla de inventario completa.
- Creado `components/AlertBanner.tsx` con estilo naranja (`#FFFBEB`, borde `#D97706`) y lista de productos en alerta.
- Creado `components/SummaryPanel.tsx` con tarjetas: Total Productos, Alertas Activas y Categorías.
- Creado `components/SearchBar.tsx` con debounce de 300ms y `components/CategoryFilter.tsx` para filtros aditivos.
- Creado `components/ProductCard.tsx` con badging de categoría en colores distintos y acciones de edit/delete visibles solo para admin.
- Añadido `components/SeedModeBanner.tsx` para resaltar el modo seed activo.
- Creado la ruta admin `/admin/db-setup` con la información de bootstrap requerida.
- Añadida la ruta API `/api/products/summary` para el resumen de inventario.
- Implementado `middleware.ts` para proteger `/admin/*` y redirigir a `/inventory` si no es admin.
- Ajustados estilos globales en `app/globals.css` a la paleta de Playa Alta y actualizado `app/layout.tsx`.

## Archivos modificados / creados

- `app/inventory/page.tsx`
- `app/admin/db-setup/page.tsx`
- `app/api/products/summary/route.ts`
- `middleware.ts`
- `app/layout.tsx`
- `app/globals.css`
- `components/AlertBanner.tsx`
- `components/CategoryFilter.tsx`
- `components/BootstrapPanel.tsx`
- `components/InventoryShell.tsx`
- `components/ProductCard.tsx`
- `components/SearchBar.tsx`
- `components/Sidebar.tsx`
- `components/SeedModeBanner.tsx`
- `components/SummaryPanel.tsx`
- `components/categoryColors.ts`

## Decisiones técnicas

- El inventario se construye con una sola pantalla principal y un sidebar role-based para mantener la experiencia simple y directa.
- El AlertBanner se renderiza solo si hay productos con `quantity <= minStock`.
- Los badges de categoría usan colores distintos según la especificación del plan: Carnes, Bebidas, Verduras, Granos, Lácteos, Condimentos y Otros.
- El botón "➕ Agregar Producto" se muestra solo para admin.
- Se creó un middleware para asegurar `/admin/*` sin depender únicamente de los controles de UI.

## Problemas encontrados y resolución

- El build fallaba en producción porque `lib/auth.ts` evaluaba `JWT_SECRET` en tiempo de importación. Se corrigió moviendo la lectura de env variables a una función lazy.

## Qué se probó y resultado

- `npm run typecheck` — sin errores.
- `node node_modules/next/dist/bin/next build` — build exitoso.
- Verificación manual de la UI de inventario (modo seed con Sal en alerta).
- Verificación de que el botón "Agregar Producto" solo aparece para admin.
- Verificación de los badges de categoría con colores distintos.
- Verificación de la página `/admin/db-setup` y del texto de bootstrap.

## Estado final

EXITOSO

## Prerrequisitos para la siguiente fase

- Fase 2 completada y marcada en `doc/ESTADO_EJECUCION_PLAYAALTA.md`.
- Interfaz de inventario con alertas y filtros lista.
- `middleware.ts` y validaciones role-based implementadas.
