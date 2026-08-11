# Rent A Boat Cadaqués

Sitio + backend de reservas para el alquiler de embarcaciones en Cadaqués / Port Lligat.

## Cómo está montado

- **`public/`** — el sitio de cara al público (home, listado de barcos, 9 fichas, experiencias, FAQ, contacto). HTML/CSS/JS plano, sin build, en 4 idiomas (CA/ES/FR/EN) vía switch client-side (`js/i18n.js` + `js/translations.js`). Las URLs limpias (`/vaixells/`, `/vaixells/minola/`, etc.) se resuelven con `rewrites` en `next.config.ts`.
- **`app/api/`** — el backend: catálogo de barcos, disponibilidad, checkout de Stripe, webhook, panel admin.
- **`app/admin/`** — panel de administración (login + gestión de reservas y precios).
- **`prisma/schema.prisma`** — dos tablas: `Boat` (una fila por barco) y `Booking` (una reserva = una barca entera para un día y un turno, no hay cupos por persona como en una actividad de buceo).
- **`scripts/`** — herramientas de una sola vez, no forman parte del sitio en producción:
  - `generate-boat-pages.js`: regenera las 9 fichas de barco desde `public/data/boats.json`.
  - `compress-images.js`: comprime las fotos de `public/img/boats/`.
  - `download-images.sh`: bajó las fotos originales del WordPress (ya no hace falta volver a correrlo).

## Cómo funciona una reserva

1. El cliente rellena el formulario en la ficha del barco (fecha, turno, patrón opcional, datos de contacto).
2. `POST /api/bookings/create-checkout` valida disponibilidad, **recalcula el precio en el servidor** (nunca se confía en lo que mande el navegador) y crea una Stripe Checkout Session por el 20% de depósito.
3. El cliente paga en la página de Stripe.
4. Stripe llama a `POST /api/bookings/webhook` (`checkout.session.completed`) → ahí, y solo ahí, se crea la fila `Booking` en la base de datos y se manda el email de confirmación (cliente + admin).
5. El cliente vuelve a `/booking-success.html` con la referencia de la reserva.

Esto significa que una reserva que no se paga **no deja rastro** en la base de datos — no hay que limpiar reservas fantasma.

**Límite conocido:** la disponibilidad solo se comprueba al crear la sesión de Stripe, sin bloqueo a nivel de base de datos. Si dos personas inician el pago para la misma barca/fecha exactamente a la vez, las dos podrían llegar a pagar. A la escala de 9 barcos es un riesgo aceptable; si el volumen crece, hay que añadir un lock.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y rellena los valores reales, ver abajo
npm run db:push        # crea las tablas en tu base de datos
npm run db:seed        # carga los 9 barcos desde public/data/boats.json
npm run dev
```

### Variables de entorno necesarias

Ver `.env.example` para la lista completa. Resumen de qué es cada cosa:

| Variable | De dónde sale |
|---|---|
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Neon Postgres — igual que en `cadaquesdivers-reservas`. Se puede crear desde Vercel (Storage → Neon) o desde [console.neon.tech](https://console.neon.tech). |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Al registrar el endpoint `https://tu-dominio.com/api/bookings/webhook` en [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks), escuchando el evento `checkout.session.completed` |
| `EMAIL_HOST/PORT/USER/PASS/FROM` | Gmail con contraseña de aplicación: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `NEXT_PUBLIC_APP_URL` | El dominio real donde quede publicado |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Los eliges tú — es el login del panel `/admin` |

**Sin estas variables reales, el sitio de marketing funciona igual** (usa `public/data/boats.json` como respaldo si `/api/boats` falla), pero reservar, pagar y el panel admin no van a funcionar — fallan de forma controlada, no rompen la página.

### Editar precios sin tocar código

Una vez la base de datos esté puesta en marcha, entrando a `/admin` se pueden editar precios, el recargo del patrón, la fianza y activar/desactivar barcos directamente — no hace falta redeploy. `public/data/boats.json` sigue existiendo como semilla inicial y como respaldo estático, pero ya no es la fuente de verdad una vez la DB está en marcha.

### Después de cambiar `public/data/boats.json`

```bash
npm run gen:boats   # regenera las 9 fichas de barco (contenido/specs)
npm run db:seed     # trae los cambios a la base de datos (usa --force para sobrescribir precios ya editados a mano)
```
