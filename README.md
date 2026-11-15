# Cadaqués Rent a Boat — nueva web

Reconstrucción de cadaquesrentaboat.com con Next.js, TypeScript y Tailwind. Estado: sistema de diseño, página principal y explorador de embarcaciones con mapa (MapLibre). **Sin reservas ni base de datos todavía; los datos son de prueba.**

## Web de pruebas

Cada push a `master` publica una versión estática en GitHub Pages:
`https://vallma.github.io/cadaquesrentaboat/`

Diferencias respecto a producción: todos los idiomas llevan prefijo (`/ca`, `/es`, `/en`, `/fr`), las páginas que aún no existen vuelven a la portada y la web no es indexable.

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run build        # compilación de producción (con servidor)
npm run build:pages  # compilación estática para GitHub Pages (out/)
```

- `/` portada · `/vaixells` explorador con mapa · `/styleguide` guía de estilo.

## Documentación

| Documento | Contenido |
|---|---|
| `docs/AUDIT.md` | Auditoría de la web WordPress actual |
| `docs/ARCHITECTURE.md` | Arquitectura propuesta |
| `docs/ROADMAP.md` | Fases y decisiones pendientes |
| `docs/DESIGN_SYSTEM.md` | Tokens y componentes |
| `docs/EXPLORER.md` | Explorador con mapa y datos de prueba |

Los datos de `src/data/test/` son de prueba y no están validados.

El proyecto anterior (agosto de 2026, con backend de reservas en Prisma) sigue en el historial de git, en el commit `3957128`.
