"""G5X-V1 — fusiona shards y aplica la regla de decision. Autor: Claude."""
import sys
KEYS=('words','need_pos','g5_fail','ctl_fail','thm_viol','g5_exact')
def load(files):
    c={k:0 for k in KEYS}; hist={}; wit={'g5_witness':[], 'ctl_witness':[]}; shards=set(); m=None
    for f in files:
        for l in open(f):
            t=l.split()
            if not t: continue
            if t[0] in KEYS: c[t[0]]+=int(t[1])
            elif t[0]=='need_hist': hist[int(t[1])]=hist.get(int(t[1]),0)+int(t[2])
            elif t[0] in wit: wit[t[0]].append(t[1])
            elif t[0]=='shard': shards.add(t[1])
            elif t[0]=='m': m=int(t[1])
    return m,c,hist,wit,shards
if __name__=='__main__':
    cmd=sys.argv[1]
    if cmd=='check':   # check m words need_pos g5 ctl thm shard...
        m,c,_,_,_=load(sys.argv[8:]); exp=dict(zip(('words','need_pos','g5_fail','ctl_fail','thm_viol'),map(int,sys.argv[3:8])))
        ok=all(c[k]==v for k,v in exp.items())
        print(' '.join(f"{k}={c[k]}(esp {exp[k]})" for k in exp), '->', 'OK' if ok else 'FALLA'); sys.exit(0 if ok else 1)
    if cmd=='planted': # planted shard... : exito si g5_fail>0
        m,c,_,_,_=load(sys.argv[2:]); print('plantada', 'DETECTADA' if c['g5_fail']>0 else 'NO DETECTADA', c['g5_fail']); sys.exit(0 if c['g5_fail']>0 else 1)
    if cmd=='merge':   # merge salida nshards shard...
        out=sys.argv[2]; ns=int(sys.argv[3]); m,c,hist,wit,shards=load(sys.argv[4:])
        with open(out,'w') as f:
            f.write(f"m {m}\nshards {len(shards)}/{ns}\n")
            for k in KEYS: f.write(f"{k} {c[k]}\n")
            for q in sorted(hist): f.write(f"need_hist {q} {hist[q]}\n")
            for k,v in wit.items():
                for w in v: f.write(f"{k} {w}\n")
        expw=1<<(6*m)
        valid = len(shards)==ns and c['words']==expw and c['thm_viol']==0 and c['ctl_fail']>=1 and len(wit['ctl_witness'])>=1 and (c['g5_fail']==0 or len(wit['g5_witness'])>=1)
        print(f"words={c['words']} (esp {expw}) shards={len(shards)}/{ns} thm_viol={c['thm_viol']} ctl_fail={c['ctl_fail']} need_pos={c['need_pos']} g5_fail={c['g5_fail']}")
        if not valid: print('CORRIDA INVALIDA'); sys.exit(3)
        print('PRE-DECISION:', 'G5 SIN FALLAS en todas las palabras m=%d'%m if c['g5_fail']==0 else 'G5 FALLA en m=%d (pendiente del gate de testigo)'%m)
        sys.exit(0)
