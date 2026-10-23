#!/usr/bin/env bash
# N0 CENSO-PODA M7/M8. Uso: ./run_censo.sh pre|m7|m8 DIR_SALIDA
# pre: regresion m=2..5 (poda vs bruta), desarrollo m=6 (poda vs bruta), falla plantada.
# m7 : censo m=7 (requiere DIR_SALIDA/../pre OK).  m8: requiere archivo M7_AUDITADO.txt en la raiz del paquete.
set -euo pipefail
MODE=${1:?modo}; OUT=${2:?dir}
HERE=$(cd "$(dirname "$0")" && pwd)
[ -e "$OUT" ] && { echo "ABORTO: $OUT ya existe"; exit 1; }
mkdir -p "$OUT"; cd "$HERE"
sha256sum -c MANIFEST.sha256 > "$OUT/manifest_check.txt"
{ date -Is; uname -a; gcc --version | head -1; nproc; grep -m1 "model name" /proc/cpuinfo || true; free -g | head -2; } > "$OUT/entorno.txt"
gcc -O2 -Wall -Wextra -Werror -o "$OUT/censo" censo.c
gcc -O2 -Wall -Wextra -Werror -DPLANT -o "$OUT/censo_plant" censo.c
gcc -O2 -Wall -Wextra -Werror -o "$OUT/brute" brute.c
sha256sum "$OUT/censo" "$OUT/censo_plant" "$OUT/brute" > "$OUT/SHA_BINARIOS.txt"
C="$OUT/censo"
cmp_lists(){ [ "$(sort "$1" | sha256sum | cut -c1-64)" = "$(sort "$2" | sha256sum | cut -c1-64)" ]; }
case "$MODE" in
 pre)
  for m in 2 3 4 5 6; do
    "$C" $m "$OUT/ext$m.txt" "$OUT/fal$m.txt" "$OUT/st$m.txt" > "$OUT/censo$m.log"
    "$OUT/brute" $m "$OUT/bru$m.txt" > "$OUT/brute$m.log"
    grep -q "cobertura_ok=1 falsadores=0" "$OUT/censo$m.log" || { echo "FALLA censo m=$m"; exit 4; }
    grep -q "minW=$((m-1)) " "$OUT/brute$m.log" || { echo "FALLA bruta minW m=$m"; exit 4; }
    cmp_lists "$OUT/ext$m.txt" "$OUT/bru$m.txt" || { echo "DISCREPANCIA poda/bruta m=$m"; exit 4; }
    echo "m=$m OK $(cat "$OUT/st$m.txt")" | tee -a "$OUT/REGRESION.txt"
  done
  "$OUT/censo_plant" 5 "$OUT/pext5.txt" "$OUT/pfal5.txt" "$OUT/pst5.txt" > "$OUT/plant5.log"
  grep -q "falsadores=44" "$OUT/plant5.log" || { echo "FALLA PLANTADA NO DETECTADA"; exit 5; }
  echo "PLANT OK: $(head -1 "$OUT/pfal5.txt")" | tee -a "$OUT/REGRESION.txt"
  sha256sum -c "$OUT/SHA_BINARIOS.txt" >> "$OUT/REGRESION.txt"
  echo "PRE OK" | tee -a "$OUT/REGRESION.txt" ;;
 m7|m8)
  m=${MODE#m}
  if [ "$m" = 8 ]; then [ -f M7_AUDITADO.txt ] || { echo "ABORTO: falta M7_AUDITADO.txt"; exit 6; }; fi
  # regresion rapida del mismo binario antes del holdout
  for r in 2 3 4 5; do "$C" $r "$OUT/r_ext$r.txt" "$OUT/r_fal$r.txt" "$OUT/r_st$r.txt" > "$OUT/r$r.log"; grep -q "cobertura_ok=1 falsadores=0" "$OUT/r$r.log" || exit 4; done
  date -Is > "$OUT/inicio.txt"
  set +e; "$C" $m "$OUT/HOLDOUT_ext$m.txt" "$OUT/fal$m.txt" "$OUT/HOLDOUT_stats$m.txt" > "$OUT/RESULT_m$m.txt"; rc=$?; set -e
  date -Is > "$OUT/fin.txt"; echo "rc=$rc" >> "$OUT/RESULT_m$m.txt"
  sha256sum "$OUT/HOLDOUT_ext$m.txt" "$OUT/HOLDOUT_stats$m.txt" > "$OUT/SHA_HOLDOUT.txt"   # no se abren: holdout de R_m
  sha256sum "$OUT/RESULT_m$m.txt" "$OUT/fal$m.txt" "$OUT/SHA_HOLDOUT.txt" "$OUT/SHA_BINARIOS.txt" > "$OUT/SHA_SALIDAS.txt"
  cat "$OUT/RESULT_m$m.txt" ;;
 *) echo "modo desconocido"; exit 2 ;;
esac
