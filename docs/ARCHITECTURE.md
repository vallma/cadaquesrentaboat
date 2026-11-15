# ARCHITECTURE.md — Nueva plataforma de Cadaqués Rent a Boat

Estado: propuesta. Nada de esto está implementado. Las decisiones marcadas con **D-n** están abiertas y se listan en `ROADMAP.md`.

## 1. Objetivos y límites

**Objetivos**

1. Conservar la identidad visual actual (paleta, tipografías, logo, estructura de ficha) y todas las funciones que hoy usa el cliente.
2. Sustituir la «solicitud» actual por una reserva con disponibilidad real y sin dobles reservas.
3. Añadir un buscador con mapa interactivo centrado en Cadaqués y Port Lligat, con lista y mapa sincronizados.
4. Dar al negocio un panel propio para barcos, precios, calendario y reservas, sin CMS.
5. Mejorar SEO, rendimiento e idiomas sin perder el posicionamiento de las URLs actuales.

**Límites**

- El WordPress actual no se modifica ni se elimina. La plataforma nueva se construye y valida en otro dominio; el cambio se hace por DNS al final y es reversible.
- Sin CMS de terceros. Todo el contenido editable vive en PostgreSQL y se gestiona desde el panel propio.
- Escala real: 9 barcos, 2 puntos de salida, 4 idiomas, un negocio estacional. La arquitectura debe ser pequeña y mantenible por una persona.

## 2. Stack

| Capa | Elección | Motivo |
|---|---|---|
| Framework | Next.js (App Router), última versión estable al iniciar | Renderizado en servidor y estático para SEO; Server Actions para el panel |
| Lenguaje | TypeScript en modo estricto | Tipos generados desde la base de datos |
| Base de datos | PostgreSQL en Supabase, región de la UE | Requisito; restricciones de exclusión para la disponibilidad |
| Extensiones | `btree_gist`, `postgis`, `pg_cron` | Anti-solapes, coordenadas, caducidad de bloqueos |
| Autenticación | Supabase Auth, solo para el equipo | Los clientes reservan sin cuenta |
| Archivos | Supabase Storage | Fotos de barcos y documentos |
| Mapa | MapLibre GL JS | Requisito; sin licencia por uso |
| Teselas | Proveedor de teselas vectoriales (**D-7**) | MapLibre no incluye mapa base |
| Estilos | Tailwind CSS con tokens extraídos de la web actual | Reproducir la identidad con pocos componentes propios |
| Validación | Zod, compartido entre formularios, acciones y webhooks | Una sola definición de cada entrada |
| i18n | `next-intl` con rutas por idioma | ca por defecto sin prefijo; `/es`, `/en`, `/fr` |
| Pagos | Redsys o Stripe (**D-2**), detrás de una interfaz común | La web actual carga Redsys; hay que confirmar contrato |
| Email | Servicio transaccional (**D-9**) con plantillas en 4 idiomas | Confirmaciones y avisos al equipo |
| Hosting | Vercel (**D-8**) | Encaje directo con Next.js; previsualizaciones por rama |
| Pruebas | Vitest (lógica de precios y disponibilidad) y Playwright (flujo de reserva) | El riesgo está en esas dos piezas |

## 3. Vista general

```
                    ┌──────────────────────────────────────────────┐
  Visitante ───────▶│  Next.js                                     │
                    │  ├─ (public)  páginas estáticas/ISR por idioma│
                    │  ├─ /buscar   lista + mapa MapLibre           │
                    │  ├─ /reserva  flujo de reserva                │
  Equipo ──────────▶│  ├─ /admin    panel propio (sesión Supabase)  │
                    │  └─ /api      webhooks de pago, disponibilidad│
                    └───────┬──────────────────────┬───────────────┘
                            │                      │
                  ┌─────────▼─────────┐   ┌────────▼────────┐
                  │ Supabase          │   │ Pasarela de pago │
                  │ Postgres + RLS    │◀──│ (webhook firmado)│
                  │ Auth · Storage    │   └──────────────────┘
                  └─────────┬─────────┘
                            │
                   Email transaccional · Teselas del mapa
```

Principios:

- **La base de datos es la fuente de verdad** de catálogo, precios, disponibilidad y reservas. Las reglas críticas (no solapar, importes) se garantizan en Postgres, no solo en la interfaz.
- **El navegador nunca escribe directamente en tablas sensibles.** Las escrituras pasan por Server Actions o rutas de API que validan con Zod y usan funciones SQL.
- **Lo público se sirve estático** y se regenera cuando el panel guarda un cambio. La disponibilidad y el precio final se consultan en vivo.

## 4. Modelo de datos

Borrador. Los nombres de columnas definitivos se fijan en la fase 1, después de validar el catálogo (ver contradicciones C1–C17 de `AUDIT.md`).

### 4.1 Catálogo

| Tabla | Contenido |
|---|---|
| `locations` | Puntos de salida (Cadaqués, Port Lligat): nombre, `geog` (punto PostGIS), instrucciones de embarque |
| `boat_types` | Llanxa, llaüt, semirrígida |
| `boats` | `slug`, tipo, punto de salida, eslora, potencia, plazas, plazas recomendadas, `requires_license`, modo de patrón (`none` / `optional` / `required`), combustible incluido, fianza, matrícula, estado (`draft` / `published` / `archived`), orden, coordenadas propias opcionales |
| `boat_translations` | Por barco e idioma: nombre, descripción, título SEO, meta description |
| `boat_images` | Ruta en Storage, orden, portada, ancho y alto; `alt` por idioma |
| `amenities`, `boat_amenities` | Equipamiento (toldo, nevera, escalera de baño, solárium, GPS…) con traducciones |
| `extras` | Patrón, Garantía Meteo, paddle surf, snorkel…: tipo de precio (fijo, por franja, porcentaje) y a qué barcos aplica |

El campo `requires_license` y el modo de patrón sustituyen a las etiquetas actuales, que hoy se contradicen (C4, C6, C7). De ellos se deriva todo: el filtro «sin licencia», el texto de la ficha y la lógica del formulario.

### 4.2 Precios

| Tabla | Contenido |
|---|---|
| `slots` | Franjas reservables: mañana, tarde, día completo, con hora de inicio y fin (**D-1**) |
| `seasons` | Rangos de fechas con nombre (opcional, **D-5**) |
| `boat_prices` | Precio por barco, franja y temporada |

El precio se calcula siempre en el servidor con una función única, `quote(boat, fecha, franja, extras)`, que devuelve el desglose: alquiler, extras, total, anticipo y resto. La usan la ficha, el flujo de reserva, el panel y el webhook de pago, de modo que el importe mostrado y el cobrado no pueden divergir.

### 4.3 Disponibilidad y reservas

| Tabla | Contenido |
|---|---|
| `bookings` | Barco, `period` (`tstzrange`), franja, estado, cliente, n.º de personas, titulación declarada, patrón, desglose de importes congelado, idioma, origen (web / panel), `hold_expires_at` |
| `booking_extras` | Extras contratados con su precio en el momento de reservar |
| `customers` | Nombre, email, teléfono y, solo si el negocio lo justifica (**D-6**), documento y dirección |
| `payments` | Reserva, proveedor, referencia externa, tipo (anticipo / resto / fianza / reembolso), importe, estado, carga útil del webhook |
| (bloqueos) | Filas de `bookings` con `kind = 'block'` y motivo (mantenimiento, mal tiempo, uso propio, cierre de temporada), sin cliente ni importes |
| `booking_events` | Historial de cambios de estado y quién los hizo |

Estados de una reserva:

```
hold ──pago ok──▶ confirmed ──▶ completed
  │                  │
  └─caduca─▶ expired └─▶ cancelled ──▶ refunded
```

Si el negocio quiere validar cada reserva a mano (**D-3**), se añade `pending_review` entre `hold` y `confirmed`.

**Garantía contra dobles reservas.** Una restricción de exclusión en Postgres impide dos reservas activas del mismo barco con periodos solapados:

```sql
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (boat_id WITH =, period WITH &&)
  WHERE (status IN ('hold', 'pending_review', 'confirmed'));
```

Como el día completo y las medias jornadas son rangos horarios, la misma regla cubre «mañana + tarde», «día completo frente a media jornada» y los bloqueos manuales, que se guardan en la misma tabla precisamente para compartir la restricción. Al iniciar el pago se crea un `hold` de unos 15 minutos; `pg_cron` caduca los que no se pagan. Las horas se guardan en UTC y se interpretan siempre en `Europe/Madrid`.

### 4.4 Experiencias

`experiences` (con traducciones), `experience_sessions` (fecha, hora, aforo, barco opcional) y `experience_bookings` (plazas). Hoy son eventos de fecha única ya pasados; el modelo permite varias sesiones por experiencia. Se construye solo si el negocio las mantiene (**D-10**).

### 4.5 Contenido y configuración

| Tabla | Contenido |
|---|---|
| `faqs` | Preguntas por idioma, globales o por barco |
| `pages` | Textos legales y páginas simples, por idioma |
| `settings` | Teléfono, WhatsApp, email, horario, porcentaje de anticipo, ventana de cancelación |
| `redirects` | URL antigua → nueva, con código (301 / 410) |
| `staff` | Usuarios del panel y su rol (`owner`, `staff`) |

### 4.6 Seguridad de datos (RLS)

- RLS activado en todas las tablas.
- Rol anónimo: solo lectura de catálogo publicado (barcos `published`, traducciones, imágenes, FAQ, páginas). Sin acceso a `bookings`, `customers` ni `payments`.
- Disponibilidad pública mediante una función que devuelve solo franjas libres u ocupadas, nunca datos de clientes.
- Equipo: acceso según `staff.role`.
- La clave de servicio se usa únicamente en el servidor: webhooks, creación de reservas y tareas programadas.
- El cliente consulta su reserva con un token aleatorio de un solo propósito incluido en el email, no con una cuenta.

## 5. Estructura de la aplicación

```
src/
  app/
    [locale]/
      (public)/
        page.tsx                      portada
        vaixells/page.tsx             buscador: lista + mapa
        vaixells/[slug]/page.tsx      ficha
        experiencies/…                listado y ficha
        preguntes-frequents/page.tsx
        contacte/page.tsx
        legal/[slug]/page.tsx
      reserva/[bookingId]/…           datos, pago, confirmación
    admin/…                           panel (sin prefijo de idioma)
    api/
      payments/webhook/route.ts
      availability/route.ts
    sitemap.ts · robots.ts
  components/   ui/ · boat/ · search/ · map/ · booking/ · admin/
  lib/
    db/         cliente Supabase y tipos generados
    pricing/    quote() y sus pruebas
    availability/
    payments/   interfaz común + adaptador del proveedor
    i18n/ · seo/ · email/
  messages/     ca.json · es.json · en.json · fr.json
supabase/
  migrations/ · seed.sql
```

### 5.1 Rutas e idiomas

- Catalán sin prefijo; `/es`, `/en`, `/fr`. Es el esquema actual, así que las URLs de idioma se conservan.
- Las rutas de fichas mantienen `/vaixells/{slug}` en todos los idiomas para no romper enlaces. Traducir los segmentos (`/es/barcos/…`) es posible con `next-intl`, pero implica más redirecciones (**D-11**).
- Slugs que cambian con 301: `/vaixells/2199` → `/vaixells/ray`, `/contacto-2` → `/contacte`, `/experiencies/prova` → slug real, `/embarcacions` → `/vaixells`.
- Textos de interfaz en archivos de mensajes; contenido de catálogo en tablas `*_translations`. Las traducciones automáticas actuales se revisan a mano antes de cargarlas.

### 5.2 Renderizado y caché

| Página | Estrategia |
|---|---|
| Portada, fichas, FAQ, legales | Estáticas, regeneradas por etiqueta cuando el panel guarda |
| Buscador | Catálogo estático; filtros en la URL; disponibilidad por fecha consultada en vivo |
| Flujo de reserva y panel | Dinámico, sin caché |

Los filtros viven en los parámetros de la URL (`?data=…&persones=…&tipus=…&llicencia=…`), de modo que una búsqueda se puede compartir y el botón «atrás» funciona.

## 6. Buscador con mapa

### 6.1 Comportamiento

- **Escritorio:** lista de tarjetas a la izquierda y mapa fijo a la derecha. Pasar el ratón por una tarjeta resalta su marcador; pulsar un marcador abre una tarjeta resumida con foto, precio «desde» y enlace a la ficha.
- **Móvil:** lista a pantalla completa con botón flotante «Mapa»; en el mapa, tarjeta inferior deslizable.
- **Filtros:** fecha, personas, tipo, precio máximo, licencia y patrón (los seis actuales) más punto de salida. Con fecha elegida, los barcos ocupados se muestran atenuados, no se ocultan.
- **Encuadre inicial:** la bahía de Cadaqués y Port Lligat, con límites de desplazamiento hasta el Cap de Creus.
- **Marcadores:** píldoras con el precio, renderizadas como elementos HTML sobre el mapa.

### 6.2 El problema de los dos puntos

Los 9 barcos salen de solo 2 lugares. Un mapa «tipo Airbnb» literal mostraría dos montones de marcadores superpuestos. Opciones, de menos a más trabajo (**D-4**):

| Opción | Descripción | Requiere |
|---|---|---|
| A. Agrupar por puerto | Un marcador por puerto con contador; al pulsarlo se despliegan sus barcos en abanico o en la tarjeta inferior | Nada más |
| B. Posición real de amarre | Cada barco en su boya o amarre | Coordenadas de cada barco |
| C. Mapa de destinos | Además de los barcos, capas con calas y puntos de interés (Cap de Creus, Casa Dalí, calas), con tiempos de navegación desde cada puerto | Datos de calas redactados por el negocio |

Recomendación: empezar con A y dejar el esquema preparado para B (coordenadas opcionales por barco) y C (tabla `places`). C es lo que realmente da valor a un mapa en este negocio, porque responde a «¿a dónde puedo llegar?».

### 6.3 Técnica

- MapLibre se carga solo en el cliente y de forma diferida: no entra en el JavaScript inicial ni afecta al renderizado de la lista.
- Los datos del mapa son un GeoJSON pequeño generado en el servidor a partir del catálogo.
- El mapa de cada ficha es una imagen estática con enlace a «Cómo llegar»; el mapa interactivo se reserva para el buscador.
- Accesibilidad: el mapa es un complemento. Toda la información está en la lista, navegable con teclado.

## 7. Flujo de reserva

1. En la ficha: fecha → franjas disponibles → extras (patrón, Garantía Meteo) → desglose en vivo con `quote()`.
2. Pregunta de titulación solo si el barco la exige. Sin titulación: el patrón se añade como obligatorio, con el precio visible, o se ofrecen los barcos sin licencia.
3. Datos del cliente: los mínimos (**D-6**).
4. Se crea un `hold`. Si la restricción de exclusión lo rechaza, la franja se acaba de ocupar y se informa al cliente.
5. Pago del anticipo en la pasarela.
6. El webhook firmado confirma la reserva. La confirmación nunca depende de que el navegador vuelva a la web.
7. Email al cliente en su idioma y aviso al equipo; página de confirmación con resumen, punto de embarque y botón de WhatsApp.

Reglas:

- Idempotencia: cada webhook se procesa una sola vez, identificado por la referencia del proveedor.
- Los importes de la reserva se congelan al crearla; un cambio de precio posterior no la altera.
- Cancelación y reembolso según una política única, definida en `settings` y mostrada igual en ficha, FAQ, email y texto legal (hoy se contradicen: C10, C11).
- Cobro del resto y de la fianza: registrados en `payments` desde el panel, se cobren en línea o en el puerto (**D-2**).

## 8. Panel de administración

Ruta `/admin`, protegida por sesión de Supabase y rol en `staff`. Interfaz en catalán y castellano.

| Módulo | Funciones |
|---|---|
| Calendario | Vista por día y semana de todos los barcos; crear reservas manuales (teléfono, WhatsApp) y bloqueos |
| Reservas | Listado con filtros, detalle, cambio de estado, registrar cobros, cancelar y reembolsar, reenviar email, historial |
| Barcos | Datos, traducciones por idioma, fotos (subida, orden, portada, alt), equipamiento, publicación |
| Precios | Tabla por barco, franja y temporada; extras |
| Experiencias | Fichas y sesiones (si se mantienen) |
| Contenido | FAQ, textos legales, datos de contacto y horario |
| Ajustes | Anticipo, ventana de cancelación, usuarios del equipo, redirecciones |

Pensado para usarse desde el móvil en el puerto: el calendario y el detalle de reserva son las pantallas prioritarias. Toda acción destructiva queda registrada en `booking_events`.

## 9. SEO y migración de URLs

- Metadatos por página e idioma desde `*_translations`; `hreflang` con `x-default`; canonical por idioma.
- JSON-LD: `LocalBusiness` en portada y contacto; `Product` con `Offer` en fichas; `FAQPage` en preguntas; `BreadcrumbList`.
- `sitemap.ts` generado desde la base de datos, solo con páginas públicas reales.
- Tabla `redirects` cargada con todas las URLs del inventario de `AUDIT.md`: 301 para las que tienen equivalente; 410 para productos de prueba, plantillas `?jet-theme-core=…` y autores.
- Imágenes: se migran a Storage con nombres descriptivos, se sirven con `next/image` en formatos modernos y con `alt` redactado por idioma.
- Antes del cambio de dominio: exportar de Search Console las URLs con tráfico y enlaces para comprobar que todas tienen destino.

## 10. Privacidad, seguridad y operación

- Datos en la UE. Minimización: no pedir documento ni dirección salvo que el contrato de alquiler lo exija (**D-6**), con plazo de conservación definido.
- Textos legales nuevos (privacidad, cookies, términos, devoluciones) con el titular real; los actuales no sirven. Deben redactarlos o revisarlos un profesional.
- Banner de consentimiento antes de cargar analítica.
- Secretos solo en variables de entorno del servidor. Webhooks con firma verificada. Límite de peticiones en formularios y en la creación de `holds`.
- Copias de seguridad de Supabase con recuperación a un punto en el tiempo durante la temporada alta.
- Tres entornos: local, previsualización (base de datos de pruebas, pasarela en modo test) y producción.
- Registro de errores y alerta al equipo si falla un webhook de pago o un email de confirmación.

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cargar datos de catálogo erróneos | Validar la tabla de `AUDIT.md` §4 con el negocio antes de la fase 2 |
| Perder reservas durante el cambio | Cambio fuera de temporada; importar reservas vivas; WordPress intacto como respaldo |
| Caída de posicionamiento | Mapa de redirecciones completo y seguimiento en Search Console |
| Integración de Redsys más lenta de lo previsto | Interfaz de pagos común; pruebas en modo test desde la fase 4 |
| Lógica oculta en snippets PHP | Exportarla y revisarla en la fase 0 |
| Mapa con poco valor por tener solo 2 puntos | Decidir **D-4** pronto; opción C como diferenciador |
