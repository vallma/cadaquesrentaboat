// Copia el worker de MapLibre a /public para servirlo desde el propio dominio.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const from = resolve(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
const to = resolve(root, "public/maplibre/maplibre-gl-worker.mjs");
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log("maplibre worker → public/maplibre/");
