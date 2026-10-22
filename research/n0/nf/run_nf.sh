#!/usr/bin/env bash
# NF-LAND-V4 — orquestador. Corre controles C1–C8 y, solo si pasan, imprime las medidas primarias.
# Preregistro: N0_PREREG_NF_LANDSCAPE_V4_2026-10-21.md. NO CORRER ANTES DEL SELLO.
# Uso (en la carpeta nf/): NF_SEAL_CONFIRMED=YES bash run_nf.sh
# Codigos de salida: 0 controles OK; 1 control fallido; 2 sin sello o manifiesto distinto; 3 aborto por memoria.
set -u
here=$(cd "$(dirname "$0")" && pwd); cd "$here"
sha256sum -c MANIFEST.sha256 || { echo "MANIFIESTO DISTINTO: el codigo no es el congelado"; exit 2; }
[ "${NF_SEAL_CONFIRMED:-}" = "YES" ] || { echo "Falta NF_SEAL_CONFIRMED=YES (sello del preregistro)"; exit 2; }
out="$here/salida_nf"; mkdir -p "$out"
gcc -O2 -o "$out/nf_land" nf_land.c || { echo "NO COMPILA"; exit 1; }
{ echo "gcc: $(gcc --version | head -n 1)"; echo "flags: -O2 (monohilo)"; echo "python: $(python3 --version 2>&1)"
  echo "uname: $(uname -a)"; echo "cpu: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)"
  echo "nproc: $(nproc)"; echo "ram: $(free -m | awk '/Mem:/{print $2}') MiB"; echo "inicio: $(date -Is)"; } > "$out/ENTORNO.txt"
fail=0
FAILS="$out/FALLAS.txt"; : > "$FAILS"
falla() { echo "$1" | tee -a "$FAILS"; fail=1; }
# Normaliza una salida: lineas de resumen sin claves de control, luego TRAP ordenadas
norm() { grep -v -E '^((m|mode|words|corrupted_word) |C[0-9]_|TRAP )' "$1"; grep '^TRAP ' "$1" | LC_ALL=C sort -k2,2n -k3,3n -k4,4n; }
corre() {  # corre m M salida [--corrupt], con tope de memoria de 1 GiB
  local t0; t0=$(date +%s)
  ( ulimit -v 1048576; exec "$out/nf_land" "$1" "$2" ${4:-} ) > "$3"; local rc=$?
  echo "m=$1 M$2 ${4:-} rc=$rc segundos=$(( $(date +%s) - t0 ))" >> "$out/ENTORNO.txt"
  if [ $rc -eq 3 ] || [ $rc -ge 128 ]; then echo "ABORTO (rc=$rc): memoria o senal; regla de aborto del preregistro"; exit 3; fi
  [ $rc -eq 0 ] || falla "ejecutor m=$1 M$2 rc=$rc"
}
# C2
python3 -I nf_ref.py c2 "$out/nf_land" > "$out/C2.txt" 2>&1
cat "$out/C2.txt"; grep -q -- "-> OK" "$out/C2.txt" || falla "C2 FALLA"
# C4 (m=2, M1/M2/M3)
for M in 1 2 3; do
  corre 2 $M "$out/c_m2_M$M.txt"
  python3 -I nf_ref.py land 2 $M > "$out/py_m2_M$M.txt" || falla "referencia Python m=2 M$M"
  if diff <(norm "$out/c_m2_M$M.txt") <(norm "$out/py_m2_M$M.txt") > /dev/null; then echo "C4 M$M OK"; else falla "C4 M$M FALLA"; fi
done
# C5 (falla plantada: debe producir discrepancia)
corre 2 1 "$out/c_m2_M1_corrupt.txt" --corrupt
if diff <(norm "$out/c_m2_M1_corrupt.txt") <(norm "$out/py_m2_M1.txt") > /dev/null; then falla "C5 FALLA (la corrupcion no se detecto)"; else echo "C5 OK (corrupcion detectada)"; fi
# corridas m=2,3,4 (M1 y M3 primarias; M2 control negativo)
for m in 2 3 4; do for M in 1 2 3; do corre $m $M "$out/nf_m${m}_M$M.txt"; done; done
# C1, C3, C6, C7, C8
for m in 2 3 4; do
  want=$((3*m+2))
  for M in 1 2 3; do
    f="$out/nf_m${m}_M$M.txt"
    got=$(awk '$1=="Mm"{print $2}' "$f"); [ "$got" = "$want" ] || falla "C1 m=$m M$M FALLA ($got != $want)"
    c3=$(awk '$1=="C3_sym_failures"{print $2}' "$f"); [ "$c3" = "0" ] || falla "C3 m=$m M$M FALLA"
    grep -q "C7_P3_full FALLA" "$f" && falla "C7 m=$m M$M FALLA"
  done
  grep -q "C6_ends_isolated_traps OK" "$out/nf_m${m}_M2.txt" || falla "C6 m=$m FALLA"
  t1=$(awk '$1=="P1_traps"{print $2}' "$out/nf_m${m}_M1.txt"); t3=$(awk '$1=="P1_traps"{print $2}' "$out/nf_m${m}_M3.txt")
  r1=$(awk '$1=="P3_reach_words"{print $2}' "$out/nf_m${m}_M1.txt"); r2=$(awk '$1=="P3_reach_words"{print $2}' "$out/nf_m${m}_M2.txt")
  r3=$(awk '$1=="P3_reach_words"{print $2}' "$out/nf_m${m}_M3.txt")
  if [ "$t1" = "0" ] && [ "$t3" != "0" ]; then falla "C8 m=$m FALLA (M1 sin trampas y M3 con trampas)"; fi
  if [ "$r3" -lt "$r1" ] || [ "$r3" -lt "$r2" ]; then falla "C8 m=$m FALLA (P3 no monotono)"; fi
done
echo "fin: $(date -Is)" >> "$out/ENTORNO.txt"
sha256sum "$out"/*.txt > "$out/SHA_SALIDAS.txt"
if [ $fail -ne 0 ]; then echo "CONTROLES: FALLA — no se reporta ninguna medida primaria"; exit 1; fi
echo "CONTROLES: OK"
for m in 2 3 4; do for M in 1 3; do
  echo "== m=$m M$M"; grep -E '^(Mm|P1_|P2_|P3_|P4_)' "$out/nf_m${m}_M$M.txt"
done; done
exit 0
