"""LBENUM-V1 — utilidades: fusionar shards y comparar con el censo certificado (x2). Autor: Claude."""
import sys
def load_dist(files, mult=1):
    d={}; cnt={}
    for f in files:
        for l in open(f):
            t=l.split()
            if not t: continue
            if t[0]=='dist':
                k=tuple(map(int,t[1:5])); d[k]=d.get(k,0)+int(t[5])*mult
            elif t[0] in ('pairs_minfirst','viol_P1','viol_P2','eq_Wcore_m2','P4_fail'):
                cnt[t[0]]=cnt.get(t[0],0)+int(t[1])
            elif t[0] in ('minWcore','minWext_eq'):
                cnt[t[0]]=min(cnt.get(t[0],99),int(t[1]))
    return d,cnt
if __name__=='__main__':
    if sys.argv[1]=='cmp':          # cmp censo.txt shard1 [shard2...]
        c,_=load_dist([sys.argv[2]]); e,cnt=load_dist(sys.argv[3:],2)
        ok = (c==e) and cnt.get('P4_fail',1)==0
        print(f"claves enum={len(e)} censo={len(c)} identicas={c==e} pares={sum(e.values())} censo={sum(c.values())} P4_fail={cnt.get('P4_fail')} -> {'OK' if ok else 'FALLA'}")
        sys.exit(0 if ok else 1)
    if sys.argv[1]=='differs':      # differs censo.txt shard : exito si NO coincide (falla plantada)
        c,_=load_dist([sys.argv[2]]); e,_=load_dist(sys.argv[3:],2)
        print("plantada", "DETECTADA" if c!=e else "NO DETECTADA"); sys.exit(0 if c!=e else 1)
    if sys.argv[1]=='merge':        # merge salida shard1 shard2 ...
        d,cnt=load_dist(sys.argv[3:])
        with open(sys.argv[2],'w') as f:
            for k in ('pairs_minfirst','minWcore','viol_P1','eq_Wcore_m2','minWext_eq','viol_P2','P4_fail'):
                f.write(f"{k} {cnt.get(k)}\n")
            for k in sorted(d): f.write("dist %d %d %d %d %d\n"%(k+(d[k],)))
