#!/bin/bash
# One-off script to pull real boat/logo photos from the live WP site into img/.
# Not part of the site runtime — safe to delete after use.
set -e
cd "$(dirname "$0")/.."
UA="Mozilla/5.0"
BASE="https://cadaquesrentaboat.com/wp-content/uploads"

dl() {
  local url="$1" out="$2"
  echo "→ $out"
  curl -s -A "$UA" --max-time 60 --retry 2 --retry-delay 3 -o "$out" "$url"
}

dl "$BASE/2023/04/negreRecurso-2@2x.png" "public/img/logo.png"

dl "$BASE/2025/02/Ja-hi-tornem-13-1-scaled.jpg" "public/img/boats/beneteau-antares/1.jpg"
dl "$BASE/2025/02/DRONE-8-scaled.jpg" "public/img/boats/beneteau-antares/2.jpg"
dl "$BASE/2025/02/CADAQUES-2-scaled.jpg" "public/img/boats/beneteau-antares/3.jpg"

dl "$BASE/2025/07/Imagen-de-WhatsApp-2025-07-01-a-las-16.25.57_9fcc30da-scaled.jpg" "public/img/boats/chups-llaut-tradicional/1.jpg"
dl "$BASE/2025/07/Imagen-de-WhatsApp-2025-07-01-a-las-16.25.57_91256897-scaled.jpg" "public/img/boats/chups-llaut-tradicional/2.jpg"
dl "$BASE/2025/07/Imagen-de-WhatsApp-2025-07-01-a-las-16.25.58_9778bd29-scaled.jpg" "public/img/boats/chups-llaut-tradicional/3.jpg"

dl "$BASE/2025/02/WhatsApp-Image-2025-02-13-at-18.34.11.jpeg" "public/img/boats/llaut-junquet/1.jpg"
dl "$BASE/2025/02/IMG_20220917_133305-scaled.jpg" "public/img/boats/llaut-junquet/2.jpg"

dl "$BASE/2025/02/WhatsApp-Image-2025-02-13-at-18.32.34.jpeg" "public/img/boats/llaut-passanella/1.jpg"
dl "$BASE/2025/02/WhatsApp-Image-2024-06-19-at-10.52.34.jpeg" "public/img/boats/llaut-passanella/2.jpg"
dl "$BASE/2025/02/WhatsApp-Image-2024-06-19-at-10.52.34-1.jpeg" "public/img/boats/llaut-passanella/3.jpg"

dl "$BASE/2025/05/image00007-scaled.jpeg" "public/img/boats/minola/1.jpg"
dl "$BASE/2025/05/image00003-scaled.jpeg" "public/img/boats/minola/2.jpg"
dl "$BASE/2025/05/image00002-1-scaled.jpeg" "public/img/boats/minola/3.jpg"

dl "$BASE/2026/06/nurat1.jpeg" "public/img/boats/nurat-llaut-4m/1.jpg"
dl "$BASE/2026/06/nurat2.jpeg" "public/img/boats/nurat-llaut-4m/2.jpg"
dl "$BASE/2026/06/nurat3.jpeg" "public/img/boats/nurat-llaut-4m/3.jpg"
dl "$BASE/2026/06/nurat4.jpeg" "public/img/boats/nurat-llaut-4m/4.jpg"

dl "$BASE/2025/04/IMG_0921-scaled.jpeg" "public/img/boats/ray/1.jpg"
dl "$BASE/2025/04/IMG_0922-scaled.jpeg" "public/img/boats/ray/2.jpg"
dl "$BASE/2025/04/IMG_0928-scaled.jpeg" "public/img/boats/ray/3.jpg"

dl "$BASE/2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-12.54.01_f0b10411-1.jpg" "public/img/boats/selva-470/1.jpg"
dl "$BASE/2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-12.54.01_bf733c9b-1.jpg" "public/img/boats/selva-470/2.jpg"
dl "$BASE/2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-12.54.01_acd8d8c6.jpg" "public/img/boats/selva-470/3.jpg"

dl "$BASE/2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-15.32.39_cafe2bba.jpg" "public/img/boats/talaia/1.jpg"
dl "$BASE/2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-15.32.39_602ed995.jpg" "public/img/boats/talaia/2.jpg"
dl "$BASE/2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-15.32.32_3e2da56f-1.jpg" "public/img/boats/talaia/3.jpg"

echo "Done."
