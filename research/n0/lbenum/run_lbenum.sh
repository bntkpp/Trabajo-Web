#!/usr/bin/env bash
# LBENUM-V2 — censo exacto de LC1/LC2 en el puente largo para m=7 y m=8.
# Preregistro: N0_PREREG_LBENUM_LC12_V2_2026-10-21.md. NO CORRER ANTES DEL SELLO.
# Uso (en esta carpeta): LB_SEAL_CONFIRMED=YES bash run_lbenum.sh
# Salida: 0 OK; 1 control fallido; 2 sin sello o manifiesto distinto.
set -u
here=$(cd "$(dirname "$0")" && pwd); cd "$here"
sha256sum -c MANIFEST.sha256 || { echo "MANIFIESTO DISTINTO: el codigo no es el congelado"; exit 2; }
[ "${LB_SEAL_CONFIRMED:-}" = "YES" ] || { echo "Falta LB_SEAL_CONFIRMED=YES (sello del preregistro)"; exit 2; }
out="$here/salida_lbenum"; mkdir -p "$out"
gcc -O2 -o "$out/lb_enum" lb_enum.c && gcc -O2 -DPLANT -o "$out/lb_enum_plant" lb_enum.c || { echo "NO COMPILA"; exit 1; }
{ echo "gcc: $(gcc --version | head -n 1)"; echo "python: $(python3 --version 2>&1)"; echo "uname: $(uname -a)";
  echo "cpu: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)"; echo "nproc: $(nproc)"; echo "inicio: $(date -Is)"; } > "$out/ENTORNO.txt"
fail=0; falla() { echo "$1" | tee -a "$out/FALLAS.txt"; fail=1; }
# C1: reproducir el censo certificado m=3..6 (x2)
for m in 3 4 5 6; do
  "$out/lb_enum" $m 0 1 "$out/ctl_m$m.txt" || falla "C1 m=$m ejecucion"
  python3 -I lbtools.py cmp ref/censo_m$m.txt "$out/ctl_m$m.txt" | sed "s/^/C1 m=$m: /" | tee -a "$out/CONTROLES.txt"
  [ "${PIPESTATUS[0]}" -eq 0 ] || falla "C1 m=$m FALLA"
done
# C2: falla plantada en m=5 debe romper la coincidencia
"$out/lb_enum_plant" 5 0 1 "$out/plant_m5.txt"
python3 -I lbtools.py differs ref/censo_m5.txt "$out/plant_m5.txt" | sed "s/^/C2: /" | tee -a "$out/CONTROLES.txt"
[ "${PIPESTATUS[0]}" -eq 0 ] || falla "C2 FALLA (plantada no detectada)"
if [ $fail -ne 0 ]; then echo "CONTROLES: FALLA — no se corre m=7 ni m=8"; exit 1; fi
echo "CONTROLES: OK" | tee -a "$out/CONTROLES.txt"
# Corridas principales: 2 shards en paralelo por m
for m in 7 8; do
  t0=$(date +%s)
  "$out/lb_enum" $m 0 2 "$out/m${m}_s0.txt" & p0=$!
  "$out/lb_enum" $m 1 2 "$out/m${m}_s1.txt" & p1=$!
  wait $p0; r0=$?; wait $p1; r1=$?
  echo "m=$m rc=$r0,$r1 segundos=$(( $(date +%s) - t0 ))" >> "$out/ENTORNO.txt"
  [ $r0 -eq 0 ] && [ $r1 -eq 0 ] || falla "m=$m ejecucion"
  python3 -I lbtools.py merge "$out/RESULT_m$m.txt" "$out/m${m}_s0.txt" "$out/m${m}_s1.txt" || { falla "m=$m merge"; exit 1; }
  p4=$(awk '$1=="P4_fail"{print $2}' "$out/RESULT_m$m.txt")
  if [ "$p4" != "0" ]; then falla "C3 m=$m P4_fail=$p4 — la corrida no vale"; sha256sum "$out"/*.txt > "$out/SHA_SALIDAS.txt"; exit 1; fi
  echo "== m=$m"; head -n 7 "$out/RESULT_m$m.txt"
done
echo "fin: $(date -Is)" >> "$out/ENTORNO.txt"
sha256sum "$out"/*.txt > "$out/SHA_SALIDAS.txt"
[ $fail -eq 0 ] && exit 0 || exit 1
