"""XDELX-V1 — fusiona shards, compara con referencias y aplica la regla de decision. Autor: Claude."""
import sys
KEYS=('words','xdel_fail','ctl_fail','thm_viol','only_A','only_B','both')
def load(files):
    c={k:0 for k in KEYS}; wit={'xdel_witness':[],'ctl_witness':[]}; shards=set(); m=None
    for f in files:
        for l in open(f):
            t=l.split()
            if not t: continue
            if t[0] in KEYS: c[t[0]]+=int(t[1])
            elif t[0] in wit: wit[t[0]].append(t[1])
            elif t[0]=='shard': shards.add(t[1])
            elif t[0]=='m': m=int(t[1])
    return m,c,wit,shards
if __name__=='__main__':
    cmd=sys.argv[1]
    if cmd=='check':   # check m words xdel ctl thm onlyA onlyB both archivo
        m,c,_,_=load(sys.argv[10:]); exp=dict(zip(KEYS,map(int,sys.argv[3:10])))
        ok=all(c[k]==exp[k] for k in KEYS)
        print(' '.join(f"{k}={c[k]}(esp {exp[k]})" for k in KEYS),'->','OK' if ok else 'FALLA'); sys.exit(0 if ok else 1)
    if cmd=='pycmp':   # pycmp "salida de vxdel --census" archivo_C : compara recuento Python independiente con C
        py=list(map(int,sys.argv[2].split())); m,c,_,_=load(sys.argv[3:])
        cc=[c['words'],c['xdel_fail'],c['ctl_fail'],c['only_A'],c['only_B'],c['both']]
        print('python',py,'C',cc,'->','OK' if py==cc else 'FALLA'); sys.exit(0 if py==cc else 1)
    if cmd=='planted':
        m,c,_,_=load(sys.argv[2:]); print('plantada','DETECTADA' if c['xdel_fail']>0 else 'NO DETECTADA',c['xdel_fail']); sys.exit(0 if c['xdel_fail']>0 else 1)
    if cmd=='merge':   # merge salida nshards shard...
        out=sys.argv[2]; ns=int(sys.argv[3]); m,c,wit,shards=load(sys.argv[4:])
        with open(out,'w') as f:
            f.write(f"m {m}\nshards {len(shards)}/{ns}\n")
            for k in KEYS: f.write(f"{k} {c[k]}\n")
            for k,v in wit.items():
                for w in v: f.write(f"{k} {w}\n")
        expw=1<<(6*m)
        parts=c['xdel_fail']+c['only_A']+c['only_B']+c['both']
        valid = (len(shards)==ns and c['words']==expw and parts==expw and c['thm_viol']==0 and c['ctl_fail']>=1
                 and len(wit['ctl_witness'])>=1 and (c['xdel_fail']==0 or len(wit['xdel_witness'])>=1))
        print(f"words={c['words']} (esp {expw}) shards={len(shards)}/{ns} particion={parts} thm_viol={c['thm_viol']} ctl_fail={c['ctl_fail']} xdel_fail={c['xdel_fail']} only_A={c['only_A']} only_B={c['only_B']}")
        if not valid: print('CORRIDA INVALIDA'); sys.exit(3)
        print('PRE-DECISION:','XDEL SIN FALLAS en todas las palabras m=%d'%m if c['xdel_fail']==0 else 'XDEL FALLA en m=%d (pendiente del gate de testigo)'%m)
        sys.exit(0)
