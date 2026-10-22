#!/usr/bin/env bash
# G5X-V2 — G5 exhaustivo sobre todas las palabras de m=6.
# Preregistro: N0_PREREG_G5X_M6_V2_2026-10-22.md. NO CORRER ANTES DEL SELLO.
# Uso (en esta carpeta): G5X_SEAL_CONFIRMED=YES bash run_g5x.sh [procesos]
# Salida: 0 corrida valida (ver DECISION); 1 control fallido o corrida invalida; 2 sin sello o manifiesto distinto.
set -u
here=$(cd "$(dirname "$0")" && pwd); cd "$here"
sha256sum -c MANIFEST.sha256 || { echo "MANIFIESTO DISTINTO: el codigo no es el congelado"; exit 2; }
[ "${G5X_SEAL_CONFIRMED:-}" = "YES" ] || { echo "Falta G5X_SEAL_CONFIRMED=YES (sello del preregistro)"; exit 2; }
P=${1:-$(nproc)}; NS=64
out="$here/salida_g5x"
if [ -e "$out" ]; then echo "SALIDA PREEXISTENTE: usar checkout/carpeta limpia"; exit 2; fi
mkdir "$out"
gcc -O2 -o "$out/g5x" g5x.c && gcc -O2 -DPLANT -o "$out/g5x_plant" g5x.c || { echo "NO COMPILA"; exit 1; }
sha256sum "$out/g5x" "$out/g5x_plant" > "$out/SHA_BINARIOS.txt"
{ echo "gcc: $(gcc --version | head -n 1)"; echo "python: $(python3 --version 2>&1)"; echo "uname: $(uname -a)";
  echo "cpu: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)"; echo "nproc: $(nproc) usados: $P"; echo "inicio: $(date -Is)"; } > "$out/ENTORNO.txt"
fail=0; falla() { echo "$1" | tee -a "$out/FALLAS.txt"; fail=1; }
# C1: valores de referencia m=3,4,5 (obtenidos en desarrollo con otro codigo: g2.c/g3b.c)
c1() { m=$1; shift; "$out/g5x" $m 0 1 "$out/ctl_m$m.txt" || falla "C1 m=$m ejecucion"
  python3 -I g5tools.py check $m "$@" "$out/ctl_m$m.txt" | sed "s/^/C1 m=$m: /" | tee -a "$out/CONTROLES.txt"; [ "${PIPESTATUS[0]}" -eq 0 ] || falla "C1 m=$m FALLA"; }
c1 3 262144 582 0 3 0
c1 4 16777216 26746 0 6 0
c1 5 1073741824 994316 0 27 0
# C2: falla plantada (need+1) en m=4 debe producir fallas G5
"$out/g5x_plant" 4 0 1 "$out/plant_m4.txt"
python3 -I g5tools.py planted "$out/plant_m4.txt" | sed "s/^/C2: /" | tee -a "$out/CONTROLES.txt"; [ "${PIPESTATUS[0]}" -eq 0 ] || falla "C2 FALLA"
if [ $fail -ne 0 ]; then echo "CONTROLES: FALLA — no se corre m=6"; exit 1; fi
echo "CONTROLES: OK" | tee -a "$out/CONTROLES.txt"
# Corrida principal: m=6, 64 shards, P procesos en paralelo
t0=$(date +%s)
seq 0 $((NS-1)) | xargs -P "$P" -I{} "$out/g5x" 6 {} $NS "$out/m6_s{}.txt" || falla "m=6 ejecucion"
echo "m=6 segundos=$(( $(date +%s) - t0 ))" >> "$out/ENTORNO.txt"
python3 -I g5tools.py merge "$out/RESULT_m6.txt" $NS "$out"/m6_s*.txt | tee "$out/DECISION.txt"; rc=${PIPESTATUS[0]}
[ $rc -eq 0 ] || falla "m=6 corrida invalida (rc=$rc)"
# Gates de testigos (Python independiente, desde DEF-CORE): obligatorios para que la corrida valga
if [ $fail -eq 0 ]; then
  wc=$(awk '$1=="ctl_witness"{print $2; exit}' "$out/RESULT_m6.txt")
  python3 -I verify.py --gate 6 "$wc" >> "$out/TESTIGOS.txt" 2>&1 || falla "GATE control: testigo radio m no confirmado — CORRIDA INVALIDA"
  g5f=$(awk '$1=="g5_fail"{print $2}' "$out/RESULT_m6.txt")
  if [ "$g5f" != "0" ]; then
    wg=$(awk '$1=="g5_witness"{print $2; exit}' "$out/RESULT_m6.txt")
    if python3 -I verify.py --gate 7 "$wg" >> "$out/TESTIGOS.txt" 2>&1; then echo "DECISION: G5 REFUTADO en m=6 (testigo confirmado: $wg)" | tee -a "$out/DECISION.txt"
    else falla "GATE G5: testigo no confirmado — CORRIDA INVALIDA, sin decision"; fi
  else echo "DECISION: G5 SIN FALLAS en todas las palabras de m=6 (Observacion exhaustiva)" | tee -a "$out/DECISION.txt"; fi
fi
[ $fail -eq 0 ] || echo "CORRIDA INVALIDA: sin decision cientifica" | tee -a "$out/DECISION.txt"
echo "fin: $(date -Is)" >> "$out/ENTORNO.txt"
sha256sum "$out"/*.txt > "$out/SHA_SALIDAS.txt"
[ $fail -eq 0 ] && exit 0 || exit 1
