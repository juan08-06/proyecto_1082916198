# Resumen Fase 3 — CRUD de Productos y Restock

## Objetivos
- Implementar CRUD completo de productos en modo seed.
- Añadir registro de entrada (`restock`) que sume cantidad existente.
- Validación de formulario con mensajes inline.
- Enforce RN-06: nombres únicos de producto case-insensitive.
- Usar respuesta del servidor para mostrar alertas y mantener la UI consistente.
- Añadir rutas API de producto y búsqueda / filtrado.
- Crear migración de producto para base de datos.

## Acciones realizadas
- Extendí `lib/dataService.ts` para soportar:
  - `getProducts({query, category})`
  - `createProduct`
  - `updateProduct`
  - `deleteProduct`
  - `restockProduct`
  - `getLowStockProducts`
- Añadí soporte de lectura/escritura de productos en `lib/seedReader.ts`.
- Implementé validaciones `zod` en `lib/validators.ts` para producto y restock.
- Añadí rutas API REST completas en `app/api/products`:
  - `GET /api/products?q=&category=`
  - `POST /api/products`
  - `GET /api/products/:id`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
  - `PATCH /api/products/:id/restock`
  - `GET /api/products/alerts`
- Creé componentes de UI para Fase 3:
  - `components/ProductForm.tsx`
  - `components/RestockModal.tsx`
- Actualicé `components/InventoryShell.tsx` para manejar estado de productos, búsqueda, filtrado, CRUD y restock.
- Actualicé `components/AlertBanner.tsx` para obtener alertas desde la API en lugar de calcularlas solo del cliente.
- Añadí migración SQL `supabase/migrations/0002_init_products.sql` con índice único case-insensitive.

## Resultados
- El inventario ahora puede crear, editar, eliminar y reabastecer productos en modo seed.
- Las validaciones muestran mensajes claros:
  - "Este campo es obligatorio"
  - "Ya existe un producto con este nombre"
  - "La cantidad no puede ser negativa"
  - "El stock mínimo no puede ser negativo"
- Las alertas de stock bajo consultan el backend para permanecer sincronizadas.
- Se documentó el avance de Fase 3 en el estado del proyecto.
