# EXPLORER.md — Explorador de embarcaciones

Página `/vaixells` (y `/es`, `/en`, `/fr`): filtros, listado de tarjetas y mapa MapLibre GL JS sincronizados. Sin reservas ni base de datos todavía.

## 1. De dónde salen los datos

Todo pasa por una sola función, `getCatalog()` en `src/lib/catalog/repository.ts`. Ninguna página ni componente importa datos directamente.

| Dato | Hoy | Cuando haya base de datos |
|---|---|---|
| Embarcaciones | `src/data/test/boats.test-data.ts` | Tabla `boats` |
| Puntos de salida | `src/data/test/departure-points.test-data.ts` | Tabla `departure_points` |
| Disponibilidad | No conectada (`availabilityConnected: false`) | Motor de reservas |

Para conectar los datos reales solo cambia `repository.ts`. El borrador de la tabla está en `supabase/migrations/0001_departure_points.draft.sql` (sin aplicar): un punto no se puede publicar sin `verified_at`.

### Datos de prueba: qué son y cómo se identifican

- **Puntos de salida.** Cadaqués y Port Lligat existen en la web actual, pero las coordenadas cargadas son una referencia aproximada de cada bahía, no el punto de embarque autorizado. Llevan `isTestData: true` y `coordinatesVerified: false`.
- **Embarcaciones.** Copia de lo publicado el 14-11-2026, sin validar (ver contradicciones en `AUDIT.md` §4.2). El modo de patrón sale de las etiquetas del listado antiguo.
- **En pantalla:** aviso «Dades de prova» sobre el listado y etiqueta «PROVA» en cada marcador del mapa. Ambos desaparecen solos cuando el repositorio devuelve `isTestData: false`.

**Falta que el negocio aporte:** la coordenada exacta de cada punto autorizado de salida o recogida y si alguno es solo de recogida.

## 2. El mapa

- **Un marcador por punto de salida**, en la coordenada del registro. Las embarcaciones no tienen posición propia: aparecen como píldoras de precio dentro del marcador de su punto. El mapa no dibuja ninguna posición que no esté en los datos.
- Cada marcador se abre hacia el lado libre (oeste a la izquierda, este a la derecha) para no tapar al vecino; la punta señala siempre la coordenada.
- Encuadre inicial ajustado a los puntos de salida; desplazamiento limitado a Cadaqués, Port Lligat y la costa del Cap de Creus (`src/config/map.ts`).
- Mapa base: OpenFreeMap (estilo Positron), sin clave de API. Se cambia con `NEXT_PUBLIC_MAP_STYLE_URL` (decisión D-7).
- MapLibre se carga solo cuando el mapa es visible: en móvil no se descarga hasta pulsar «Mapa».
- Si el mapa base no carga, se avisa y el listado y los marcadores siguen funcionando.

## 3. Sincronización

| Acción | Efecto |
|---|---|
| Pasar el ratón o el foco por una tarjeta | Su píldora se resalta en el mapa y el marcador muestra el nombre |
| Pulsar una píldora en el mapa (escritorio) | La tarjeta se resalta con borde y se desplaza a la vista |
| Pulsar una píldora en el mapa (móvil) | Tarjeta resumida en la parte inferior del mapa |
| Botón de mapa de una tarjeta (móvil) | Abre el mapa con esa embarcación seleccionada |

## 4. Filtros

En la URL, para poder compartir la búsqueda: `data`, `persones`, `tipus`, `patro`, `preu`, `sortida`. El buscador de la portada ya envía `data` y `tipus`.

- Personas, tipo, patrón, precio máximo y punto de salida filtran listado y mapa a la vez.
- **La fecha no filtra.** No hay datos de disponibilidad, así que se conserva en la URL, se avisa en pantalla y cada tarjeta muestra «Disponibilitat per confirmar». Ningún barco se marca como libre u ocupado.
- Sin resultados: mensaje con botón para borrar filtros; los marcadores quedan atenuados.

## 5. Responsive

- **Escritorio (≥1024 px):** listado con filtros a la izquierda y mapa fijo a la derecha.
- **Móvil y tableta:** listado a pantalla completa con botón flotante «Mapa»; mapa a pantalla completa con botones «Llista» y «Filtres»; filtros en un panel con el número de resultados en el botón de cierre.

## 6. Comprobado

Pruebas automáticas en navegador a 1440, 820 y 390 px:

- 9 tarjetas y 9 píldoras; sin desbordamiento horizontal.
- Tarjeta → mapa y mapa → tarjeta (resaltado y desplazamiento).
- Filtros: tipo, punto de salida, personas, precio y patrón, solos y combinados; estado vacío; filtros leídos de la URL.
- Móvil: panel de filtros, cambio lista ↔ mapa, tarjeta resumida.
- Fallo del mapa base: aparece el aviso y el listado sigue.
- Compilación y ESLint sin errores.

**No comprobado:** el mapa base real. El entorno de pruebas no tiene acceso al servidor de teselas ni a las fotos, así que las pruebas usan un fondo liso y un degradado. Falta verlo en un navegador normal.

## 7. Pendiente

- Coordenadas reales de los puntos de salida y validación del catálogo.
- Conectar disponibilidad para que la fecha filtre.
- Decidir el proveedor de teselas definitivo (D-7).
- Con más de dos puntos de salida, revisar hacia dónde se abre cada marcador.
- Calas y destinos del Cap de Creus como capa adicional (opción C de D-4).
- Las fichas `/vaixells/{slug}` todavía no existen.
