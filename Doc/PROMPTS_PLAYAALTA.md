# PROMPTS DE IMPLEMENTACIÓN — Playa Alta Inventory
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_PLAYAALTA.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_PLAYAALTA.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_PLAYAALTA.md
2. Leer doc/ESTADO_EJECUCION_PLAYAALTA.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_PLAYAALTA.md y crear el archivo
doc/ESTADO_EJECUCION_PLAYAALTA.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase,
  evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de sistemas de inventario para el sector gastronómico.

Tu mentalidad: Playa Alta Inventory lo usan el administrador del restaurante
y los cocineros/almacenistas. El administrador lo abre desde su oficina en
el computador. El cocinero lo consulta desde una tablet en la cocina para
saber qué ingredientes están disponibles hoy. La arquitectura tiene que ser
sólida y el diseño visual tiene que evocar el ambiente del restaurante.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_PLAYAALTA.md — secciones 7 (stack — Playa Alta NO usa Resend),
   8 (reglas de oro — especialmente regla 2 sobre restock por suma), 9
   (seed.json con admin y los 6 productos demo — nota que Sal tiene 2 kg
   con mínimo 3, lo que activa la alerta desde el primer arranque), 12
   (blobAudit) y 16 (identidad visual del login — fondo arena, naranja
   como primario, logo de ola + caja)
2. doc/ESTADO_EJECUCION_PLAYAALTA.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— Dos roles: 'empleado' y 'admin'. El JWT incluye el role. Ambos aterrizan
  en /inventory al hacer login — no hay dashboards distintos.

— No hay registro público. El formulario de login no tiene link de
  "Crear cuenta". Los empleados los crea el admin.

— El seedReader expone los 6 productos demo para que en modo seed el
  inventario ya muestre datos (con Sal en alerta) antes del bootstrap.

— El token de Blob lazy, get() del SDK de Blob, withFileLock — patrón
  estándar del curso.

— La identidad visual del login: fondo arena (#FEF9F0), tarjeta con borde
  superior naranja (#EA580C), logo de ola con caja, tipografía Inter.
  Sección 16 del plan.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → cookie con role='admin' → modo seed
  con los 6 productos demo visibles en el inventario
- Registra el cierre en ESTADO_EJECUCION_PLAYAALTA.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Layout, Panel de Inventario y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. Playa Alta Inventory es una aplicación con una sola
pantalla principal: el inventario. Toda la acción ocurre ahí — buscar,
filtrar, ver alertas, agregar, editar. El diseño tiene que ser funcional
para alguien que lo usa con las manos llenas en una cocina de restaurante.

Tu mentalidad: el AlertBanner naranja es el elemento más importante de la
pantalla cuando hay productos en riesgo. Un cocinero que abre la app a las
6am tiene que ver en segundos si el aceite está por acabarse — sin tener
que leer cada tarjeta del inventario.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_PLAYAALTA.md — paleta de colores completa (sección 16 —
   naranja como primario, categorías con colores distintos), los componentes
   ProductCard, AlertBanner, SummaryPanel, SearchBar y CategoryFilter,
   y la Fase 2 completa
2. doc/ESTADO_EJECUCION_PLAYAALTA.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar del empleado tiene solo dos ítems: Inventario y Perfil.
  El sidebar del admin tiene: Inventario, Administración (Usuarios +
  Auditoría) y Perfil. El empleado nunca ve opciones de administración.

— El AlertBanner es naranja (fondo #FFFBEB, borde #D97706). Muestra los
  nombres y cantidades de los productos en alerta: "⚠️ Productos con stock
  bajo: Sal (2 kg), Aceite (1 L)". Si no hay alertas: no se renderiza —
  la ausencia del banner es la señal positiva de que todo está bien.

— El SummaryPanel tiene tres tarjetas: "Total Productos" (número en grande),
  "Alertas Activas" (número en naranja si > 0, verde si = 0), "Categorías"
  (número de categorías distintas en uso).

— Los badges de categoría en las ProductCard tienen colores distintos por
  categoría (sección 16 del plan): Carnes = rojo, Bebidas = azul,
  Verduras = verde, etc. No usar el mismo color para todas.

— El botón "➕ Agregar Producto" solo aparece si el usuario tiene
  role='admin'. El empleado ve las tarjetas pero no tiene ese botón.

— La página /admin/db-setup informa: "Aplicará 2 migrations y cargará:
  1 usuario admin y 6 productos demo del restaurante."

Al terminar:
- Verificar que el AlertBanner aparece con Sal en alerta desde el primer
  arranque (seed tiene Sal: 2 kg, mínimo: 3 kg)
- Verificar los badges de categoría con sus colores distintos
- Verificar que el botón "Agregar Producto" no aparece para el empleado
- Bootstrap completo → 6 productos demo en Supabase
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_LAYOUT.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — CRUD de Productos y Restock

### Rol: `Ingeniero Fullstack — Operaciones del inventario`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en sistemas de
gestión de inventario para restaurantes, con validaciones de integridad de
datos y alertas automáticas de stock.

Tu mentalidad: cada operación sobre el inventario tiene consecuencias
inmediatas para la cocina del restaurante. Un stock equivocado puede
significar que el cocinero intente preparar un plato con ingredientes que
no hay. Las validaciones tienen que ser estrictas y las alertas tienen que
activarse y desactivarse en tiempo real.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_PLAYAALTA.md — migration 0002 (products con el UNIQUE en
   LOWER(name), los CHECK de cantidad y stock mínimo), reglas RN-01 al
   RN-08, la operación restockProduct (sección 10.2 — SUMA, no reemplaza),
   y la Fase 3 completa
2. doc/ESTADO_EJECUCION_PLAYAALTA.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— RN-06 — UNIQUE case-insensitive: `CREATE UNIQUE INDEX ON products(LOWER(name))`.
  "Arroz", "ARROZ" y "arroz" son el mismo producto. Al capturar el error de
  Postgres (código '23505'): retornar 409 con "Ya existe un producto con
  ese nombre."

— restockProduct en el dataService es una SUMA, no un reemplazo:
  UPDATE products SET quantity = quantity + $amount WHERE id = $id
  NUNCA: UPDATE products SET quantity = $amount
  Si el administrador ingresa 15 kg nuevos y el producto tenía 20 kg,
  el resultado debe ser 35 kg, no 15 kg.

— La alerta se evalúa en el servidor y en el cliente:
  En el servidor: getLowStockProducts() hace:
  SELECT * FROM products WHERE quantity <= min_stock
  En el cliente: ProductCard evalúa `product.quantity <= product.min_stock`
  para mostrar el badge individualmente.
  El AlertBanner usa la respuesta del servidor (GET /api/products/alerts).

— La búsqueda y el filtro se pueden combinar:
  GET /api/products?q=pol&category=Carnes
  La query hace: WHERE LOWER(name) ILIKE '%pol%' AND category = 'Carnes'
  Si no se envía q o category: no se filtra por ese criterio.

— El ProductForm tiene validación INLINE — los mensajes de error aparecen
  debajo de cada campo al perder el foco o al intentar guardar, no en un
  toast genérico. El formulario no puede enviarse con campos inválidos.
  Mensajes específicos del spec:
  - Nombre vacío: "Este campo es obligatorio"
  - Nombre duplicado: "Ya existe un producto con este nombre"
  - Cantidad negativa: "La cantidad no puede ser negativa"
  - Stock mínimo negativo: "El stock mínimo no puede ser negativo"

Al terminar:
- Verificar RN-06: crear "Arroz" → intentar crear "arroz" → 409
- Verificar restock: producto con 20 kg + restock 15 → debe quedar 35 kg
- Verificar alerta en tiempo real: editar la cantidad de un producto por
  debajo del mínimo → badge aparece + AlertBanner se actualiza
- Subir la cantidad por encima del mínimo → badge desaparece + banner
  se actualiza (si no hay más productos en alerta, el banner desaparece)
- Verificar que el empleado recibe 403 al intentar POST /api/products
- Verificar validación inline del formulario: intentar guardar con nombre
  vacío → mensaje debajo del campo (no toast)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_CRUD.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Administración y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de Playa Alta Inventory.

Tu mentalidad: Playa Alta es un restaurante real. El administrador que
abre esta app confía en que los datos son correctos y en que las alertas
son confiables. Si el badge de stock bajo no desaparece cuando el cocinero
registra una entrada, o si la búsqueda no filtra correctamente, el sistema
pierde credibilidad y el personal vuelve al Excel.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_PLAYAALTA.md — Fase 4 completa, los requerimientos no funcionales
   (RNF-01 al RNF-06) y las restricciones del sistema (sección 18)
2. doc/ESTADO_EJECUCION_PLAYAALTA.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Lo que debes completar en esta fase:

Administración de usuarios:
POST genera contraseña temporal con crypto.randomBytes (12 chars),
must_change_password=true, retorna en claro una sola vez con modal y
botón "Copiar". En login: must_change_password → redirect a /profile.
Crear app/admin/users/page.tsx: tabla con nombre, email y estado.
Acciones: activar/suspender.
Crear app/admin/audit/page.tsx: AuditViewer con selector de mes.

Empty states con el tono del restaurante:
- Inventario vacío (si se borraron todos los productos): "El inventario
  está vacío. Agrega el primer producto para empezar."
- Búsqueda sin resultados: "No encontramos '[término]' en el inventario."
  Con botón "Crear producto" visible solo para el admin.
- Filtro de categoría sin resultados: "No hay productos en la categoría
  [X]." Con sugerencia de usar "Todas".
- AlertBanner sin alertas: no mostrar nada — la ausencia del banner es
  la señal positiva.

Manejo de errores global:
- 401: sesión expirada → toast + redirect a /login.
- 403 (empleado en ruta admin): redirect silencioso a /inventory.
- 409 nombre duplicado: toast "Ya existe un producto con ese nombre."
- 500: toast genérico.

Verificar la búsqueda combinada con filtro:
Ingresar "pol" en el buscador + seleccionar "Carnes" como categoría
→ solo debe aparecer "Pollo entero" (si existe). Si se cambia la
categoría a "Bebidas" con "pol" en el buscador → sin resultados.
Los dos filtros son aditivos — no alternativos.

Verificar en tablet (768px) y celular (375px):
Las ProductCard deben verse legibles sin scroll horizontal. Los botones
de editar y eliminar deben ser tocables (mínimo 44px). El RestockModal
debe ser accesible desde el celular.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo con ambos roles:
Admin: bootstrap → verificar 6 productos demo con Sal en alerta →
crear nuevo producto → editar → crear empleado con contraseña temporal.
Empleado: primer login → cambiar contraseña → consultar inventario →
buscar por nombre → registrar entrada de Sal (llevar stock por encima
del mínimo) → verificar que la alerta desaparece.

Al cerrar el proyecto:
- Registra la Fase 4 como Completada en ESTADO_EJECUCION_PLAYAALTA.md
  con la URL de producción
- Crea doc/RESUMEN_FASE_4_PULIDO_FINAL.md con: URL de producción, URL
  del repositorio, funcionalidades implementadas, stack, tablas de
  Supabase, decisiones técnicas destacadas (UNIQUE case-insensitive,
  restock por suma no reemplazo, alerta evaluada en servidor y en cliente,
  badge por categoría con colores distintos, AlertBanner que desaparece
  cuando no hay alertas) y estado final del proyecto

El proyecto Playa Alta Inventory está terminado. Tu trabajo en este
repositorio concluye aquí.
```

---

> Juan Orozco — Doc: 1082916198
> Curso: Lógica y Programación — SIST0200
