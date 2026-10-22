#!/usr/bin/env bash
# XDELX-V1 — G5-EXTREME-DELETE exhaustivo sobre todas las palabras de m=6.
# Preregistro: N0_PREREG_XDELX_M6_V1_2026-10-22.md. NO CORRER ANTES DEL SELLO.
# Uso (en esta carpeta, copia limpia del commit sellado): XDELX_SEAL_CONFIRMED=YES bash run_xdelx.sh [procesos]
# Salida: 0 corrida valida (ver DECISION); 1 control fallido o corrida invalida; 2 sin sello, manifiesto distinto o salida preexistente.
set -u
here=$(cd "$(dirname "$0")" && pwd); cd "$here"
sha256sum -c MANIFEST.sha256 || { echo "MANIFIESTO DISTINTO: el codigo no es el congelado"; exit 2; }
[ "${XDELX_SEAL_CONFIRMED:-}" = "YES" ] || { echo "Falta XDELX_SEAL_CONFIRMED=YES (sello del preregistro)"; exit 2; }
out="$here/salida_xdelx"
if [ -e "$out" ]; then echo "SALIDA PREEXISTENTE: usar checkout/carpeta limpia"; exit 2; fi
mkdir "$out"
P=${1:-$(nproc)}; NS=64
CF="-std=c17 -O2 -Wall -Wextra -Werror"
gcc $CF -o "$out/xdelx" xdelx.c && gcc $CF -DPLANT -o "$out/xdelx_plant" xdelx.c || { echo "NO COMPILA"; exit 1; }
sha256sum "$out/xdelx" "$out/xdelx_plant" > "$out/SHA_BINARIOS.txt"
{ echo "gcc: $(gcc --version | head -n 1)"; echo "python: $(python3 --version 2>&1)"; echo "uname: $(uname -a)";
  echo "cpu: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)"; echo "nproc: $(nproc) usados: $P"; echo "inicio: $(date -Is)"; } > "$out/ENTORNO.txt"
fail=0; falla() { echo "$1" | tee -a "$out/FALLAS.txt"; fail=1; }
# C1: referencias de desarrollo m=3,4,5 (xdel.c, mismo match.h)
c1() { m=$1; shift; "$out/xdelx" $m 0 1 "$out/ctl_m$m.txt" || falla "C1 m=$m ejecucion"
  python3 -I xtools.py check $m "$@" "$out/ctl_m$m.txt" | sed "s/^/C1 m=$m: /" | tee -a "$out/CONTROLES.txt"; [ "${PIPESTATUS[0]}" -eq 0 ] || falla "C1 m=$m FALLA"; }
c1 3 262144 0 69 0 3 31 262110
c1 4 16777216 0 352 0 10 221 16776985
c1 5 1073741824 0 2266 0 68 1711 1073740045
# C1b: recuento Python independiente (sin match.h) en m=3 y m=4 debe coincidir exactamente con el C
for m in 3 4; do r=$(python3 -I vxdel.py --census $m) || falla "C1b m=$m ejecucion"
  python3 -I xtools.py pycmp "$r" "$out/ctl_m$m.txt" | sed "s/^/C1b m=$m: /" | tee -a "$out/CONTROLES.txt"; [ "${PIPESTATUS[0]}" -eq 0 ] || falla "C1b m=$m FALLA"; done
# C2: falla plantada (bloque sin +1 en ambas orientaciones) en m=4 debe producir xdel_fail>0
"$out/xdelx_plant" 4 0 1 "$out/plant_m4.txt"
python3 -I xtools.py planted "$out/plant_m4.txt" | sed "s/^/C2: /" | tee -a "$out/CONTROLES.txt"; [ "${PIPESTATUS[0]}" -eq 0 ] || falla "C2 FALLA"
if [ $fail -ne 0 ]; then echo "CONTROLES: FALLA — no se corre m=6"; exit 1; fi
echo "CONTROLES: OK" | tee -a "$out/CONTROLES.txt"
# Corrida principal: m=6, 64 shards
t0=$(date +%s)
seq 0 $((NS-1)) | xargs -P "$P" -I{} "$out/xdelx" 6 {} $NS "$out/m6_s{}.txt" || falla "m=6 ejecucion"
echo "m=6 segundos=$(( $(date +%s) - t0 ))" >> "$out/ENTORNO.txt"
python3 -I xtools.py merge "$out/RESULT_m6.txt" $NS "$out"/m6_s*.txt | tee "$out/DECISION.txt"; rc=${PIPESTATUS[0]}
[ $rc -eq 0 ] || falla "m=6 corrida invalida (rc=$rc)"
# Gates de testigos (Python independiente, sin match.h)
if [ $fail -eq 0 ]; then
  wc=$(awk '$1=="ctl_witness"{print $2; exit}' "$out/RESULT_m6.txt")
  python3 -I vxdel.py --gate ctl "$wc" >> "$out/TESTIGOS.txt" 2>&1 || falla "GATE control: testigo sin +1 no confirmado — CORRIDA INVALIDA"
  xfn=$(awk '$1=="xdel_fail"{print $2}' "$out/RESULT_m6.txt")
  if [ "$xfn" != "0" ]; then
    wx=$(awk '$1=="xdel_witness"{print $2; exit}' "$out/RESULT_m6.txt")
    if python3 -I vxdel.py --gate xdel "$wx" >> "$out/TESTIGOS.txt" 2>&1; then echo "DECISION: EXTREME-DELETE REFUTADO en m=6 (testigo confirmado: $wx)" | tee -a "$out/DECISION.txt"
    else falla "GATE XDEL: testigo no confirmado — CORRIDA INVALIDA, sin decision"; fi
  else echo "DECISION: EXTREME-DELETE SIN FALLAS en todas las palabras de m=6 (Observacion exhaustiva)" | tee -a "$out/DECISION.txt"; fi
fi
[ $fail -eq 0 ] || echo "CORRIDA INVALIDA: sin decision cientifica" | tee -a "$out/DECISION.txt"
echo "fin: $(date -Is)" >> "$out/ENTORNO.txt"
sha256sum "$out"/*.txt > "$out/SHA_SALIDAS.txt"
[ $fail -eq 0 ] && exit 0 || exit 1
