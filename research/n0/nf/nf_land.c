/* NF-LAND-V4 — ejecutor del paisaje de rho bajo movimientos locales (Ruta 2).
   Preregistro: N0_PREREG_NF_LANDSCAPE_V4_2026-10-21.md. Autor: Claude.
   Uso:
     nf_land <m> <M> [--corrupt]   M = 1 (bit), 2 (transposicion), 3 (ambos)
     nf_land <m> rho               lee palabras (x_0..x_{n-1} como '0'/'1') por stdin, imprime rho
   Convencion: el indice entero de una palabra tiene bit i = x_i.
   Salida: lineas "KEY valor" de resumen y luego una linea "TRAP rho size omin" por meseta trampa,
   sin ordenar (run_nf.sh las ordena). Codigo de salida: 0 ok, 2 uso, 3 memoria. Monohilo. */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>

static int m, n, L, MODE;
static uint32_t N;
static uint8_t *rho;
static uint32_t *par;

static int rho_of(uint32_t x) {
  uint32_t mask = 0, wl = (1u << L) - 1;
  for (int i = 0; i <= 4 * m; i++) {
    int S = __builtin_popcount((x >> i) & wl);
    int c = (x >> (i + m)) & 1;
    mask |= 1u << (2 * S + c);
  }
  return __builtin_popcount(mask);
}

static uint32_t rev(uint32_t x) {
  uint32_t y = 0;
  for (int i = 0; i < n; i++) if ((x >> i) & 1) y |= 1u << (n - 1 - i);
  return y;
}
static uint32_t sym(uint32_t x, int g) {
  uint32_t full = N - 1;
  switch (g) { case 0: return x; case 1: return rev(x); case 2: return x ^ full; default: return rev(x) ^ full; }
}

/* vecinos de x segun MODE; devuelve cantidad */
static int neigh(uint32_t x, uint32_t *out) {
  int k = 0;
  if (MODE == 1 || MODE == 3) for (int i = 0; i < n; i++) out[k++] = x ^ (1u << i);
  if (MODE == 2 || MODE == 3)
    for (int i = 0; i + 1 < n; i++)
      if (((x >> i) & 1) != ((x >> (i + 1)) & 1)) out[k++] = x ^ (3u << i);
  return k;
}

static uint32_t find(uint32_t x) {
  while (par[x] != x) { par[x] = par[par[x]]; x = par[x]; }
  return x;
}


int main(int argc, char **argv) {
  if (argc < 3) { fprintf(stderr, "uso: nf_land m M [--corrupt] | nf_land m rho\n"); return 2; }
  m = atoi(argv[1]); n = 6 * m + 1; L = 2 * m + 1;
  if (m < 1 || n > 31) { fprintf(stderr, "m fuera de rango\n"); return 2; }
  N = 1u << n;
  if (strcmp(argv[2], "rho") == 0) {
    char buf[64];
    while (scanf("%63s", buf) == 1) {
      if ((int)strlen(buf) != n) { fprintf(stderr, "largo incorrecto\n"); return 2; }
      uint32_t x = 0;
      for (int i = 0; i < n; i++) if (buf[i] == '1') x |= 1u << i;
      printf("%d\n", rho_of(x));
    }
    return 0;
  }
  MODE = atoi(argv[2]);
  if (MODE < 1 || MODE > 3) { fprintf(stderr, "M debe ser 1, 2 o 3\n"); return 2; }
  int corrupt = (argc > 3 && strcmp(argv[3], "--corrupt") == 0);

  rho = malloc(N); par = malloc((size_t)N * 4);
  uint8_t *up = calloc(N, 1), *reach = calloc(N, 1);
  uint32_t *size = calloc(N, 4), *omin = malloc((size_t)N * 4);
  if (!rho || !par || !up || !reach || !size || !omin) { fprintf(stderr, "sin memoria\n"); return 3; }

  int Mm = 0;
  for (uint32_t x = 0; x < N; x++) { rho[x] = rho_of(x); if (rho[x] > Mm) Mm = rho[x]; }
  uint64_t nmax = 0;
  for (uint32_t x = 0; x < N; x++) if (rho[x] == Mm) nmax++;
  long corrupted = -1;
  if (corrupt) {
    for (uint32_t x = 0; x < N; x++) if (rho[x] == Mm) { rho[x] = 0; corrupted = x; break; }
  }

  uint32_t nb[64];
  for (uint32_t x = 0; x < N; x++) par[x] = x;
  for (uint32_t x = 0; x < N; x++) {
    int k = neigh(x, nb);
    for (int j = 0; j < k; j++) {
      uint32_t y = nb[j];
      if (y > x && rho[y] == rho[x]) { uint32_t a = find(x), b = find(y); if (a != b) { if (a < b) par[b] = a; else par[a] = b; } }
    }
  }
  for (uint32_t x = 0; x < N; x++) par[x] = find(x);

  for (uint32_t x = 0; x < N; x++) {
    uint32_t r = par[x];
    size[r]++;
    if (up[r]) continue;
    int k = neigh(x, nb);
    for (int j = 0; j < k; j++) if (rho[nb[j]] > rho[x]) { up[r] = 1; break; }
  }

  /* P3: alcanzabilidad por niveles decrecientes */
  uint64_t p3 = 0;
  for (int lev = Mm; lev >= 0; lev--) {
    for (uint32_t x = 0; x < N; x++) {
      if (rho[x] != lev) continue;
      uint32_t r = par[x];
      if (reach[r]) continue;
      if (lev == Mm) { reach[r] = 1; continue; }
      int k = neigh(x, nb);
      for (int j = 0; j < k; j++) if (rho[nb[j]] > lev && reach[par[nb[j]]]) { reach[r] = 1; break; }
    }
  }
  for (uint32_t x = 0; x < N; x++) if (reach[par[x]]) p3++;

  /* mesetas, sumideros, trampas y orbitas */
  uint64_t nplat = 0, nsink = 0, ntrap = 0, wtrap = 0, p4 = 0;
  for (uint32_t x = 0; x < N; x++) omin[x] = 0xFFFFFFFFu;
  for (uint32_t x = 0; x < N; x++) {
    uint32_t r = par[x];
    if (up[r]) continue;
    for (int g = 0; g < 4; g++) { uint32_t v = sym(x, g); if (v < omin[r]) omin[r] = v; }
  }
  uint64_t depth[64] = {0};
  for (uint32_t r = 0; r < N; r++) {
    if (par[r] != r) continue;
    nplat++;
    if (up[r]) continue;
    nsink++;
    if (rho[r] == Mm) { p4++; continue; }
    ntrap++; wtrap += size[r]; depth[Mm - rho[r]]++;
  }
  uint8_t *seen = calloc(N / 8 + 1, 1);   /* orbitas: un bit por valor de omin */
  if (!seen) { fprintf(stderr, "sin memoria\n"); return 3; }
  uint64_t norb = 0, c3fail = 0;
  for (uint32_t r = 0; r < N; r++) {
    if (par[r] != r || up[r] || rho[r] == Mm) continue;
    uint32_t o = omin[r];
    if (!(seen[o >> 3] & (1u << (o & 7)))) { seen[o >> 3] |= 1u << (o & 7); norb++; }
    for (int g = 1; g < 4; g++) {           /* C3: cierre por simetria */
      uint32_t ry = par[sym(r, g)];
      if (up[ry] || rho[ry] != rho[r] || size[ry] != size[r]) c3fail++;
    }
  }

  /* C6: 0^n y 1^n */
  int c6 = 1;
  uint32_t ends[2] = {0, N - 1};
  for (int e = 0; e < 2; e++) {
    uint32_t r = par[ends[e]];
    int trap_iso = (!up[r] && rho[r] < Mm && size[r] == 1 && rho[r] == 1);
    if (MODE == 2 && !trap_iso) c6 = 0;
  }

  printf("m %d\nmode %d\nwords %u\nMm %d\nwords_at_Mm %llu\n", m, MODE, N, Mm, (unsigned long long)nmax);
  if (corrupt) printf("corrupted_word %ld\n", corrupted);
  printf("plateaus %llu\nsinks %llu\nP4_max_plateaus %llu\nP1_traps %llu\nP1_words_in_traps %llu\nP1_trap_orbits %llu\n",
    (unsigned long long)nplat, (unsigned long long)nsink, (unsigned long long)p4,
    (unsigned long long)ntrap, (unsigned long long)wtrap, (unsigned long long)norb);
  for (int d = 1; d < 64; d++) if (depth[d]) printf("P2_depth %d %llu\n", d, (unsigned long long)depth[d]);
  printf("P3_reach_words %llu\n", (unsigned long long)p3);
  printf("C3_sym_failures %llu\n", (unsigned long long)c3fail);
  if (MODE == 2) printf("C6_ends_isolated_traps %s\n", c6 ? "OK" : "FALLA");
  if (ntrap == 0) printf("C7_P3_full %s\n", p3 == N ? "OK" : "FALLA");
  for (uint32_t r = 0; r < N; r++)
    if (par[r] == r && !up[r] && rho[r] != Mm) printf("TRAP %u %u %u\n", rho[r], size[r], omin[r]);
  return 0;
}
