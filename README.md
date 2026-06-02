# Shipping App - El Loco Casaca

App de gestión de envíos del marketplace "El Loco Casaca". Es una de las 5 webapps del proyecto y se ocupa de la parte logística: registrar envíos, actualizar estados, ver el historial de tracking y avisar a Feedback cuando un envío se entrega.

## Link de producción
https://proyecto-c-shipping2-ellococasaca.vercel.app

## Usuarios de prueba

- `logistics+clerk_test@iaw.com` (operador logístico)
Para despues:
- `admin+clerk_test@iaw.com` (administrador)

Contraseña para los dos: `iawuser#`

## Cómo usarla

Entrando al link redirige al login de Clerk. Logueando con cualquiera de los usuarios de arriba se accede al panel, donde está la tabla de envíos con busqueda, filtro por estado y paginacion (todo manejado por parámetros en la URL).

Haciendo click en "Ver" en una fila se abre el detalle del envio con el historial completo y un form para cambiar el estado. Si se cambia a DELIVERED, se dispara la llamada (mockeada) a la Feedback App.

## Endpoints de la API

Pensados para que las otras apps los consuman en Etapa 3. Por ahora están sin auth para que luego se llamen vía JWT entre servicios.

- `GET /api/shipments` - listado con filtros (`sellerId`, `status`, `page`, `limit`)
- `POST /api/shipments` - crear envío (lo llama Payments tras un pago aprobado)
- `GET /api/shipments/{id}/tracking` - seguimiento del envío
- `PATCH /api/shipments/{id}/status` - cambiar el estado (lo usa el panel)

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- PostgreSQL en Neon 
- Prisma 6 como ORM
- Clerk para autenticación
- Zod para validaciones
- Vercel para el deploy

## Notas

- El mock de Feedback se ejecuta cada vez que un envío pasa a DELIVERED, ya sea desde el panel o via el endpoint PATCH. El "log" aparece en los runtime logs de Vercel.
- Solo el panel (`/panel/*`) está protegido con Clerk.
- Hay 15 envíos cargados como datos de prueba, cubriendo todos los estados (PENDING, PREPARING, SHIPPED, IN_TRANSIT, DELIVERED, CANCELED) y con vendedores/compradores/ciudades diferentes. 
