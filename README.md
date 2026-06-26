# Shipping App - El Loco Casaca

App de gestión de envíos del marketplace "El Loco Casaca". Es una de las 5 webapps del proyecto y se ocupa de la parte logística: registrar envíos, actualizar estados, asignar repartidores, ver el historial de tracking y avisar a las otras apps (Feedback, Payments, Seller) cuando cambia un envío.

## Link de producción
https://proyecto-c-shipping2-ellococasaca.vercel.app

## Roles y acceso

La app maneja dos roles vía `publicMetadata.role` en Clerk:

- **admin**: ve todos los envíos en `/panel`, cambia estados y asigna repartidores.
- **courier**: ve sus envíos asignados en `/repartidor` y actualiza el estado de entrega.

Al iniciar sesión, la home redirige automáticamente a `/panel` o `/repartidor` según el rol del usuario.

## Cómo usarla

Entrando al link, el header tiene el botón de inicio de sesión (modal de Clerk). Una vez logueado, según el rol se accede al panel de admin o a la vista de repartidor.

En el panel de admin está la tabla de envíos con búsqueda, filtro por estado y paginación (manejados por parámetros en la URL). Haciendo click en "Ver" en una fila se abre el detalle del envío con el historial completo, un form para cambiar el estado y la asignación de repartidor.

## Endpoints de la API

Pensados para que las otras apps del sistema los consuman.

- `GET /api/shipments` - listado con filtros (`sellerId`, `status`, `page`, `limit`)
- `POST /api/shipments` - crear envío (lo llama Payments tras un pago aprobado)
- `GET /api/shipments/{id}/tracking` - seguimiento del envío
- `PATCH /api/shipments/{id}/status` - cambiar el estado del envío
- `GET /api/couriers` - lista de repartidores disponibles
- `PATCH /api/shipments/{id}/courier` - asignar/reasignar repartidor

## Integraciones salientes

Cuando cambia el estado de un envío, la app notifica a otras webapps. Todas las llamadas son no bloqueantes (si una falla, se loguea el error y el cambio de estado se completa igual):

- **Feedback**: al pasar a DELIVERED, habilita la reseña del pedido.
- **Payments**: al pasar a DELIVERED libera el pago (approved); al pasar a CANCELED lo rechaza (rejected).
- **Seller**: en cada cambio de estado, le avisa el nuevo estado del pedido.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- PostgreSQL en Neon
- Prisma 6 como ORM
- Clerk para autenticación
- Zod para validaciones
- Vercel para el deploy

## Notas

- Las integraciones con Feedback, Payments y Seller se ejecutan tanto desde el panel como desde el endpoint PATCH de la API. Los logs aparecen en los runtime logs de Vercel.
- Las rutas protegidas con Clerk son `/panel/*` (admin) y `/repartidor/*` (courier).
- Las URLs de los servicios externos se configuran por variables de entorno (`FEEDBACK_API_URL`, `PAYMENTS_API_URL`, `SELLER_API_URL`).
- Hay 15 envíos cargados como datos de prueba, cubriendo todos los estados (PENDING, PREPARING, SHIPPED, IN_TRANSIT, DELIVERED, CANCELED).