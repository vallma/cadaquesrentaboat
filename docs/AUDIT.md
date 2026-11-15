# AUDIT.md — Auditoría de cadaquesrentaboat.com

Fecha de la auditoría: 14 de noviembre de 2026.
Alcance: solo la web pública. No se ha accedido al panel de WordPress, a la base de datos ni a ningún sistema de pago, y no se ha enviado ningún formulario.

## Cómo leer este documento

- **Verificado**: dato leído directamente en una página pública o en el DOM.
- **Inferido**: deducción razonable a partir de lo observado; hay que confirmarla.
- **Incógnita**: no se puede saber desde fuera.

Método: lectura de `sitemap.xml`, `robots.txt`, `/wp-json/` y de unas 30 páginas (todas las páginas, fichas, experiencias y productos de los sitemaps, una de las tres taxonomías y una muestra de las variantes de idioma), más una inspección del DOM de una ficha (`/vaixells/talaia`) en navegador. Las tres variantes de idioma solo se han muestreado (portada en ES/EN/FR y una ficha en ES), no recorrido enteras.

---

## 1. Resumen ejecutivo

1. La web es un WordPress montado con Elementor Pro y la suite Crocoblock (JetEngine, JetBooking, JetAppointments, JetFormBuilder, JetSmartFilters), con WooCommerce y un plugin de Redsys por debajo. Es mucha maquinaria para 9 barcos y 4 experiencias.
2. El catálogo es pequeño y abarcable: 9 embarcaciones, 3 tipos, 2 puntos de salida. Migrarlo a mano es viable, pero **los datos se contradicen entre páginas** (precios, patrón, licencia, esloras, puerto). Hay que validarlos con el negocio antes de cargarlos en la base de datos nueva.
3. La reserva es en realidad una **solicitud con pago del 20 %**: formulario por pasos en un popup. No se ha podido verificar cómo se cobra, ni qué franjas horarias existen.
4. Hay 4 idiomas (ca, es, en, fr) servidos con TranslatePress: traducción superpuesta, con slugs en catalán en todos los idiomas y restos sin traducir.
5. SEO técnico flojo: sin meta description, sin Open Graph, sin datos estructurados, errata en el `<title>` de la portada y sitemaps que exponen plantillas internas, productos de prueba, autores y la página de login.
6. Contenido legal incompleto o incorrecto: política de privacidad copiada de una plantilla de Shopify, con un marcador sin rellenar; términos y cookies sin enlace.
7. No existe mapa de búsqueda. Solo hay un iframe de Google Maps por ficha.

---

## 2. Stack actual (verificado)

| Capa | Detectado | Fuente |
|---|---|---|
| CMS | WordPress 7.1.4 | meta generator |
| Tema | Hello Elementor | rutas de assets |
| Maquetación | Elementor 4.2.4 + Elementor Pro, popups de Elementor | meta generator, assets |
| Tipos de contenido y listados | JetEngine (CPT `vaixells`, CPT `experiencies`, taxonomía `tipus-embarcacio`) | sitemaps, assets |
| Plantillas | JetThemeCore (15 plantillas) | sitemap |
| Reservas | JetBooking y JetAppointments (ambos cargados) | assets, `/wp-json/` |
| Formularios | JetFormBuilder, con complemento de Stripe registrado en la API | DOM, `/wp-json/` |
| Filtros | JetSmartFilters | `/wp-json/` |
| Tienda | WooCommerce 11.1.0 (incluye namespaces de POS y WooPay) | meta generator, `/wp-json/` |
| Pago | Plugin `redsyspur` (Redsys) cargado en la ficha | assets |
| Idiomas | TranslatePress | assets, selector |
| Otros | Jetpack, Code Snippets, Duplicator, JetElements | `/wp-json/` |
| Terceros en página | Google Tag Manager, Google Maps (iframe), jsDelivr, Google Fonts | DOM |

**Inferido:** el cobro pasa por WooCommerce usando un producto genérico llamado «Booking» (1,00 €) cuyo precio se ajusta por reserva y se paga con Redsys. Indicios: el producto existe, su fecha de modificación es del 13-11-2026 y la ficha carga el plugin de Redsys. Stripe está registrado en la API, pero no se ha visto en uso. **Hay que confirmarlo en el panel.**

**Aviso:** Code Snippets indica que hay lógica PHP a medida que no es visible desde fuera (probablemente el cálculo del total y del 20 %). Hay que exportarla antes de rediseñar la reserva.

---

## 3. Inventario de URLs

### 3.1 Páginas

| URL | Qué es | Estado |
|---|---|---|
| `/` | Portada: buscador (fecha + tipo), rejilla de barcos | Activa |
| `/vaixells` | Listado actual con 6 filtros. Es el destino del menú «Embarcacions» | Activa |
| `/embarcacions` | Listado antiguo, con otros filtros y todos los precios «sota demanda» | Huérfana, sigue indexable |
| `/experiencies` | Listado de experiencias con filtro de precio y tipo de barca | Activa, datos caducados |
| `/preguntes-frequents` | 4 preguntas | Activa |
| `/contacto-2` | Contacto: formulario (email, asunto, mensaje), teléfono, horario, mapa | Activa |
| `/politica-de-devolucions` | Política de devoluciones propia (catalán) | Activa |
| `/reembolso_devoluciones` | Texto de privacidad de plantilla Shopify, en castellano | Residual, indexable |
| `/privacy-policy` | Política de privacidad de plantilla Shopify, en castellano | Activa, incorrecta |
| `/success` | «Moltes gràcies», aviso de email de confirmación | Activa, indexable |
| `/panell` | Formulario de login de WordPress (`noindex`) | En el sitemap |

### 3.2 Fichas de embarcación (`/vaixells/{slug}`)

`selva-470`, `talaia`, `beneteau-antares`, `llaut-passanella`, `llaut-junquet`, `2199` (Ray), `minola` (Tiger 40 CV), `chups-llaut-tradicional`, `nurat-llaut-4m`.

### 3.3 Experiencias (`/experiencies/{slug}`)

`bioluminescencia-a-les-cales-del-cap-de-creus`, `snorkeling-pel-cap-de-creus`, `busseig-pel-cap-de-creus`, `prova` (se muestra como «Sunset Experience»).

### 3.4 Otras URLs expuestas en sitemaps

- Taxonomía: `/tipus-embarcacio/llanxa`, `/llaut`, `/semirrigida`. La de `llaut` **muestra el listado de experiencias, no barcos** (plantilla mal asignada). Las otras dos no se han comprobado.
- WooCommerce: `/producto/booking` (1,00 €, con botón de añadir a la cesta), `/producto/la-jahitornem`, `/producto/poma`, `/producto/lima` (sin precio, sin imagen, sin descripción) y `/categoria-producto/sin-categorizar`.
- 15 plantillas internas `/?jet-theme-core=…`.
- Autores: `/author/rogert`, `/author/sean`.

### 3.5 Idiomas

| Idioma | Prefijo | Observado |
|---|---|---|
| Catalán (por defecto) | ninguno | `<html lang="ca">` |
| Castellano | `/es/` | Contenido traducido; descripción de Talaia en castellano |
| Inglés | `/en/` | Traducido, con restos («Llaüt», alt «Imagen de WhatsApp») |
| Francés | `/fr/` | Traducido, con errores automáticos («Lancement de Passanella» por «Llaüt Passanella») |

- Los slugs son catalanes en todos los idiomas (`/es/vaixells/…`, `/en/preguntes-frequents`).
- Hay etiquetas `hreflang` (7 por página: ca, es-ES, fr-FR, en-US, es, fr, en). No se ha visto `x-default`.
- El `<title>` de la portada está en castellano en todos los idiomas.
- El widget de reserva mezcla tres idiomas en la misma pantalla (etiquetas en castellano, mensajes en catalán, «Appointment details» en inglés).

---

## 4. Catálogo de embarcaciones

### 4.1 Datos por barco (según cada ficha)

| Slug | Nombre mostrado | Tipo | Eslora | Motor | Plazas | ½ día | Día | Fianza | Combustible | Etiqueta de patrón |
|---|---|---|---|---|---|---|---|---|---|---|
| `selva-470` | Selva 470 (Tascons) | Semirrígida | 5 m | 40 cv | 7 (recomienda 4-5) | 290 € | 350 € | — | No incluido | Opcional |
| `talaia` | Talaia (No Licence) | «Barca» | 4 m | 15 cv | 5 | 250 € | 320 € | 500 € | No incluido | Sin patrón |
| `beneteau-antares` | Beneteau Antares 8, OB | «Petit iot» | 9 m / 8,23 m | 150 cv | 8 | 550 € | 750 € | — | Incluido (zona Cadaqués–Cap de Creus) | Sin patrón |
| `llaut-passanella` | Llaüt Passanella | Llaüt de madera | 7 m | 35 cv | 6 | 350 € | 450 € | — | Incluido | Opcional |
| `llaut-junquet` | Llaüt Junquet | Llaüt | 6 m | 35 cv | 6 | 350 € | 450 € | — | Incluido | Opcional |
| `2199` | Ray (No License) | Semirrígida | 6 m | 15 cv | 7 | 290 € | 390 € | 500 € | No incluido | Sin patrón |
| `minola` | Tiger 4OCV (Minola) | Semirrígida | 5 m | 40 cv | 8 | 320 € | 450 € | — | No incluido | Opcional |
| `chups-llaut-tradicional` | Chups Llaüt Tradicional | Llaüt | 6 m | 33 cv | 6 | 300 € | 450 € | — | Incluido | Opcional |
| `nurat-llaut-4m` | Nurat, llaüt 4 m | Llaüt restaurado | 4 m | 9 cv / «9cc» | 4 | — | — | — | Incluido | Sin patrón |

«—» significa que el dato no aparece en la ficha.

Comunes a todas: patrón extra a 100 € (medio día) / 180 € (día entero); pago del 20 % al reservar; «Garantia meteo disponible»; extras bajo petición sin precio (paddle surf, material de pesca, snorkel).

Campos internos del formulario de reserva (verificado en el DOM de Talaia): `nom_embarcacio`, `preu_mig_dia`, `preu_per_dia`, `isNoLicense`, `numPersBarca`, `eslora`, `potencia`, `fianza`, `halfday_count`, `fullday_count`, `matricula`, `date`, `llicencia`, `patro`, `nom`, `dni`, `email`, `telefon`, `num_persones`, `adreca`, `total_lloguer`, `a_pagar_ara`, `a_pagar_despres`. Es el mejor mapa disponible del modelo de datos real.

### 4.2 Contradicciones del catálogo

| # | Asunto | Qué dice un sitio | Qué dice otro |
|---|---|---|---|
| C1 | Precios en listados | Portada y `/embarcacions`: «Sota demanda» en todos | `/vaixells`: «desde X €» en todos |
| C2 | Nurat | `/vaixells`: «desde 260 €» | Su ficha no muestra ningún precio |
| C3 | Antares, eslora | Cabecera: 9 m | Descripción: 8,23 m |
| C4 | Antares, patrón | Etiqueta «Sense Patró» | La descripción habla de patrón profesional incluido |
| C5 | Antares y Selva, puerto | Listados: Cadaqués | Texto de la ficha: amarre en Port Lligat |
| C6 | Ray, licencia | Título «No License» y etiqueta «Sense Patró» | Descripción: «es requiereix llicència de navegació» |
| C7 | Minola, licencia | Etiqueta «Patró Opcional» | Descripción: se requiere licencia |
| C8 | Nurat, motor | Etiqueta «9cv» | Descripción: «miniSolé 2 de 9cc» |
| C9 | Combustible | Fichas de llaüts y Antares: «Inclou combustible» | FAQ: no incluido salvo indicación; el consumo se calcula a la devolución |
| C10 | Cancelación | Fichas: reembolso íntegro hasta 72 h antes, sin condiciones | Política de devoluciones: solo con la Garantía Meteo contratada; sin ella, sin reembolso pasadas 24 h |
| C11 | Mal tiempo | Fichas: se devuelve el importe | FAQ y política: solo con seguro; si no, cambio de fecha |
| C12 | Fianza | Solo Talaia y Ray muestran 500 € | El resto no indica si hay fianza |
| C13 | Nombres | «Chups Llaüt Tradicional» (title) / «Llaut Tradicional» (H1); «Minola» / «Tiger 4OCV»; «Ray» con slug `2199` | — |
| C14 | Junquet | Se presenta como llaüt de 6 m | La descripción menciona una «Menorquina 36» |
| C15 | Chups | Un H2 con el valor «70» sin explicación | — |
| C16 | Teléfonos | Cabecera y fichas: 648 869 034 | Contacto, FAQ y pie: 620 288 126 |
| C17 | Horario | Lunes a jueves 09–21 h; sábado y domingo 09–23 h | El viernes no aparece |

Sobre el texto «patrón obligatorio para esta barca» que aparece en el formulario de todas las fichas: **inferido** que es un mensaje condicional (se muestra si el cliente declara no tener titulación en un barco que la exige; existe el campo oculto `isNoLicense`). No es necesariamente una contradicción, pero no se ha podido comprobar sin ejecutar el formulario.

### 4.3 Punto a validar con normativa

Ray figura como embarcación sin licencia con 6 m de eslora, y Talaia y Ray anuncian 5 y 7 plazas con 15 cv. Conviene que el negocio confirme eslora, potencia y plazas reales de cada barco frente a los límites legales de navegación sin titulación, porque la web nueva mostrará «sin licencia» como filtro destacado.

---

## 5. Experiencias

| Experiencia | Precio | Duración | Fecha mostrada | Salida | Aforo |
|---|---|---|---|---|---|
| Bioluminescència a les Cales del Cap de Creus | 65 €/persona | 2 h | 24-06-2025, 22:00 | Port Lligat | 10 |
| Snorkeling pel Cap de Creus | 45 €/persona | 2 h | 21-06-2025, 12:00 | Port Lligat | 10 |
| Busseig pel Cap de Creus | 90 €/persona | 3 h | 01-07-2025, 08:00 | Port Lligat | 10 |
| Sunset Experience (slug `prova`) | 50 €/persona | 2 h | 21-06-2025, 21:00 | Cadaqués | 10 |

Problemas verificados:

- Todas las fechas son de 2025: son eventos de fecha única ya pasados. No se sabe si el producto sigue a la venta.
- Sin fotos propias en ninguna.
- La sección «Embarcació» muestra «No data was found» en las cuatro.
- FAQ con la misma respuesta repetida en preguntas distintas, una frase truncada («rese. embarcación.») y mezcla de catalán y castellano.
- Formulario propio («Apunta't»): n.º de personas, teléfono, email, nombre y total.
- La de buceo menciona a «Diving Port Lligat» como base: **incógnita** si es un proveedor externo y qué acuerdo hay.

---

## 6. Sistema de reservas (lo observable)

Flujo en la ficha de barco, dentro de un popup de Elementor:

1. Fecha (calendario de JetAppointments/JetBooking).
2. «¿Tienes titulación para esta embarcación?» y «¿Necesitas patrón?» (sí: +100 € / +180 €).
3. Datos: nombre completo, DNI, email, teléfono, número de personas, dirección. Todos obligatorios.
4. Resumen: total del alquiler, a pagar ahora (20 %), a pagar después.
5. Mensaje final: se recibirá un email de confirmación «de la solicitud».

Incógnitas que bloquean el diseño del nuevo motor:

| # | Incógnita |
|---|---|
| R1 | Franjas reales: ¿medio día es mañana y tarde? ¿Con qué horas? Los campos `halfday_count` y `fullday_count` sugieren cupos por día, pero no hay horarios visibles. |
| R2 | ¿La reserva se confirma automáticamente al pagar o la valida una persona? El texto habla de «solicitud». |
| R3 | Pasarela real en uso (Redsys, Stripe o ambas) y cómo se cobra el 80 % restante (en el puerto, enlace de pago, efectivo). |
| R4 | Precio y funcionamiento de la Garantía Meteo: la política dice que su coste no es reembolsable, pero el precio no aparece en ninguna página. |
| R5 | Temporadas: no hay precios por temporada publicados. ¿Existen fuera de la web? |
| R6 | Fianza: importe por barco y forma de cobro (preautorización, efectivo). |
| R7 | Cómo se verifica la titulación del cliente. |
| R8 | Reservas de varios días y alquiler por horas: no aparecen. |
| R9 | Reservas ya existentes en WordPress que haya que migrar a la plataforma nueva. |
| R10 | Para qué se piden DNI y dirección (contrato de alquiler, seguro) y cuánto tiempo se conservan. |

---

## 7. Identidad visual (verificado en el DOM)

| Elemento | Valor |
|---|---|
| Color primario | `#025373` (azul petróleo) |
| Color secundario / cabecera | `#012840` (azul marino) |
| Acento | `#7293B2` |
| Fondos claros | `#E7F0FF`, `#DAECFF`, `#C7E1FA`, `#F2F2F2`, `#F0F0F0` |
| Otros azules | `#003145`, `#2FADC7`, `#4DA2FA` |
| Avisos | `#F59E0B` (ámbar), `#FF6FA5` (rosa) |
| Texto | `#2F2F2F`, `#474747`, `#6B6B6B` |
| Titulares | Poppins, peso 500 (H1 de ficha: 24 px, color `#012840`) |
| Botones | Hanken Grotesk, peso 600, radio 10 px, texto `#025373` sobre `#E7F0FF` |
| Cuerpo | Fuente de sistema (los globales de Elementor siguen en Roboto por defecto) |
| Logo | Wordmark «Cadaqués Rent a Boat» dentro de un contorno, en versión clara y oscura (`Recurso-1@1.5x.png`, `negreRecurso-2@2x.png`) |

Patrones de interfaz: cabecera azul marino con menú, selector de idioma con bandera e iconos de WhatsApp e Instagram; ficha con galería de 1 foto grande + 2 pequeñas y botón «Ver todas»; chips de plazas, potencia y eslora; tarjeta lateral «Contacta ara» con botones de llamar y WhatsApp; esquinas redondeadas.

Pendiente: no se ha medido el contraste de color ni el comportamiento en móvil, y solo se ha visto una ficha en pantalla. Falta pedir el logo en vectorial.

---

## 8. Imágenes

- Alojadas en `wp-content/uploads` (carpetas de 2022 a 2026).
- Nombres de archivo sin valor: `Imagen-de-WhatsApp-2024-06-26-…`, `image00007`, `IMG_0921`. Esos nombres se filtran como texto alternativo en EN y FR.
- Calidad desigual: Antares tiene 20 fotos profesionales (incluidas de dron); Junquet tiene 2; varias fichas usan fotos enviadas por WhatsApp, que llegan comprimidas.
- En la ficha de Talaia: 82 imágenes en el DOM, 10 sin `alt` y solo 10 con carga diferida.
- Las experiencias no tienen fotos.
- **Incógnita:** si se conservan los originales en alta resolución y quién tiene los derechos de las fotos profesionales.

---

## 9. SEO

| Aspecto | Estado |
|---|---|
| `<title>` de portada | «Rent A Boat Cadaqués – Alquiler de embarcaciones en Cadaqueés» (errata, y en castellano en los cuatro idiomas) |
| Meta description | Ausente (comprobado en portada y ficha) |
| Open Graph / Twitter | Ausente en la ficha |
| Datos estructurados (JSON-LD) | Ausentes en la ficha |
| H1 | La portada no tiene. Varias fichas parten el nombre («Beneteau» en H1, «Antares 8, OB» en H2; «Llaut» en H1, «4m» en H2) |
| `hreflang` | Presente; sin `x-default` |
| Canonical | Presente y por idioma |
| Sitemap | El nativo de WordPress, sin plugin SEO. Expone plantillas, productos de prueba, autores, `/panell` y `/success` |
| Slugs | `/vaixells/2199`, `/contacto-2`, `/experiencies/prova`; catalanes en todos los idiomas |
| Contenido duplicado | `/vaixells` y `/embarcacions`; `/privacy-policy` y `/reembolso_devoluciones` |
| `robots.txt` | El de WooCommerce por defecto |

No se ha medido rendimiento (Core Web Vitals) ni se dispone de datos de Search Console. **Incógnita:** qué URLs reciben tráfico y enlaces hoy; hace falta para priorizar las redirecciones.

---

## 10. Legal y privacidad

- `/privacy-policy` y `/reembolso_devoluciones` son una plantilla de Shopify: nombran a Shopify como proveedor, citan cookies de Shopify y conservan el marcador «[[INSERTAR OTROS USOS DE INFORMACIÓN DEL PEDIDO]]».
- Razón social: una página menciona «Maltret SL»; el email de contacto es `cdqrentsl@gmail.com`; la política de privacidad muestra otra dirección de Gmail, personal. No aparece NIF en ninguna página. **Incógnita:** titular legal real.
- «Termes i condicions» y «Política de cookies» aparecen en el pie sin enlace.
- Se carga Google Tag Manager. No se ha comprobado si hay banner de consentimiento.
- El formulario recoge DNI y dirección postal sin que se haya visto una cláusula informativa junto al envío.

---

## 11. Restos de desarrollo visibles al público

- Enlace con el texto «test» junto al bloque de garantía en todas las fichas y experiencias.
- Encabezado «Desglossament de preus» vacío en el pie de todas las páginas.
- Mensajes de estado del widget visibles en el HTML («Ho sento. Teniu el nombre màxim de cites.»).
- Bloque de reserva y menús duplicados en el HTML.
- Erratas repetidas: «Integre», «lliçència», «títulacions», «requiereix», «Cadaqueés».
- En «Embarcacions similars», las cuatro fotos de Nurat se muestran como cuatro tarjetas.

---

## 12. Funcionalidades a conservar, mejorar o retirar

| Funcionalidad actual | Decisión propuesta |
|---|---|
| Listado de barcos con filtros (fecha, personas, tipo, precio máximo, licencia, patrón) | Conservar y fusionar con el mapa |
| Ficha: galería, chips, descripción, equipamiento, ubicación, FAQ, similares | Conservar, con datos estructurados |
| Reserva con 20 % de anticipo, patrón opcional, pregunta de titulación | Conservar, rehacer con disponibilidad real |
| Garantía Meteo | Conservar, definiéndola (R4) |
| Botones de llamar y WhatsApp | Conservar, con un único número |
| Experiencias | Conservar solo si el negocio las mantiene; pasar a sesiones con fecha |
| 4 idiomas | Conservar, con traducciones revisadas |
| Formulario de contacto | Conservar |
| Página de confirmación | Conservar, sin indexar |
| `/embarcacions`, productos WooCommerce, taxonomías, autores, plantillas | Retirar con redirección 301 o 410 |
| Mapa por ficha (iframe de Google) | Sustituir por MapLibre |

---

## 13. Lo que no se ha podido auditar

- Panel de WordPress: reservas existentes, clientes, configuración de JetBooking, snippets PHP, emails transaccionales.
- Flujo de pago completo (habría exigido enviar una reserva real).
- Analítica, Search Console, volumen de reservas y conversión.
- Hosting, dominio, DNS y correo.
- Rendimiento y comportamiento en móvil.
- Recorrido completo de las versiones ES, EN y FR.
