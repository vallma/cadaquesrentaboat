// Compila la web de pruebas estática para GitHub Pages.
//
// GitHub Pages solo sirve archivos: no ejecuta el proxy de idiomas ni rutas
// dinámicas. Este script aparta lo que no se puede exportar, compila y añade
// la redirección de la raíz y la página 404.
//
// Uso: NEXT_PUBLIC_BASE_PATH=/nombre-del-repo node scripts/build-pages.mjs
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const stash = resolve(root, ".pages-stash");

// Archivos que solo tienen sentido con servidor.
const serverOnly = ["src/proxy.ts", "src/app/[locale]/[...rest]"];

const moved = [];
try {
  mkdirSync(stash, { recursive: true });
  serverOnly.forEach((rel, i) => {
    const from = resolve(root, rel);
    if (!existsSync(from)) return;
    const to = resolve(stash, String(i));
    renameSync(from, to);
    moved.push([from, to]);
  });

  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: "1", NEXT_PUBLIC_BASE_PATH: base },
  });
} finally {
  // Devuelve los archivos a su sitio aunque falle la compilación.
  moved.forEach(([from, to]) => renameSync(to, from));
  rmSync(stash, { recursive: true, force: true });
}

const out = resolve(root, "out");
const redirect = (target, title) => `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${target}">
<title>${title}</title>
</head>
<body><p><a href="${target}">Cadaqués Rent a Boat</a></p></body>
</html>
`;

// La raíz lleva al catalán, el idioma por defecto.
writeFileSync(resolve(out, "index.html"), redirect(`${base}/ca/`, "Cadaqués Rent a Boat"));
// Las páginas que aún no existen vuelven a la portada.
writeFileSync(resolve(out, "404.html"), redirect(`${base}/ca/`, "Pàgina no trobada"));
// Evita que GitHub Pages procese el sitio con Jekyll (ignoraría /_next).
writeFileSync(resolve(out, ".nojekyll"), "");
console.log(`\nWeb estática lista en out/ (base: "${base || "/"}")`);
