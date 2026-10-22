"""NF-LAND-V4 — referencia independiente en Python (controles C2 y C4).
Preregistro: N0_PREREG_NF_LANDSCAPE_V4_2026-10-21.md. Autor: Claude.
Trabaja con cadenas x_0..x_{n-1} y BFS explícitos; no comparte código con nf_land.c.
Uso:
  python3 nf_ref.py c2 <ruta_nf_land>      compara rho (todas las palabras m=2; 10.000 aleatorias m=3,4)
  python3 nf_ref.py land <m> <M>            paisaje por fuerza bruta (pensado para m=2)
"""
import sys, random, subprocess
from collections import deque


def rho_defcore(s, m):
    L = 2 * m + 1
    x = [int(c) for c in s]
    classes = set()
    for i in range(4 * m + 1):
        classes.add((sum(x[i:i + L]), x[i + m]))
    return len(classes)


def to_int(s):  # bit i = x_i
    return sum(1 << i for i, c in enumerate(s) if c == '1')


def syms(s):
    r = s[::-1]
    comp = lambda t: ''.join('1' if c == '0' else '0' for c in t)
    return [s, r, comp(s), comp(r)]


def neighbors(s, M):
    out = []
    if M in (1, 3):
        for i in range(len(s)):
            out.append(s[:i] + ('1' if s[i] == '0' else '0') + s[i + 1:])
    if M in (2, 3):
        for i in range(len(s) - 1):
            if s[i] != s[i + 1]:
                out.append(s[:i] + s[i + 1] + s[i] + s[i + 2:])
    return out


def land(m, M):
    n = 6 * m + 1
    words = [format(k, '0%db' % n) for k in range(1 << n)]
    R = {w: rho_defcore(w, m) for w in words}
    Mm = max(R.values())
    comp = {}
    plats = []
    for w in words:
        if w in comp:
            continue
        cid = len(plats); members = [w]; comp[w] = cid; dq = deque([w])
        while dq:
            a = dq.popleft()
            for b in neighbors(a, M):
                if b not in comp and R[b] == R[a]:
                    comp[b] = cid; members.append(b); dq.append(b)
        plats.append(members)
    up = [any(R[b] > R[a] for a in P for b in neighbors(a, M)) for P in plats]
    # P3: BFS hacia atrás desde las palabras con rho = Mm (x -> y si y vecino de x y R[y] >= R[x])
    reach = set(w for w in words if R[w] == Mm)
    dq = deque(reach)
    while dq:
        y = dq.popleft()
        for x in neighbors(y, M):  # los movimientos son simétricos
            if x not in reach and R[y] >= R[x]:
                reach.add(x); dq.append(x)
    traps = []
    sinks = 0; p4 = 0; depth = {}
    for cid, P in enumerate(plats):
        if up[cid]:
            continue
        sinks += 1
        r = R[P[0]]
        if r == Mm:
            p4 += 1; continue
        om = min(to_int(g) for w in P for g in syms(w))
        traps.append((r, len(P), om))
        depth[Mm - r] = depth.get(Mm - r, 0) + 1
    traps.sort()
    print("Mm %d" % Mm)
    print("words_at_Mm %d" % sum(1 for w in words if R[w] == Mm))
    print("plateaus %d" % len(plats))
    print("sinks %d" % sinks)
    print("P4_max_plateaus %d" % p4)
    print("P1_traps %d" % len(traps))
    print("P1_words_in_traps %d" % sum(t[1] for t in traps))
    print("P1_trap_orbits %d" % len(set(t[2] for t in traps)))
    for d in sorted(depth):
        print("P2_depth %d %d" % (d, depth[d]))
    print("P3_reach_words %d" % len(reach))
    for t in traps:
        print("TRAP %d %d %d" % t)


def c2(exe):
    fails = 0; total = 0
    rng = random.Random(20261021)
    for m, sample in ((2, None), (3, 10000), (4, 10000)):
        n = 6 * m + 1
        if sample is None:
            ws = [format(k, '0%db' % n)[::-1] for k in range(1 << n)]
        else:
            ws = [''.join(rng.choice('01') for _ in range(n)) for _ in range(sample)]
        out = subprocess.run([exe, str(m), 'rho'], input='\n'.join(ws) + '\n',
                             capture_output=True, text=True, check=True).stdout.split()
        for w, v in zip(ws, out):
            total += 1
            if int(v) != rho_defcore(w, m):
                fails += 1
        if len(out) != len(ws):
            fails += abs(len(out) - len(ws))
    print("C2 palabras %d discrepancias %d -> %s" % (total, fails, "OK" if fails == 0 else "FALLA"))
    return fails == 0


if __name__ == '__main__':
    if sys.argv[1] == 'c2':
        sys.exit(0 if c2(sys.argv[2]) else 1)
    elif sys.argv[1] == 'land':
        land(int(sys.argv[2]), int(sys.argv[3]))
