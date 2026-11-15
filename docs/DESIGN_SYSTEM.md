# DESIGN_SYSTEM.md — Cadaqués Rent a Boat

Sistema de diseño de la nueva aplicación. Parte del análisis visual de la web actual (14-11-2026) y de `AUDIT.md` §7. Los tokens viven en `src/app/globals.css`; los componentes, en `src/components`. La página `/styleguide` los muestra todos y no se indexa.

Alcance de esta entrega: tokens, componentes comunes y página principal. Sin reservas ni base de datos: el catálogo es un archivo provisional (`src/data/boats.ts`).

## 1. Qué se conserva y qué cambia

**Se conserva**

- Paleta completa: azul marino `#012840`, primario `#025373`, tintes `#E7F0FF` / `#DAECFF` / `#C7E1FA`, gris `#F2F2F2`.
- Poppins en titulares, menú y tarjetas; Hanken Grotesk en botones.
- Cabecera azul marino con logo a la izquierda, menú con separadores verticales e iconos de WhatsApp e Instagram.
- Portada: foto aérea a sangre, tarjeta gris de búsqueda a la izquierda (fecha + tipo de barca), borde inferior inclinado, sección «Embarcacions» sobre azul claro con título centrado.
- Tarjeta de barco: foto, nombre, precio en azul primario, ubicación con icono, separador y datos de plazas y potencia. Radio de 15 px y borde fino.
- Pie azul marino con logo, enlaces legales con flecha, botones sociales cuadrados y barra inferior más oscura.
- Las mismas fotografías.

**Cambia, y por qué**

| Cambio | Motivo |
|---|---|
| El texto de cuerpo pasa a Hanken Grotesk | Hoy conviven Roboto, fuente de sistema y Hanken Grotesk sin criterio. Se unifica en las dos fuentes de marca. |
| El H1 de portada pasa de Roboto a Poppins | Mismo motivo. Además, hoy la portada no tiene H1. |
| Campos de 48 px con radio de 10 px y etiqueta de peso 500 | Los actuales miden 45 px, tienen radio de 3 px y etiqueta de peso 300, poco legible. Se igualan a los botones de la ficha. |
| Carrusel automático → rejilla (3 columnas, 2 en tableta) y carrusel manual en móvil | El carrusel actual avanza solo y muestra 3 de 9 barcos. Ahora se ven todos y nada se mueve sin que el usuario lo pida. |
| Precio «des de X €» en las tarjetas | La portada actual dice «preu sota demanda» y el listado, «desde X €». Se usa el del listado. Pendiente de validar (contradicción C1). |
| Selector de idioma con código (CA, ES…) en lugar de bandera | Una bandera representa un país, no un idioma. |
| Menú móvil a pantalla completa | Objetivos táctiles de 44 px o más, con idioma y contacto dentro. |
| El pie añade el menú principal y el teléfono | Hoy solo tiene enlaces legales. |
| Sombra al pasar por una tarjeta; estados de foco, error, carga y vacío | No existían. |
| Etiqueta «Sense llicència» sobre la foto | Hoy va dentro del nombre del barco («RAY ( No License )»). |

No se ha podido ver la web actual a ancho de móvil (la ventana del navegador no bajó de 1500 px), así que el comportamiento móvil nuevo se ha diseñado y comprobado sobre la versión nueva, no comparado con la actual.

## 2. Tokens

### Color

| Token | Valor | Uso |
|---|---|---|
| `navy` | `#012840` | Cabecera, pie, titulares, botón principal |
| `navy-deep` | `#001A2B` | Barra inferior del pie (aproximado al actual) |
| `brand` | `#025373` | Títulos de sección, precios, enlaces, foco |
| `brand-strong` | `#003145` | Hover y pulsado |
| `accent` | `#7293B2` | Detalles sobre azul marino |
| `aqua` | `#2FADC7` | Realce puntual |
| `tint-50` / `100` / `200` | `#E7F0FF` / `#DAECFF` / `#C7E1FA` | Fondo de sección, botón secundario, chips |
| `surface` | `#F2F2F2` | Tarjeta del buscador, fondo de listados |
| `ink` / `ink-2` / `ink-3` | `#2F2F2F` / `#474747` / `#6B6B6B` | Texto principal, secundario, terciario |
| `line` | `rgb(47 47 47 / 15%)` | Bordes de tarjeta y separadores |
| `warn` | `#F59E0B` | Avisos |
| `danger`, `success` | `#B42318`, `#1F7A4D` | **Nuevos.** Errores y confirmaciones |

Reglas: texto blanco solo sobre `navy`, `navy-deep`, `brand` y `brand-strong`. `accent` y `aqua` no se usan para texto sobre blanco (contraste insuficiente). El rosa `#FF6FA5` de la paleta de Elementor no se usa.

### Tipografía

| Token | Fuente | Tamaño | Uso |
|---|---|---|---|
| `text-display` | Poppins 400 | 28 → 38 px | Títulos de sección |
| `text-title` | Poppins 500 | 24 → 32 px | H1 de portada |
| `text-heading` | Poppins 500 | 24 px | H1 de ficha |
| `text-card-title` | Poppins 400 | 17 px | Nombre en tarjeta |
| cuerpo | Hanken Grotesk 400 | 16 px | Texto, formularios |
| pequeño | Hanken Grotesk 400 | 14–15 px | Datos, ayudas |

Los tamaños grandes escalan de forma fluida entre móvil y escritorio. Las fuentes se sirven desde el propio dominio (paquetes `@fontsource`), sin llamadas a Google Fonts.

### Forma, elevación y medidas

| Token | Valor |
|---|---|
| `rounded-card` | 15 px (tarjetas, paneles) |
| `rounded-control` | 10 px (botones, campos, desplegables) |
| `shadow-card-hover` | Solo al pasar por una tarjeta |
| `shadow-float` | Tarjeta del hero, desplegables |
| `max-w-page` | 1216 px |
| Márgenes laterales | 16 px móvil · 24 px tableta · 32 px escritorio |
| Cabecera | 64 px móvil · 96 px escritorio |
| Separación de sección | 56 px móvil · 80 px escritorio |

Puntos de corte: 640 px (`sm`), 768 px (`md`, rejilla de 2 columnas), 1024 px (`lg`, menú de escritorio y 3 columnas).

## 3. Componentes

| Componente | Archivo | Notas |
|---|---|---|
| `Button`, `ButtonLink`, `ExternalButton` | `ui/Button.tsx` | Variantes `primary` (azul marino), `secondary` (tinte, el de «Trucar»), `outline`, `ghost`, `onDark`. Tamaños `sm` 36, `md` 44, `lg` 52 px. Estados: hover, pulsado, foco, cargando, desactivado. |
| `Input`, `Select`, `Textarea`, `Checkbox` | `ui/Field.tsx` | Etiqueta siempre visible, ayuda, error con icono y `aria-invalid`, desactivado. Texto de 16 px para evitar el zoom de iOS. |
| `Chip` | `ui/Chip.tsx` | Datos de barco (plazas, potencia, eslora) y estados. |
| `Alert`, `Skeleton`, `EmptyState` | `ui/Feedback.tsx` | Aviso informativo, éxito, advertencia y error; carga; sin resultados. |
| `Container`, `Section` | `ui/` | Ancho de página y secciones con título centrado y fondo blanco, tinte o gris. |
| `BrandIcon` | `ui/BrandIcon.tsx` | WhatsApp e Instagram. El resto de iconos son de `lucide-react`. |
| `Header`, `LanguageSwitcher` | `layout/` | Cabecera fija; menú de escritorio desde 1024 px; panel móvil con bloqueo de scroll y cierre con Escape. |
| `Footer`, `Logo` | `layout/` | |
| `BoatCard`, `BoatCardSkeleton`, `BoatGrid` | `boat/` | Toda la tarjeta es un único enlace. |
| `Hero`, `SearchForm` | `home/` | El buscador envía por GET a `/vaixells?data=…&tipus=…`. |

### Estados

- **Foco:** contorno de 2 px en `brand` (blanco sobre fondos oscuros), visible con teclado en todos los elementos interactivos.
- **Hover:** cambio de fondo en botones; sombra y ligero zoom de la foto en tarjetas.
- **Desactivado:** 50 % de opacidad en botones; fondo gris en campos.
- **Error:** borde y mensaje en `danger`, con icono; nunca solo color.
- **Carga:** `Skeleton` con la misma geometría que el contenido; botón con indicador giratorio.
- **Vacío y 404:** `EmptyState` con acción.
- **Movimiento reducido:** las transiciones se anulan si el sistema lo pide.

## 4. Página principal

1. Cabecera.
2. Hero con buscador (fecha y tipo de barca).
3. «Embarcacions»: los 9 barcos y botón «Veure totes les embarcacions».
4. Pie.

Es la misma estructura que la portada actual. Disponible en `/`, `/es`, `/en` y `/fr`, con título y descripción por idioma, `hreflang` y `x-default`.

## 5. Comprobaciones hechas

- Compilación de producción y ESLint sin errores.
- Capturas a 1440, 820 y 390 px de la portada y la guía de estilo; menú móvil y desplegable de idioma abiertos; página 404.
- Sin desbordamiento horizontal en ningún ancho.
- Fuentes cargadas (Poppins y Hanken Grotesk) y atributo `lang` correcto por idioma.

**Limitación:** el entorno de pruebas no tiene acceso a cadaquesrentaboat.com, así que las capturas usan un degradado en lugar de las fotos y el logo reales. En un navegador con acceso normal se cargan desde el WordPress actual.

## 6. Pendiente

- Validar con las fotos reales el encuadre del hero y de las tarjetas.
- Logo en vectorial (hoy es un PNG servido desde WordPress).
- Migrar las imágenes a Storage y activar la optimización de `next/image` (fase 2).
- Teléfono oficial (D-14) y nombres comerciales de los barcos (C13).
- Las páginas del menú todavía no existen y muestran el «no encontrado».
- Componentes de ficha, listado con filtros y mapa: siguientes entregas.
