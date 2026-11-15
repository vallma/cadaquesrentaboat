# ROADMAP.md — Reconstrucción de cadaquesrentaboat.com

Estado: propuesta. No se empieza a programar hasta cerrar la fase 0.

Regla fija en todas las fases: **el WordPress actual no se toca**. La plataforma nueva vive en un dominio de pruebas hasta la fase 8.

Tamaño de cada fase: S (días), M (una a dos semanas), L (más de dos semanas), para una persona a dedicación completa. Son órdenes de magnitud, no compromisos.

---

## Decisiones pendientes

Las marcadas como **bloqueantes** impiden empezar la fase indicada.

| # | Decisión | Opciones | Recomendación | Bloquea |
|---|---|---|---|---|
| D-1 | Franjas de reserva | Mañana / tarde / día completo con horas fijas; por horas; varios días | Tres franjas fijas, con las horas que use hoy el negocio | Fase 1 |
| D-2 | Pasarela y cobro del resto | Redsys (ya cargado en la web actual); Stripe; resto en línea o en el puerto | Mantener la pasarela con contrato vigente; resto en el puerto, registrado en el panel | Fase 4 |
| D-3 | Confirmación | Automática al pagar el anticipo; revisión manual | Automática, con la restricción anti-solapes | Fase 4 |
| D-4 | Qué muestra el mapa | A: agrupado por puerto; B: amarre real; C: calas y destinos | A en el lanzamiento, C después | Fase 3 |
| D-5 | Temporadas de precio | Precio único; alta / media / baja | Modelo preparado para temporadas, cargado con un precio único si hoy no las hay | Fase 1 |
| D-6 | Datos del cliente | Mantener DNI y dirección; pedirlos solo en el embarque | Pedir en la web solo nombre, email, teléfono y personas | Fase 4 |
| D-7 | Proveedor de teselas | Servicio alojado; teselas propias en un archivo estático | Servicio alojado con plan gratuito suficiente para este tráfico | Fase 3 |
| D-8 | Hosting | Vercel; otro | Vercel | Fase 1 |
| D-9 | Email transaccional y remitente | Servicio transaccional con dominio propio | Dominio propio (`reserves@…`) en lugar de Gmail | Fase 4 |
| D-10 | Experiencias | Mantener; retirar; mostrar sin reserva en línea | Decidir según ventas de 2026 | Fase 6 |
| D-11 | Slugs por idioma | Mantener `/vaixells` en todos; traducir segmentos | Mantener: menos redirecciones | Fase 2 |
| D-12 | Garantía Meteo | Precio fijo; porcentaje; incluida | Lo que el negocio aplique hoy; definir un único texto | Fase 4 |
| D-13 | Titular legal y textos | — | Confirmar razón social y NIF; encargar los textos legales | Fase 7 |
| D-14 | Teléfono y WhatsApp oficiales | 648 869 034 o 620 288 126 | Uno solo en toda la web | Fase 2 |

## Información que debe aportar el negocio

1. Tabla del catálogo de `AUDIT.md` §4.1 corregida: nombre comercial de cada barco, eslora, potencia, plazas, licencia, patrón, puerto, precios, fianza y combustible. Resuelve las contradicciones C1–C17.
2. Horas de cada franja y política real de cancelación y mal tiempo.
3. Acceso de lectura al panel de WordPress: reservas vivas, configuración de JetBooking, snippets PHP y emails actuales.
4. Datos del contrato con la pasarela de pago.
5. Fotos originales en alta resolución y logo en vectorial.
6. Acceso a Search Console y a la analítica.
7. Quién gestiona el dominio y el DNS.

---

## Fase 0 — Cierre de definición (S)

- Resolver las decisiones bloqueantes de la fase 1 (D-1, D-5, D-8).
- Validar el catálogo con el negocio.
- Exportar de WordPress, en modo lectura: snippets, reservas futuras, textos de emails.
- Completar la auditoría con lo que faltó: móvil, rendimiento, Search Console, versiones ES / EN / FR enteras.
- Hacer una copia de seguridad completa del WordPress (ya tiene Duplicator instalado) como red de seguridad. La hace el propietario.

**Salida:** `AUDIT.md` sin incógnitas bloqueantes; decisiones registradas en este documento.

## Fase 1 — Cimientos (M)

- Repositorio, Next.js con TypeScript estricto, linting, CI y despliegue de previsualización.
- Proyecto Supabase en la UE: migraciones del esquema de `ARCHITECTURE.md` §4, RLS, tipos generados.
- Restricción anti-solapes y función `quote()`, con pruebas unitarias antes que cualquier interfaz.
- Tokens de diseño (colores y tipografías de `AUDIT.md` §7) y componentes base.
- i18n con los cuatro idiomas y el esquema de rutas actual.
- Carga inicial del catálogo validado.

**Salida:** base de datos con el catálogo real y pruebas de precios y disponibilidad en verde.

## Fase 2 — Web pública de catálogo (M)

- Portada, listado y ficha de barco con la estructura visual actual (galería, chips, descripción, equipamiento, ubicación, FAQ, similares).
- FAQ, contacto y páginas legales provisionales.
- Migración de imágenes a Storage con nombres y `alt` correctos.
- Metadatos, `hreflang`, JSON-LD y sitemap.
- Traducciones revisadas de ES, EN y FR.

**Salida:** web navegable en el dominio de pruebas, comparable página a página con la actual. Aún sin reserva.

## Fase 3 — Buscador con mapa (M)

- Filtros en la URL: fecha, personas, tipo, precio, licencia, patrón, punto de salida.
- MapLibre con la opción elegida en D-4: lista y mapa sincronizados en escritorio, conmutador y tarjeta inferior en móvil.
- Disponibilidad por fecha integrada en los resultados.
- Pruebas de rendimiento: el mapa no debe penalizar la carga de la lista.

**Salida:** buscador completo con datos reales.

## Fase 4 — Reserva y pago (L)

- Flujo de reserva: franjas, extras, titulación, datos, desglose.
- `hold` con caducidad, integración de la pasarela en modo test, webhook idempotente.
- Emails de confirmación en cuatro idiomas y aviso al equipo.
- Página de confirmación y consulta de reserva por enlace.
- Pruebas de extremo a extremo: reserva simultánea de la misma franja, pago fallido, webhook duplicado, caducidad.

**Salida:** reserva completa en modo test, sin posibilidad de doble reserva.

## Fase 5 — Panel de administración (L)

- Acceso del equipo y roles.
- Calendario, reservas manuales y bloqueos (prioridad: uso desde el móvil).
- Gestión de reservas: estados, cobros, cancelación, reembolso, historial.
- Gestión de barcos, fotos, precios, extras, FAQ, contacto y ajustes.

**Salida:** el negocio puede operar un día completo solo con el panel. Sesión de prueba con el equipo.

Las fases 4 y 5 se solapan: el calendario y las reservas manuales del panel se necesitan para probar la disponibilidad.

## Fase 6 — Experiencias (S–M, condicionada a D-10)

- Fichas, sesiones con aforo y reserva por plazas.
- O bien: páginas informativas con contacto por WhatsApp.

## Fase 7 — Preparación del lanzamiento (M)

- Textos legales definitivos y banner de consentimiento.
- Tabla de redirecciones completa, verificada contra el inventario de URLs y Search Console.
- Accesibilidad, rendimiento en móvil y revisión de los cuatro idiomas.
- Pasarela en modo real con una reserva de prueba de importe mínimo.
- Importación de las reservas vivas de WordPress.
- Plan de cambio y de vuelta atrás, por escrito.

**Salida:** lista de comprobación de lanzamiento firmada por el negocio.

## Fase 8 — Cambio de dominio (S)

- Fuera de temporada alta y en un día de poco tráfico.
- Congelar reservas nuevas en WordPress durante la ventana (aviso de mantenimiento), importar las últimas y cambiar el DNS.
- WordPress queda intacto y accesible en un subdominio sin indexar, como respaldo y archivo.
- Vuelta atrás: revertir el DNS.

## Fase 9 — Después del lanzamiento

- Dos semanas de seguimiento: errores, webhooks, emails, Search Console, redirecciones sin destino.
- Mapa de calas y destinos (opción C de D-4).
- Mejoras según uso: reseñas, recordatorios previos a la salida, sincronización de calendario, informes de ocupación.
- La retirada definitiva del WordPress se decide aparte, no antes de una temporada completa.

---

## Orden y dependencias

```
Fase 0 ─▶ Fase 1 ─▶ Fase 2 ─▶ Fase 3 ─┐
                       │               ├─▶ Fase 7 ─▶ Fase 8 ─▶ Fase 9
                       └─▶ Fase 4 ◀▶ Fase 5 ─┘
                                  └─▶ Fase 6 (opcional)
```

La temporada manda: el cambio de dominio debe ocurrir con margen antes del inicio de las reservas de verano. Si no se llega con las fases 4 y 5 probadas, se retrasa el lanzamiento; no se lanza a medias.

## Criterios de aceptación globales

1. Ninguna franja puede reservarse dos veces, comprobado con pruebas de concurrencia.
2. El importe mostrado, el cobrado y el registrado coinciden en todos los casos de prueba.
3. Todas las URLs del inventario actual responden con contenido, 301 o 410.
4. Las cuatro versiones de idioma están completas, sin textos mezclados.
5. El equipo puede crear, modificar y cancelar una reserva desde el móvil sin ayuda.
6. El WordPress original sigue intacto y recuperable.
